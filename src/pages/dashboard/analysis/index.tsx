import Datamining from '@/pages/datamining';
import { Card, Tabs } from 'antd';
import React from 'react';

export default (): React.ReactNode => (
    // 所有模块的数据分析都在一个tabs页面中展示
    <Card bordered={false} bodyStyle={{ padding: '0px 0px 16px 0px', margin: '16px' }} style={{ margin: '-8px' }}>
        <Tabs className="dataminingtabs">
            <Tabs.TabPane tabKey="PmAgreement" key="PmAgreement" tab="项目合同">
                <Datamining moduleName="PmAgreement" inTab></Datamining>
            </Tabs.TabPane>
            <Tabs.TabPane tabKey="PmPlanPayoutBalance" key="PmPlanPayoutBalance" tab="项目区间计划与实际支付">
                <Datamining moduleName="PmPlanPayoutBalance" inTab></Datamining>
            </Tabs.TabPane>
            <Tabs.TabPane tabKey="PmInvoice" key="PmInvoice" tab="项目合同发票">
                <Datamining moduleName="PmInvoice" inTab></Datamining>
            </Tabs.TabPane>
        </Tabs>
    </Card>
)