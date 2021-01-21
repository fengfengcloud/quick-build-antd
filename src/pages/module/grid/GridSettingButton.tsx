import React, { useState } from 'react';
import { Dropdown, Menu, Radio } from 'antd';
import { ModuleState } from '../data';
import { Dispatch } from 'redux';
import { CheckOutlined, SettingOutlined } from '@ant-design/icons';
import { getMonetarysValueText } from './monetary';
import { TextValue } from '../data';
import { RadioChangeEvent } from 'antd/lib/radio';
import { getAllGridSchemes, getModuleInfo, hasMonetaryField } from '../modules';

const hiddenIcon = <CheckOutlined style={{ visibility: 'hidden' }} />
const checkedIcon = <CheckOutlined />;

const GridSettingButton = ({ moduleState, dispatch }: { moduleState: ModuleState, dispatch: Dispatch }) => {
    const { moduleName } = moduleState;
    const moduleInfo = getModuleInfo(moduleName);
    const schemes: any[] = getAllGridSchemes(moduleInfo.gridschemes);
    const [visible, setVisible] = useState<boolean>(false);
    const menu = (
        <Menu>
            {schemes.length > 1 ? <Menu.ItemGroup title="表格方案">
                {schemes.map((scheme: any) =>
                    <Menu.Item key={scheme.gridschemeid} onClick={({ key }) => {
                        dispatch({
                            type: 'modules/gridSchemeChanged',
                            payload: {
                                moduleName,
                                gridschemeid: key,
                            }
                        });
                        setVisible(false);
                    }} >
                        <span>
                            {moduleState.currentGridschemeid == scheme.gridschemeid ?
                                checkedIcon : hiddenIcon
                            }{scheme.schemename}</span>
                    </Menu.Item>
                )}
            </Menu.ItemGroup> : null}
            {hasMonetaryField(moduleInfo) ?
                <Menu.ItemGroup title="金额单位设置">
                    <Menu.Item key='monerarytype'>
                        {hiddenIcon}{'数值单位：'}
                        <Radio.Group value={moduleState.monetary.type} onChange={(e: RadioChangeEvent) => {
                            dispatch({
                                type: 'modules/monetaryChanged',
                                payload: {
                                    moduleName: moduleState.moduleName,
                                    monetaryType: e.target.value,
                                }
                            })
                            e.preventDefault();
                        }}>
                            {getMonetarysValueText().map((rec: TextValue) =>
                                <Radio.Button key={rec.value} value={rec.value}>{rec.text}</Radio.Button>)
                            }
                        </Radio.Group>
                    </Menu.Item>
                    <Menu.Item key='moneraryposition'>
                        {hiddenIcon}{'显示位置：'}
                        <Radio.Group value={moduleState.monetaryPosition} onChange={(e: any) => {
                            dispatch({
                                type: 'modules/monetaryChanged',
                                payload: {
                                    moduleName: moduleState.moduleName,
                                    position: e.target.value,
                                }
                            })
                        }}>
                            <Radio.Button value='behindnumber'>显示在数值后</Radio.Button>
                            <Radio.Button value='columntitle'>显示在列头上</Radio.Button>
                        </Radio.Group>
                    </Menu.Item>
                </Menu.ItemGroup> :
                null
            }
        </Menu>)
    return (schemes.length > 1 || hasMonetaryField(moduleInfo) ?
        <Dropdown
            overlay={menu}
            trigger={['click']}
            visible={visible}
            onVisibleChange={(v) => setVisible(v)}>
            <SettingOutlined style={{ cursor: 'pointer' }} />
        </Dropdown> :
        null
    )
}

export default GridSettingButton;
