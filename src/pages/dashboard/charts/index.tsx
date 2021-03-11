import React from 'react';
import { Card } from 'antd';
import { hasModuleInSysMenu } from '@/layouts/BasicLayout';
import { PmCharts } from './pm';
import Monitor from '../monitor';

export default (): React.ReactNode => {
  const hasBusinessCharts: boolean = hasModuleInSysMenu('PmAgreement');
  if (hasBusinessCharts) {
    return (
      <Card
        bordered={false}
        bodyStyle={{ padding: '0px 0px 16px 0px', margin: '0px 16px 16px' }}
        style={{ margin: '-8px' }}
      >
        {/* 工程管理系统的图表 */}
        {hasModuleInSysMenu('PmAgreement') ? <PmCharts /> : null}
      </Card>
    );
  }
  return <Monitor />;
};
