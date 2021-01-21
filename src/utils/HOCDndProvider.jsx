import React, { useRef } from 'react'
import { DndProvider, createDndContext } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
const RNDContext = createDndContext(HTML5Backend);

/**
 * HTML5Backend 只能实例化一次，多次实例化会出错，因此使用Context来包含
 * @param {*} props 
 */
const DragAndDropHOC = props => {
    const manager = useRef(RNDContext);
    return <DndProvider manager={manager.current.dragDropManager}>
        {props.children}
    </DndProvider>
};

export default DragAndDropHOC