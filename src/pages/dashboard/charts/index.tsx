import React from 'react';
import { Card } from 'antd';
import { CardProps } from 'antd/lib/card';
import { systemInfo } from '@/models/systeminfo';
import Monitor from '../monitor';
import { PmCharts } from './pm';
import { AbcgateCharts } from './abcgate';

export default (): React.ReactNode => {
  const cardProps: CardProps = {
    bordered: false,
    bodyStyle: {
      padding: '0px 0px 16px 0px',
      margin: '0px 16px 16px',
    },
    style: {
      margin: '-8px',
    },
  };

  // 不同系统可以在此设置显示不同的图表页
  if (systemInfo.systeminfo.systemkey === 'pm') {
    return (
      <Card {...cardProps}>
        {/* 工程管理系统的图表 */}
        <PmCharts />
      </Card>
    );
  }

  if (systemInfo.systeminfo.systemkey === 'abcgate') {
    return (
      <Card {...cardProps}>
        {/* abcgate的图表 */}
        <AbcgateCharts />
      </Card>
    );
  }

  // 默认返回Monitor中的定义
  return <Monitor />;
};
