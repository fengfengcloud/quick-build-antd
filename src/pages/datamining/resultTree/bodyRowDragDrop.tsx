import React, { useContext } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { DataminingContext, DataminingStateContext } from '..';
import { DRAGABLE_BODY_ROW, DRAG_ITEM_GROUPFIELD, DRAG_NAVIGATE_RECORD, ROWID } from '../constants';
import { getNavigateSelectedRecords } from '../navigate/navigateUtils';
import { expandRowsWithGroup, expandRowWithNavigateRecords } from '../rowActionUtils';
import { getTreeRecordByKey } from '../utils';


/**
 * 树形记录的拖动，只有在相同的父节点下才可以进行拖动,也包括分组字段的导航记录拖进来的操作
 * 
 * 分组字段和导航记录拖动进来的操作
 * 
 * @param param0 
 */
export const DragableBodyRow = ({ index, record, moveRow, className, style, ...restProps }:
    { index: number, record: any, moveRow: Function, className: string, style: any }) => {
    const context = useContext<DataminingStateContext>(DataminingContext);
    const { state, dispatch } = context;
    const ref: any = React.useRef();
    // 记录之间互相拖动顺序
    const [{ isMoveOver, canMoveDrop: canMove, dropClassName }, moveDrop] = useDrop({
        accept: DRAGABLE_BODY_ROW,
        canDrop: (item, monitor) => {
            const { record: dragRecord } = monitor.getItem() || {};
            return dragRecord && record && (dragRecord.parentNode === record.parentNode);
        },
        collect: monitor => {
            const { index: dragIndex, record: dragRecord } = monitor.getItem() || {};
            if (dragIndex === index) {
                return {};
            }
            return {
                isMoveOver: monitor.isOver(),
                // 在相同的父节点下才可以进行记录的拖动
                canMoveDrop: dragRecord && record && (dragRecord.parentNode === record.parentNode),
                dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
            };
        },
        drop: (dragItem: any) => {
            moveRow(dragItem.index, index, dragItem.record);
        },
    });
    const [, moveDrag] = useDrag({
        item: { type: DRAGABLE_BODY_ROW, index, record },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
    });
    moveDrop(moveDrag(ref));

    // 分组字段拖动到记录上
    const [{ isGroupExpandOver, }, groupExpanddrop] = useDrop({
        accept: DRAG_ITEM_GROUPFIELD,
        canDrop: (item: any, monitor) => true,
        /**
        * 当用户拖动分组字段放到记录上时进行展开。
        * 1、如果当前记录没有选中，则只展开当前记录。
        * 2、如果当前记录被选中了，则展开所有的选中记录。
        */
        drop: (item) => {
            const records: any[] = [];
            const isSelected = state.selectedRowKeys.find(v => v === record[ROWID]);
            if (isSelected) {
                // 加入所有选中的记录
                records.push(...state.selectedRowKeys.map(key =>
                    getTreeRecordByKey(state.schemeState.dataSource, key, ROWID)));
            }
            else
                records.push(record);
            expandRowsWithGroup({ state, dispatch, records, group: item })
        },
        collect: (monitor) => {
            return {
                isGroupExpandOver: !!monitor.isOver(),
                canDrop: monitor.canDrop()
            };
        },
    });

    // 导航记录拖动到记录上
    const [{ isNavigateOver, }, navigateDrop] = useDrop({
        accept: DRAG_NAVIGATE_RECORD,
        canDrop: (item: any, monitor) => true,
        drop: (item) => {
            console.log('droped:', item);
            console.log('target record:', record);
            console.log(state);
            // condition: "pmAgreementClassType|ff80808174ec813b0174fb8fa3f20116=30"
            // leaf: true
            // moduleName: "PmAgreementClassType"
            // text: "标准厂房、仓库工程"
            // value: "30"
            const sourceRecords: any[] = getNavigateSelectedRecords(state, item.navigateGroup.fieldid, item.node);
            const records: any[] = []
            sourceRecords.forEach(record => {
                records.push({
                    condition: record.groupfieldid + '=' + record.value,
                    leaf: true,
                    moduleName: record.moduleName,
                    text: record.text,
                    value: record.value,
                })
            })
            // 如果拖进来的导航节点和当前选中节点的 condition的前面相同，则把此记录放在nodeParent下面的节点的前面。
            let targetNode: any = record;
            let pos = -1;
            const targetCondition: string = record['condition'];
            if (targetCondition && targetCondition.split('=')[0] === item.node.groupfieldid) {
                targetNode = targetNode.parentNode;
                pos = (targetNode.children as any[]).findIndex(rec => rec === record);
            }
            expandRowWithNavigateRecords({
                state, dispatch, node: targetNode, fieldid: item.navigateGroup.fieldid, title: item.navigateGroup.title,
                records, pos, recordpath: true
            })
        },
        collect: (monitor) => {
            return {
                isNavigateOver: !!monitor.isOver(),
                canDrop: monitor.canDrop()
            };
        },
    });
    groupExpanddrop(navigateDrop(ref))
    return (
        <tr ref={ref} style={{ ...style }}
            className={`${className}${isMoveOver && canMove ? dropClassName : ''}` +
                (isGroupExpandOver || isNavigateOver ? ' ' + 'ant-table-row-selected' : '')}
            {...restProps}
        />
    );
};
