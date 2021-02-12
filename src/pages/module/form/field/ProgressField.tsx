import React, { CSSProperties } from 'react';
import { Progress } from 'antd';

/**
 * 显示只读的百分比进度条
 * @param param0
 */
const ProgressField = ({ value, style }: { value?: number; style?: CSSProperties }) => {
  const val = value || 0;
  return val <= 1 ? (
    <Progress style={style} percent={Math.round(val * 100)} size="default" />
  ) : (
    <span>{`${val * 100} %`}</span>
  );
};

export default ProgressField;
