import React from 'react';
import { Card } from 'antd';
import { hasModuleInSysMenu } from '@/layouts/BasicLayout';
import { PmCharts } from './pm';

export default (): React.ReactNode => (
  <Card bordered={false} bodyStyle={{ paddingTop: 0 }} style={{ margin: '-8px' }}>
    {/* 工程管理系统的图表 */}
    {hasModuleInSysMenu('PmAgreement') ? <PmCharts /> : null}
  </Card>
);
