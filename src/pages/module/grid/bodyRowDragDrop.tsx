import React, { useContext } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ModuleContext, ModuleStateContext } from '..';
import { ModuleState } from '../data';
import { DetailModelContext } from '../detailGrid/model';


const type = 'ModuleDragableBodyRow';
/**
 * 
 * 树形记录的拖动，或者有 orderfield的可以进行拖动。在可修改的情况下可以拖动到导航进行修改字段的值
 * 
 * @param param0 
 */
export const DragableBodyRow = ({ index, record, moveRow, className, style, ...restProps }:
    { index: number, record: any, moveRow: Function, className: string, style: any }) => {

    const detailContext = useContext(DetailModelContext)
    const context = useContext<ModuleStateContext>(ModuleContext);
    let state: ModuleState, dispatch: any;
    if (detailContext && detailContext.moduleState) {
        state = detailContext.moduleState;
        dispatch = detailContext.dispatch;
    } else {
        state = context.state;
        dispatch = context.dispatch;
    }
    const ref: any = React.useRef();

    // 记录之间互相拖动顺序
    const [{ isMoveOver, canMoveDrop: canMove, dropClassName }, moveDrop] = useDrop({
        accept: type + state.moduleName,
        canDrop: (item, monitor) => {
            const { record: dragRecord } = monitor.getItem() || {};
            console.log(monitor.getItem());
            return dragRecord && record;
        },
        collect: monitor => {
            const { index: dragIndex, record: dragRecord } = monitor.getItem() || {};
            if (dragIndex === index) {
                return {};
            }
            return {
                isMoveOver: monitor.isOver(),
                canMoveDrop: dragRecord && record,
                dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
            };
        },
        drop: (dragItem: any) => {
            if (dragItem.index != index)
                moveRow(dragItem.index, index, dragItem.record);
        },
    });
    const [, moveDrag] = useDrag({
        item: { type: type + state.moduleName, index, record },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
    });
    moveDrop(moveDrag(ref));

    return (
        <tr ref={ref} style={{ ...style }}
            className={`${className}${isMoveOver && canMove ? dropClassName : ''}`}
            {...restProps}
        />
    );
};
