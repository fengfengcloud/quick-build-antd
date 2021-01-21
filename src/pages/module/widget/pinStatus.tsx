import React from 'react';
import { Dispatch } from 'redux';
import { Breadcrumb, Menu } from 'antd';
import { ModuleState, ModuleModal } from '../data';
import { getModuleInfo } from '../modules';
import { getAllFilterCount } from '../grid/filterUtils';
import { getPinRecord } from '../moduleUtils';
interface pinStatusProps {
    dispatch: Dispatch,
    moduleState: ModuleState
}

/**
 * 生成一个record的所有的children的菜单，这些菜单里的项目必须要有children
 * @param record 
 */
const getHasChildrenNodeMenu = (record: any, moduleInfo: ModuleModal, dispatch: Dispatch): any => {
    const { children } = record;
    const { primarykey, namefield, modulename: moduleName } = moduleInfo;
    const result: any[] = [];
    if (Array.isArray(children)) {
        children.forEach(rec => {
            if (Array.isArray(rec.children)) {
                result.push(<Menu.Item
                    onClick={() => {
                        dispatch({
                            type: 'modules/pinkeyChanged',
                            payload: {
                                moduleName,
                                pinkey: rec[primarykey],
                            }
                        })
                    }}>{rec[namefield]}</Menu.Item>)
            }
        })
    }
    if (result.length)
        return <Menu>{result}</Menu>;
    else
        return null;
}

/**
 * 树形结构有pinkey时，在上面显示pinkey的路径，可以单击进行切换pinkey
 * @param props 
 */
const PinStatus: React.FC<pinStatusProps> = (props) => {
    const { dispatch, moduleState } = props;
    const { moduleName, pinkey, dataSource } = moduleState;
    // 如果有筛选条件了，也要禁用pin
    if (!pinkey || getAllFilterCount(moduleState))
        return null;
    const moduleInfo = getModuleInfo(moduleName);
    const { namefield, primarykey } = moduleInfo;
    const pinrecord = getPinRecord(dataSource, pinkey, primarykey);
    const pinpaths: any[] = [];
    const setPinkey = (pinkey: string) => {
        dispatch({
            type: 'modules/pinkeyChanged',
            payload: {
                moduleName,
                pinkey,
            }
        })
    };
    let parent: any = pinrecord;
    while (parent) {
        (function (record) {
            pinpaths.splice(0, 0, <Breadcrumb.Item
                overlay={getHasChildrenNodeMenu(record, moduleInfo, dispatch)}
                onClick={() => {
                    setPinkey(record && !record.__parent__ && moduleState.dataSource.length == 1 ?
                        '' : record[primarykey])
                }}>
                <a>{record[namefield]}</a>
            </Breadcrumb.Item>)
        })(parent);
        parent = parent.__parent__;
    }
    // 最顶层的记录个数，只果只有一条，不显示 所有。
    if (dataSource.length > 1) {
        pinpaths.splice(0, 0,
            <Breadcrumb.Item
                overlay={getHasChildrenNodeMenu({ children: moduleState.dataSource }, moduleInfo, dispatch)}
                onClick={() => {
                    setPinkey('');
                }}>
                <a>所有</a>
            </Breadcrumb.Item>);
    };
    return <Breadcrumb separator=">" style={{ marginLeft: '12px', display: 'inline' }}>
        {pinpaths}
    </Breadcrumb>;

}

export default PinStatus;