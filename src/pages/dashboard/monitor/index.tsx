import React from 'react';
import { Card, Tabs } from 'antd';
import { UserOperator } from './userOperator';
import { UserLogin } from './userLogin';
import { UserApprove } from './userApprove';

const monitor: React.FC = () => {
  return (
    <Card
      bordered={false}
      bodyStyle={{ padding: '0px 0px 16px 0px', margin: '0px 16px 16px' }}
      style={{ margin: '-8px' }}
    >
      <Tabs>
        <Tabs.TabPane tab="用户审批分析" tabKey="userapprove" key="userapprove">
          <UserApprove />
        </Tabs.TabPane>
        <Tabs.TabPane tab="用户操作分析" tabKey="useroperate" key="useroperate">
          <UserOperator />
        </Tabs.TabPane>
        <Tabs.TabPane tab="用户登录分析" tabKey="userlogin" key="userlogin">
          <UserLogin />
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
};

export default monitor;
