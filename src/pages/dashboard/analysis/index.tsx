import Datamining from '@/pages/datamining';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Card, Tabs } from 'antd';
import React from 'react';

export default (): React.ReactNode => (
    <PageHeaderWrapper title={<span style={{ display: 'none' }}></span>}  >
        <Card bordered={false} bodyStyle={{ paddingTop: 0 }}>
            <Tabs>
                <Tabs.TabPane tabKey="PmAgreement" key="PmAgreement" tab="项目合同数据分析">
                    <Datamining moduleName="PmAgreement"></Datamining>
                </Tabs.TabPane>
                <Tabs.TabPane tabKey="PmPlanPayoutBalance" key="PmPlanPayoutBalance" tab="项目区间计划与实际支付">
                    <Datamining moduleName="PmPlanPayoutBalance"></Datamining>
                </Tabs.TabPane>
                <Tabs.TabPane tabKey="PmInvoice" key="PmInvoice" tab="项目合同发票">
                    <Datamining moduleName="PmInvoice"></Datamining>
                </Tabs.TabPane>
            </Tabs>
        </Card>
    </PageHeaderWrapper>
)