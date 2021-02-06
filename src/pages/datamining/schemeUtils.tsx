import React from 'react';
import request, { syncRequest } from "@/utils/request";
import { Form, Input, message, Modal } from "antd";
import { serialize } from "object-to-formdata";
import { changeUserFilterToParam } from "../module/UserDefineFilter";
import { ACT_ADD_SCHEME, ACT_DATAMINING_FETCHDATA, ACT_DELETE_SCHEME, ACT_UPDATE_DATAMINING_SCHEMEINFO, ROOTROWID, ROWID, TEXT } from "./constants";
import { CurrentSchemeModal, DataminingModal, ColumnGroupModal, FieldModal, ActionProps } from "./data";
import { getLeafColumns } from "./resultTree/columnFactory";
import { expandRowWithNavigateRecords, refreshRowData } from "./rowActionUtils";
import { getDefaultDataminingSetting, getTreeRecordByKey, removeFromParentNode, setFetchLoading } from "./utils";
import { getModuleInfo } from '../module/modules';
import { PlusOutlined } from '@ant-design/icons';
import { uuid } from '@/utils/utils';
import { getSqlparamFilter } from '../module/grid/filterUtils';

/**
 * 当前的数据分析方案另存为
 * @param state 
 * @param dispatch 
 */
export const saveNewScheme = (state: DataminingModal, dispatch: Function) => {
    const { moduleName, schemeState } = state;
    const moduleInfo = getModuleInfo(moduleName);
    let title = moduleInfo.title + '数据分析方案'
    Modal.confirm({
        title: <span><PlusOutlined />{' 新增' + title}</span>,
        icon: null,
        content: <Form autoComplete='off'>
            <Input name="text" autoFocus
                defaultValue={title} maxLength={100}
                onChange={(e) => { title = e.target.value; }} />
        </Form>,
        onOk: (() => {
            request('/api/platform/datamining/addscheme.do', {
                method: 'POST',
                data: serialize({
                    moduleName,
                    title,
                    savepath: true,
                    ownerfilter: false,
                    fieldGroup: JSON.stringify(schemeState.fieldGroup),
                    rowGroup: JSON.stringify(schemeState.rowGroup),
                    columnGroup: JSON.stringify(schemeState.columnGroup).replaceAll('"children"', '"columns"'),
                    setting: JSON.stringify(schemeState.setting),
                })
            }).then((response: any) => {
                if (response.success) {
                    message.success(`数据分析方案『${response.tag.text}』已保存！`);
                    dispatch({
                        type: ACT_ADD_SCHEME,
                        payload: {
                            scheme: {
                                ownerfilter: false,
                                savepath: true,
                                schemeid: response.tag.schemeid,
                                text: response.tag.text,
                                title: response.tag.title,
                            }
                        }
                    })
                } else
                    message.error(response.msg);
            })
        })
    })
}



/**
 * 当前的数据分析方案修改过后进行保存
 * @param state 
 * @param dispatch 
 */
export const saveEditScheme = (state: DataminingModal, dispatch: Function) => {
    const { currentScheme, schemeState } = state;
    request('/api/platform/datamining/editscheme.do', {
        method: 'POST',
        data: serialize({
            schemeid: currentScheme.schemeid,
            name: currentScheme.title,
            savepath: true,
            ownerfilter: false,
            fieldGroup: JSON.stringify(schemeState.fieldGroup),
            rowGroup: JSON.stringify(schemeState.rowGroup),
            columnGroup: JSON.stringify(schemeState.columnGroup).replaceAll('"children"', '"columns"'),
            setting: JSON.stringify(schemeState.setting),
        })
    }).then((response: any) => {
        if (response.success) {
            message.success(`数据分析方案『${response.tag.text}』已保存！`);
        } else
            message.error(response.msg);
    })
}


/**
 * 删除当前的数据分析方案
 * @param state 
 * @param dispatch 
 */
export const deleteCurrentScheme = (state: DataminingModal, dispatch: Function) => {
    const { currentScheme } = state;
    request('/api/platform/datamining/deletescheme.do', {
        method: 'POST',
        data: serialize({
            schemeid: currentScheme.schemeid
        })
    }).then((response: any) => {
        if (response.success) {
            message.success(`数据分析方案『${currentScheme.text}』已删除！`)
            dispatch({
                type: ACT_DELETE_SCHEME,
                payload: {
                    schemeid: currentScheme.schemeid,
                }
            })
        } else
            message.error(response.msg);
    })
}

/**
 * 获取当前模块的所有定义的数据分析方案，保存在state中
 * @param state 
 * @param action 
 */
export const fetchDataminingSchemes = (state: DataminingModal, action: ActionProps): DataminingModal => {
    const schemes = syncRequest('/api/platform/datamining/getschemes.do', {
        params: {
            moduleName: state.moduleName,
        }
    });
    const group = syncRequest('/api/platform/datamining/getexpandgroupfields.do', {
        params: {
            moduleName: state.moduleName,
        }
    });
    const fields = syncRequest('/api/platform/datamining/getfieldschemedetail.do', {
        params: {
            moduleName: state.moduleName,
        }
    });
    return {
        ...state,
        schemes,
        refreshAllCount: schemes.length == 0 ?
            state.refreshAllCount + 1 : state.refreshAllCount,          // 如果一个方案都没有，则+1，读取默认数据
        currentScheme: schemes.length == 0 ? state.currentScheme : schemes[0],
        aggregateFields: fields,
        expandGroupFields: group.list,
        expandGroupFieldsTree: group.tree,
    }
}


/**
 * 用户选择了一个新的数据分析方案，或者初始化的时候选择了第一个方案
 * 1、设置fetchLoading
 * 2、读取方案定义信息
 * 3、读取所有展开的行数据
 * 4、设置fetchLoading
 * @param param0 
 */

export const currentSchemeChanged = async function (state: DataminingModal, dispatch: Function) {
    console.log('正在读取数据分析方案：' + state.currentScheme.text)
    setFetchLoading({ dispatch, fetchLoading: true });
    let schemeState: CurrentSchemeModal;
    if (state.currentScheme.schemeid) {
        // 读取方案的分组和字段
        console.log('准备读取方案：' + state.currentScheme.text);
        const response = await request('/api/platform/datamining/getschemedetail.do', {
            method: 'POST',
            data: serialize({
                schemeid: state.currentScheme?.schemeid,
            })
        });
        console.log(response);
        schemeState = {
            columnGroup: response.columnGroup,
            fieldGroup: response.fieldGroup,
            rowGroup: response.rowGroup,
            setting: JSON.parse(response.setting),
            dataSource: [{
                text: '总计',
                rowid: ROOTROWID,
            }],
            sorts: [{
                property: undefined,
                direction: 'ASC'
            }]
        };
    } else {
        // 没有方案，先放入count(*)
        console.log('当前模块没有方案，生成一个默认方案');
        const fieldGroup: FieldModal[] = state.schemeState.fieldGroup;
        schemeState = {
            columnGroup: [],
            fieldGroup: fieldGroup,
            rowGroup: [],
            setting: getDefaultDataminingSetting(),
            dataSource: [],
            sorts: [{
                property: undefined,
                direction: 'ASC'
            }]
        };
    }
    dispatch({
        type: ACT_UPDATE_DATAMINING_SCHEMEINFO,
        payload: {
            schemeState,
            dispatch: dispatch,
        }
    })
    //setFetchLoading({ dispatch, fetchLoading: false });
}


export const refreshAllDataminingData = async (state: DataminingModal, dispatch: Function) => {
    console.log('读取所有数据');
    setFetchLoading({ dispatch, fetchLoading: true });
    const { schemeState } = state;
    const dataSource = await fetchRootData(state);
    // 如果有展开行的记录，则复原展开过程
    if (schemeState.rowGroup.length) {
        // schemeState ,是当前读取到的，不是原来state里面的
        await executeAllRowPath(state, dataSource);
    }
    dispatch({
        type: ACT_DATAMINING_FETCHDATA,
        payload: {
            dataSource,
        }
    })
    console.log('fetchloading:false');
    setFetchLoading({ dispatch, fetchLoading: false });
}


/**
 * 展开或执行所有行的操作路径
 * @param moduleName 
 * @param schemeState 
 * @param dataSource 
 */
const executeAllRowPath = async (state: DataminingModal, dataSource: any[]) => {
    const { schemeState } = state;
    const { rowGroup } = schemeState;
    // 这里不能用rowGroup.forEach,用了则变为异步，children的数据不能正确加入了。
    // 可以有办法使用forEach，我这里没有做这个处理
    for (let i in rowGroup) {
        const path = rowGroup[i];
        if (path.type == 'expandallleaf') {
            await expandAllLeafWithGroup({
                state,
                dataSource,
                fieldid: path.fieldid,
                fieldtitle: path.title
            });
        } else if (path.type == 'combinerows') {
            // type : 'combinerows',
            // conditionpath : nodeconditions.join(','),
            // text : text,
            // groupcondition : rec.get('groupcondition'),
            // addSelectedChildrens : addSelectedChildrens
            const nodes: any[] = [];
            if (path.conditionpath) {
                path.conditionpath.split(',').forEach(conditionpath => {
                    const node = getTreeRecordByKey(dataSource, conditionpath, ROWID)
                    if (node) nodes.push(node);
                })
            }
            const first = nodes[0];
            if (nodes.length > 0) {
                const rec: any = {
                    text: path.text,
                    condition: path.condition,
                    parentNode: first.parentNode,
                }
                first.parentNode.children.splice(first.parentNode.children.findIndex((c: any) => c === first), 0, rec);
                for (let i = 0; i < nodes.length; i++) {
                    const removed = removeFromParentNode(nodes[i]);
                    if (path.addSelectedChildrens) {
                        if (!rec.children)
                            rec.children = [];
                        removed.parentNode = rec;
                        rec.children.push(removed)
                    }
                }
                await refreshRowData(state, rec, true);
            }
        } else if (path.conditionpath) { // 单条记录操作
            // 在所有的树形结构中找到这条记录
            let node = getTreeRecordByKey(dataSource, path.conditionpath, ROWID)
            if (node) {
                switch (path.type) {
                    case 'expand':
                        await expandRowWithGroup({
                            state,
                            selectrecord: node,
                            fieldid: path.fieldid,
                            title: path.title,
                            recordpath: false,
                        });
                        break;
                    case 'expandwithnavigaterecords':
                        await expandRowWithNavigateRecords({
                            state, dispatch: () => { }, node, fieldid: path.fieldid, title: path.title,
                            records: path.records as any[], pos: path.pos as number, recordpath: false
                        });
                        break;
                    case 'deleterow':
                        removeFromParentNode(node);
                        break;
                    case 'deletechildren':
                        delete node.children;
                        break;
                    case 'edittext':
                        node['text'] = path.text;
                }
            }
        }
    }
    //})
    // tree.fireEvent('afterrefreshall');
    // tree.autoSizeTextColumn();
    // Ext.resumeLayouts(true);

}


const expandAllLeafWithGroup = async ({ state, dataSource, fieldid, fieldtitle }: {
    state: DataminingModal, dataSource: any[], fieldid: string, fieldtitle: string
}) => {
    let allleaf: any[] = getLeafColumns(dataSource);
    for (let i in allleaf) {
        const leaf = allleaf[i];
        await expandRowWithGroup({
            state,
            selectrecord: leaf,
            fieldid: fieldid,
            title: fieldtitle,
            recordpath: false,
        });
    }
}

/**
 * 根据字段展开一条记录
 * @param selectrecord 
 * @param fieldid 
 * @param title 
 * @param recordpath 
 */
export const expandRowWithGroup = async ({ state, selectrecord, fieldid, title, recordpath }:
    {
        state: DataminingModal, selectrecord: any, fieldid: string, title: string, recordpath: boolean,
    }) => {
    const { schemeState } = state;
    const { setting } = schemeState;
    if (setting.expandMultiGroup === 'no') {
        if (Array.isArray(selectrecord.children)) {
            message.warn('节点『' + (selectrecord['text_'] || selectrecord['text'])
                + '』已经有展开的分组。展开多个分组请在设置中将“节点可展开多个分组”设置为“是”！');
            return;
        }
    }
    let expandPath: any = null;
    if (recordpath !== false) { // 是否将展开记录到展开路径中去
        expandPath = {
            type: 'expand',
            conditionpath: selectrecord[ROWID],
            conditiontext: selectrecord[TEXT],
            fieldid: fieldid,
            title: title
        }
    }
    const parentConditions: string[] = [];
    getRecordAllCondition(selectrecord, parentConditions);
    // 判断是否是codelevel模块的 fieldid-auto字段，如果是的话，在所有的parentConditions上面找
    // field-1,2,3然后展开下一级
    if (fieldid.endsWith('-auto')) {
        const fieldid_ = fieldid.substr(0, fieldid.length - 5)
        const nextlevel = findParentLastLevel(fieldid_, parentConditions) + 1;
        fieldid = fieldid_ + '-' + nextlevel;
    }
    // 如果是分级的，那么检查一下当前选中的节点是否是最后节点
    // if ()
    const result = await fetchRecordExpandChildren(state, schemeState, fieldid, title, parentConditions)
    if (Array.isArray(result) && result.length > 0) {
        const c = setting.expandItemDirection === 'asc' ? 1 : -1;
        let sortfield = 'value';
        const mode = setting.expandItemMode;
        if (mode == 'text')
            sortfield = 'text';
        else if (mode == 'value') {
            if (result.length > 0) {
                for (let i in result[0]) {
                    if (i.indexOf('jf') == 0) {
                        sortfield = i;
                        break;
                    }
                }
            }
        }
        result.sort(function (a, b) {
            return (a[sortfield] > b[sortfield] ? 1 : -1) * c;
        });
        const maxrow = setting.expandMaxRow || 0;
        if (maxrow > 1 && result.length > maxrow) {
            // 最多展开maxrow个，例如是20,则第20个，是20个以后的总和，名称为第20个，加上 等n个,
            // 3个以内都加上全称
            if (result.length - maxrow < 3) {
                // 3个以内
                for (let i = maxrow; i < result.length; i++)
                    result[maxrow - 1].text = result[maxrow - 1].text + "," + result[i].text
            } else {
                result[maxrow - 1].text = result[maxrow - 1].text + '等' + (result.length - maxrow + 1) + '个'
            }
            const l = result.length;
            for (let i = maxrow; i < l; i++)
                result[maxrow - 1].value = result[maxrow - 1].value + "," + result.pop().value;
            result[maxrow - 1].needrefreshthisnode_ = true;
        }
        selectrecord.leaf = false;
        if (!Array.isArray(selectrecord.children))
            selectrecord.children = [];
        let p = selectrecord;
        if (setting.expandRowAddGroupName === 'yes') {
            // 先加入展开节点的展开方式
            selectrecord.children.push({
                text: title,
                leaf: false,
                expanded: true,
                children: [],
                parentNode: selectrecord,
                rowid: uuid(),
            })
            p = selectrecord.children[selectrecord.children.length - 1];
        }
        if (fieldid.endsWith('-all'))
            fieldid = fieldid.replace('-all', '');
        result.forEach((record) => {
            record.condition = fieldid + (record.level_ ? '-' + record.level_ : '') + "=" + record.value;
            record.parentNode = selectrecord;
            // if (record.moduleName) {
            //     record.text_ = record.text;
            //     record.text += me.recordHintSpan;
            // }
            if (record.children) {
                adjustChildrenNodes(record, record.children, fieldid);
            }
            //console.log('push record');
            p.children.push(record);
            // const r = p.children[p.children.length - 1];
            // 如果某些记录合并过了，就重新刷新该记录
            //if (r.get('needrefreshthisnode_')) 
            //refreshRowData(r, true, false);
        })
    }
    // const maxlevel = setting.expandMaxLevel || 0;
    // if (recordpath !== false || maxlevel == 0 || selectrecord.getDepth() <= maxlevel)
    //     selectrecord.expand();
    // else
    //     selectrecord.collapse();
    // 返回的结果中包括了新增的路径
    return new Promise(function (resolve, reject) {
        resolve({ expandPath });
    })
}

// 如果是树级children,把树整个处理一下
const adjustChildrenNodes = (parent: any, children: any[], fieldid: string) => {
    children.forEach((record) => {
        record.parentNode = parent;
        record.condition = fieldid + (record.level_ ? '-' + record.level_ : '') + "=" + record.value;
        if (record.moduleName) {
            record.text_ = record.text;
        }
        if (record.children) {
            adjustChildrenNodes(record, record.children, fieldid);
        }
    })
}

// 在数组parentConditions中找到 前缀是fieldid_的所有条件 ，并找到最后一个级数，没找到，返回0
export const findParentLastLevel = (fieldid_: string, parentConditions: string[]) => {
    let maxlevel = 0;
    parentConditions.forEach(condition => {
        const parts = condition.split('=');
        if (parts[0] != fieldid_ && parts[0].startsWith(fieldid_)) {
            // ["SCustomer.STrade|402881e75a5e4a6b015a5e4b46340016-1=1005"]
            const level = parseInt(parts[0].split('-')[1]);
            if (maxlevel < level) maxlevel = level;
        }
    })
    return maxlevel;
}

// 取得当前记录包括父级的所有条件
export const getRecordAllCondition = (record: any, result: string[]) => {
    if (record.condition) result.unshift(record.condition);
    if (record.parentNode) getRecordAllCondition(record.parentNode, result);
}


export const fetchRecordExpandChildren = async (state: DataminingModal, currentScheme: CurrentSchemeModal,
    fieldid: string, text: string, parentConditions: string[]) => {
    console.log('读取记录的展开数据:' + text);
    const { moduleName, filters } = state;
    return await request('/api/platform/datamining/fetchdata.do', {
        method: 'POST',
        params: {
            moduleName_: moduleName,
        },
        data: serialize({
            moduleName,
            groupfieldid: fieldid,
            conditions: JSON.stringify(getGroupDetailConditions(currentScheme.columnGroup)),
            fields: JSON.stringify(getAggregateFieldNames(currentScheme.fieldGroup)),
            parentconditions: JSON.stringify(parentConditions),
            navigatefilters: JSON.stringify(filters.navigatefilters),
            viewschemeid: filters.viewscheme.viewschemeid,
            userfilters: JSON.stringify(changeUserFilterToParam(filters.userfilter)),
            sqlparamstr: filters.sqlparam ? JSON.stringify(getSqlparamFilter(filters.sqlparam)) : null,
        })
    })
}


/**
 * 获取一个指定行展开的所有数据
 * @param param0 
 */
export const fetchRootData = async (state: DataminingModal) => {
    console.log('读取方案的root行数据');
    const { moduleName, filters, schemeState } = state;
    return await request('/api/platform/datamining/fetchdata.do', {
        method: 'POST',
        params: {
            moduleName_: moduleName,
        },
        data: serialize({
            moduleName,
            conditions: JSON.stringify(getGroupDetailConditions(schemeState.columnGroup)),
            fields: JSON.stringify(getAggregateFieldNames(schemeState.fieldGroup)),
            navigatefilters: JSON.stringify(filters.navigatefilters),
            viewschemeid: filters.viewscheme.viewschemeid,
            userfilters: JSON.stringify(changeUserFilterToParam(filters.userfilter)),
            sqlparamstr: filters.sqlparam ? JSON.stringify(getSqlparamFilter(filters.sqlparam)) : null,
        })
    })
}

// 取得所有最底层的列的分组展开的信息，和下面的字段是M*N的关系。
export const getGroupDetailConditions = (columnGroup: ColumnGroupModal[]) => {
    const result: string[] = [];
    const groupDetails = getLeafColumns(columnGroup);
    groupDetails.forEach((column: any) => {
        result.push(column.condition)
    })
    return result;
}

// 取得所有最底层的字段信息，和上面的分组明细乘积是所有字段的个数
export const getAggregateFieldNames = (fieldGroup: FieldModal[]) => {
    const result: string[] = [];
    const fieldDetails = getLeafColumns(fieldGroup);
    fieldDetails.forEach((f: FieldModal) => {
        result.push(f.aggregatefieldname);
    })
    return result;
}
