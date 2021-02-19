import React, { useState } from 'react';
import { Dropdown, Menu, Radio, Switch } from 'antd';
import { Dispatch } from 'redux';
import { CheckOutlined, SettingOutlined } from '@ant-design/icons';
import { RadioChangeEvent } from 'antd/lib/radio';
import { ModuleState, TextValue } from '../data';
import { getMonetarysValueText } from './monetary';
import { getAllGridSchemes, getModuleInfo, hasEdit, hasMonetaryField } from '../modules';

const hiddenIcon = () => <CheckOutlined style={{ visibility: 'hidden' }} />;
const checkedIcon = () => <CheckOutlined />;

const GridSettingButton: React.FC<any> = ({
  moduleState,
  dispatch,
}: {
  moduleState: ModuleState;
  dispatch: Dispatch;
}) => {
  const { moduleName } = moduleState;
  const moduleInfo = getModuleInfo(moduleName);
  const canDragToNavigate = hasEdit(moduleInfo) && moduleInfo.navigateSchemes.length;
  const schemes: any[] = getAllGridSchemes(moduleInfo.gridschemes);
  const [visible, setVisible] = useState<boolean>(false);
  const menu = (
    <Menu>
      {schemes.length > 1 ? (
        <Menu.ItemGroup title="表格方案">
          {schemes.map((scheme: any) => (
            <Menu.Item
              key={scheme.gridschemeid}
              onClick={({ key }) => {
                dispatch({
                  type: 'modules/gridSchemeChanged',
                  payload: {
                    moduleName,
                    gridschemeid: key,
                  },
                });
                setVisible(false);
              }}
            >
              <span>
                {moduleState.currentGridschemeid === scheme.gridschemeid
                  ? checkedIcon()
                  : hiddenIcon()}
                {scheme.schemename}
              </span>
            </Menu.Item>
          ))}
        </Menu.ItemGroup>
      ) : null}
      {hasMonetaryField(moduleInfo) ? (
        <Menu.ItemGroup title="金额单位设置">
          <Menu.Item key="monerarytype">
            {hiddenIcon()}数值单位：
            <Radio.Group
              value={moduleState.monetary.type}
              onChange={(e: RadioChangeEvent) => {
                dispatch({
                  type: 'modules/monetaryChanged',
                  payload: {
                    moduleName,
                    monetaryType: e.target.value,
                  },
                });
                e.preventDefault();
              }}
            >
              {getMonetarysValueText().map((rec: TextValue) => (
                <Radio.Button key={rec.value} value={rec.value}>
                  {rec.text}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Menu.Item>
          <Menu.Item key="moneraryposition">
            <span>
              {hiddenIcon()}显示位置：
              <Radio.Group
                value={moduleState.monetaryPosition}
                onChange={(e: any) => {
                  dispatch({
                    type: 'modules/monetaryChanged',
                    payload: {
                      moduleName,
                      position: e.target.value,
                    },
                  });
                }}
              >
                <Radio.Button value="behindnumber">显示在数值后</Radio.Button>
                <Radio.Button value="columntitle">显示在列头上</Radio.Button>
              </Radio.Group>
            </span>
          </Menu.Item>
        </Menu.ItemGroup>
      ) : null}
      {canDragToNavigate || moduleInfo.orderfield ? (
        <Menu.ItemGroup title="记录拖动设置">
          {canDragToNavigate ? (
            <Menu.Item key="dragtonavigate">
              <span style={{ marginRight: '24px' }}>可拖动至导航修改字段值</span>
              <Switch
                checked={moduleState.currSetting.canDragToNavigate}
                onChange={() => {
                  dispatch({
                    type: 'modules/toggleCanDragToNavigate',
                    payload: {
                      moduleName,
                    },
                  });
                }}
                style={{ float: 'right' }}
              />
            </Menu.Item>
          ) : null}
          {moduleInfo.orderfield ? (
            <Menu.Item key="dragtochangerecno">
              <span style={{ marginRight: '24px' }}>可拖动记录改变顺序</span>
              <Switch
                checked={moduleState.currSetting.canDragChangeRecno}
                onChange={() => {
                  dispatch({
                    type: 'modules/toggleCanDragChangeRecno',
                    payload: {
                      moduleName,
                    },
                  });
                }}
                style={{ float: 'right' }}
              />
            </Menu.Item>
          ) : null}
        </Menu.ItemGroup>
      ) : null}
    </Menu>
  );
  if (
    schemes.length > 1 ||
    hasMonetaryField(moduleInfo) ||
    canDragToNavigate ||
    moduleInfo.orderfield
  )
    return (
      <Dropdown
        overlay={menu}
        trigger={['click']}
        visible={visible}
        onVisibleChange={(v) => setVisible(v)}
      >
        <SettingOutlined style={{ cursor: 'pointer' }} />
      </Dropdown>
    );
  return null;
};

export default GridSettingButton;
