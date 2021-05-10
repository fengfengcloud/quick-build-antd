import React from 'react';
import './chartNode.css';

interface PropTypes {
  nodeData: any;
}

export const ChartNode: React.FC<PropTypes> = ({ nodeData }) => {
  const { isBase, isParent, isChild, disabled } = nodeData;
  if (isBase) {
    return (
      <div>
        <div className="base">{nodeData.name}</div>
        <div className="type">{nodeData.title}</div>
      </div>
    );
  }
  if (isParent && !disabled) {
    return (
      <div>
        <div className="parent">{nodeData.name}</div>
      </div>
    );
  }
  if (isChild && !disabled) {
    return (
      <div>
        <div className="child">{nodeData.name}</div>
      </div>
    );
  }
  return (
    <div>
      <div className="disabled">{nodeData.name}</div>
    </div>
  );
};
