import React, { CSSProperties } from 'react';
import { Progress } from 'antd';

/**
 * 显示只读的百分比进度条
 * @param param0 
 */
const ProgressField = ({ value, style }:
    { value?: number, style?: CSSProperties }) => {
    if (!value) value = 0;
    return value <= 1 ?
        <Progress style={style}
            percent={Math.round(value * 100)}
            size='default' /> :
        <span>{`${value * 100} %`}</span>
}

export default ProgressField;