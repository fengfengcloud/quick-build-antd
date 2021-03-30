import { Tabs } from 'antd';
import React from 'react';
import AbcEmployee from './AbcEmployee';
import styles from '../index.less';

export const AbcgateCharts = () => {
  return (
    <Tabs>
      <Tabs.TabPane
        tabKey="AbcEmployee"
        key="AbcEmployee"
        tab="人员当天体温"
        className={styles.dashboardcard}
      >
        <AbcEmployee />
      </Tabs.TabPane>
    </Tabs>
  );
};
