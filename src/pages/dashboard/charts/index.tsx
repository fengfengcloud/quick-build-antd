import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Card, Tabs } from 'antd';
import PmAgreement from './PmAgreement';
import PmAgreementPayout from './PmAgreementPayout';
import PmAgreementApprove from './PmAgreementApprove';
import styles from './index.less';
import PmAgreementPlan from './PmAgreementPlan';

export default (): React.ReactNode => (
  <PageHeaderWrapper title={<span style={{ display: 'none' }}></span>}  >
    <Card bordered={false} bodyStyle={{ paddingTop: 0 }}>
      <Tabs>
        <Tabs.TabPane tabKey="PmAgreement" key="PmAgreement"
          tab="项目合同分析"
          className={styles.dashboardcard}>
          <PmAgreement />
        </Tabs.TabPane>
        <Tabs.TabPane tabKey="PmAgreementPlan" key="PmAgreementPlan"
          tab="合同付款计划分析"
          className={styles.dashboardcard} >
          <PmAgreementPlan />
        </Tabs.TabPane>
        <Tabs.TabPane tabKey="PmAgreementPayout" key="PmAgreementPayout"
          tab="合同付款分析"
          className={styles.dashboardcard} >
          <PmAgreementPayout />
        </Tabs.TabPane>
        <Tabs.TabPane tabKey="PmAgreementApprove" key="PmAgreementApprove"
          tab="文件审批表分析"
          className={styles.dashboardcard}>
          <PmAgreementApprove />
        </Tabs.TabPane>
      </Tabs>
    </Card>
  </PageHeaderWrapper>
);
