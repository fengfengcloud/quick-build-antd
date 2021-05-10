import { message } from 'antd';
import React, { useContext } from 'react';
import { DragPreviewImage, useDrag, useDrop } from 'react-dnd';
import type { ModuleStateContext } from '..';
import { ModuleContext } from '..';
import { PARENT_RECORD } from '../constants';
import type { ModuleState } from '../data';
import { DetailModelContext } from '../detailGrid/model';
import { canMoveRowToChangeRecno, getModuleInfo } from '../modules';

const type = 'ModuleDragableBodyRow';
/**
 *
 * 树形记录的拖动，或者有 orderfield的可以进行拖动。在可修改的情况下可以拖动到导航进行修改字段的值
 *
 * @param param0
 */
export const DragableBodyRow = ({
  index,
  record,
  moveRow,
  moveToNewParent,
  className,
  style,
  ...restProps
}: {
  index: number;
  record: any;
  moveRow: Function;
  moveToNewParent: Function;
  className: string;
  style: any;
}) => {
  const detailContext = useContext(DetailModelContext);
  const context = useContext<ModuleStateContext>(ModuleContext);
  let state: ModuleState;
  // let dispatch: any;
  if (detailContext && detailContext.moduleState) {
    state = detailContext.moduleState;
    // dispatch = detailContext.dispatch;
  } else {
    state = context.state;
    // dispatch = context.dispatch;
  }
  const acceptType = state.currSetting.canDragChangeRecno
    ? type + state.moduleName
    : `${type + state.moduleName}toNavigate`;
  const ref: any = React.useRef();
  const moduleInfo = getModuleInfo(state.moduleName);
  const { istreemodel } = moduleInfo;
  // 记录之间互相拖动顺序
  const [{ isMoveOver, canMoveDrop: canMove, dropClassName }, moveDrop] = useDrop({
    accept: acceptType,
    canDrop: (item, monitor) => {
      const { record: dragRecord } = monitor.getItem() || {};
      // console.log(monitor.getItem());
      return dragRecord && record;
    },
    collect: (monitor) => {
      const { index: dragIndex, record: dragRecord } = monitor.getItem() || {};
      if (!istreemodel) {
        // 如果是正常模块，不是树形结构
        if (dragIndex === index) {
          return {};
        }
        return {
          isMoveOver: monitor.isOver(),
          canMoveDrop: dragRecord && record,
          dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
        };
      }
      if (record && dragRecord) {
        // 是树形结构，判断是不是在同一个节点之下
        if (record[PARENT_RECORD] === dragRecord[PARENT_RECORD]) {
          // 在同一个节点之下
          if (dragIndex === index) {
            return {};
          }
          // 顺序移动
          return {
            isMoveOver: monitor.isOver(),
            canMoveDrop: dragRecord && record,
            dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
          };
        }
        // 在不同节点之下，移动位置了
        // 当前节点不能拖动到子节点下
        let isDragInTarget = false;
        let rec = record;
        while (rec) {
          if (rec[PARENT_RECORD] === dragRecord) {
            isDragInTarget = true;
            break;
          }
          rec = rec[PARENT_RECORD];
        }
        if (isDragInTarget) return {};
        return {
          isMoveOver: monitor.isOver(),
          canMoveDrop: dragRecord && record,
          dropClassName: ' drop-over-downward',
        };
      }
      return {};
    },
    drop: (dragItem: any) => {
      const dragIndex = dragItem.index;
      const dragRecord = dragItem.record;
      if (!istreemodel) {
        if (dragIndex !== index) {
          if (!canMoveRowToChangeRecno(state)) {
            message.warn('必须先在导航中选择顺序字段的限定字段值。');
          } else {
            moveRow(dragIndex, index, dragRecord);
          }
        }
      } else if (record[PARENT_RECORD] === dragRecord[PARENT_RECORD]) {
        // 是树形结构，判断是不是在同一个节点之下
        if (dragIndex !== index) moveRow(dragIndex, index, dragRecord);
      } else {
        // 在不同节点之下，移动位置了
        // 当前节点不能拖动到子节点下
        let isDragInTarget = false;
        let rec = record;
        while (rec) {
          if (rec[PARENT_RECORD] === dragRecord) {
            isDragInTarget = true;
            break;
          }
          rec = rec[PARENT_RECORD];
        }
        if (!isDragInTarget) {
          // message.warn('changeparent');
          moveToNewParent(dragIndex, index, dragRecord, record);
        }
      }
    },
  });
  const [, moveDrag, preview] = useDrag({
    item: { type: acceptType, index, record },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  // 记录间移动和拖动到导航，只能有一个生效
  if (state.currSetting.canDragChangeRecno) {
    moveDrop(moveDrag(ref));
  } else moveDrag(ref);
  return (
    <>
      {
        // 拖动到导航显示一个图片，记录间拖动吠 ，显示原记录
        state.currSetting.canDragChangeRecno ? null : (
          <DragPreviewImage connect={preview} src="/images/dragrecords.png" />
        )
      }
      <tr
        ref={ref}
        style={{ ...style }}
        className={`${className}${isMoveOver && canMove ? dropClassName : ''}`}
        {...restProps}
      />
    </>
  );
};
