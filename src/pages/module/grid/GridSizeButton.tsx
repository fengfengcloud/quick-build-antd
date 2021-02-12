import React from 'react';
import { Dropdown, Menu } from 'antd';
import { Dispatch } from 'redux';
import { CheckOutlined, ColumnHeightOutlined } from '@ant-design/icons';
import { ModuleState } from '../data';

const hiddenIcon = <CheckOutlined style={{ visibility: 'hidden' }} />;

const GridSizeButton = ({
  moduleState,
  dispatch,
}: {
  moduleState: ModuleState;
  dispatch: Dispatch;
}) => {
  const {
    moduleName,
    currSetting: { gridSize },
  } = moduleState;
  const getIcon = (key: string, title: string) => (
    <Menu.Item key={key}>
      <span style={{ paddingRight: '48px' }}>
        {gridSize === key ? <CheckOutlined /> : hiddenIcon}
        {title}
      </span>
    </Menu.Item>
  );
  const menu = (
    <Menu
      onClick={({ key }) => {
        dispatch({
          type: 'modules/gridSizeChanged',
          payload: {
            moduleName,
            size: key,
          },
        });
      }}
    >
      <Menu.ItemGroup title="表格密度">
        {getIcon('default', '默认')}
        {getIcon('middle', '中等')}
        {getIcon('small', '紧凑')}
      </Menu.ItemGroup>
    </Menu>
  );
  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <ColumnHeightOutlined style={{ cursor: 'pointer' }} />
    </Dropdown>
  );
};

export default GridSizeButton;
