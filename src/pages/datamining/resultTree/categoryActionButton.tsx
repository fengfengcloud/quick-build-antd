import React, { useContext } from 'react';
import {
    ClearOutlined, MenuOutlined, NodeCollapseOutlined, NodeExpandOutlined, SortAscendingOutlined,
    SortDescendingOutlined
} from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import { DataminingContext, DataminingStateContext } from '..';
import {
    ACT_CLEAR_ALL_COLUMN_EXPAND, ACT_CLEAR_ALL_ROWEXPAND, ACT_DATAMINING_EXPAND_CHANGED,
    ACT_SORT_CHANGE, ROWID
} from '../constants';
import { getAllhasChildrenRowids } from '../utils';

const CategoryActionButton: React.FC = () => {
    const context = useContext<DataminingStateContext>(DataminingContext);
    const { state, dispatch } = context;

    const menu = <Menu onClick={({ domEvent }) => {
        domEvent.stopPropagation();
    }}>
        <Menu.Item key='expandAll' icon={<NodeExpandOutlined />}
            onClick={() => {
                dispatch({
                    type: ACT_DATAMINING_EXPAND_CHANGED,
                    payload: { expandedRowKeys: getAllhasChildrenRowids(state.schemeState.dataSource) },
                });
            }}
        >展开所有行</Menu.Item>
        <Menu.Item key='collapseAll' icon={<NodeCollapseOutlined />}
            onClick={() => {
                dispatch({
                    type: ACT_DATAMINING_EXPAND_CHANGED,
                    payload: { expandedRowKeys: [state.schemeState.dataSource[0][ROWID]] },
                });
            }}
        >折叠至总计行</Menu.Item>
        <Menu.ItemGroup title="排序设置">
            <Menu.Item key='value-asc' icon={<SortAscendingOutlined />}
                onClick={() => {
                    dispatch({
                        type: ACT_SORT_CHANGE,
                        payload: {
                            property: 'value',
                            direction: 'ASC',
                        },
                    });
                }}
            >分组编码升序</Menu.Item>
            <Menu.Item key='value-desc' icon={<SortDescendingOutlined />}
                onClick={() => {
                    dispatch({
                        type: ACT_SORT_CHANGE,
                        payload: {
                            property: 'value',
                            direction: 'DESC',
                        },
                    });
                }}
            >分组编码降序</Menu.Item>
        </Menu.ItemGroup>
        <Menu.ItemGroup title="重置行或列">
            <Menu.Item key='clearrowexpand' icon={<ClearOutlined />}
                onClick={() => {
                    dispatch({
                        type: ACT_CLEAR_ALL_ROWEXPAND,
                        payload: {
                        }
                    })
                }}>清除所有行展开数据</Menu.Item>
            <Menu.Item key='clearcolumnexpand' icon={<ClearOutlined />}
                onClick={() => {
                    dispatch({
                        type: ACT_CLEAR_ALL_COLUMN_EXPAND,
                        payload: {
                        }
                    })
                }}>清除所有列展开分组
            </Menu.Item>
        </Menu.ItemGroup>
    </Menu>
    return <Dropdown overlay={menu} trigger={['click', 'contextMenu']}>
        <MenuOutlined style={{ marginLeft: '12px' }} onClick={(e) => {
            e.stopPropagation();
        }} />
    </Dropdown>
}

export default CategoryActionButton;