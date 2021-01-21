import React, { useState } from 'react';
import { message, Modal, Space, Tooltip, Typography, Popconfirm } from 'antd';
import { Dispatch } from 'redux';
import { ModuleModal, ModuleState, AdditionFunctionModal } from '../data';
import { QuestionCircleOutlined, DeleteOutlined, EditOutlined, FileTextOutlined } from '@ant-design/icons';
import { deleteModuleRecord } from '../service';
import { hasEdit, hasDelete, canDelete, canEdit } from '../modules';
import { systemActions, ActionParamsModal } from '../additionalAction/systemAction';

const { Text } = Typography;

interface ActionColumnProps {
    moduleInfo: ModuleModal,
    moduleState: ModuleState,
    dispatch: Dispatch,
}

interface ActionsProps extends ActionColumnProps {
    value: any,
    record: any,
    recno: number,
}

export const getActionColumn: React.FC<ActionColumnProps> = (params): any => {
    return {
        title: <span style={{ whiteSpace: 'nowrap' }}>操作</span>,
        width: getActionsCount(params.moduleInfo) * 22 + 20,
        align: 'center',
        key: 'action',
        fixed: 'right',
        render: (value: any, record: object, recno: number) =>
            getRecordActions({ value, record, recno, ...params }),
    }
}

/**
 * 生成一条条记录的所有可用的actions
 * 1、显示
 * 2、修改
 * 3、删除
 * 4、附加功能：常用的附加功能
 * 5、更多菜单：不常用的附加功能放在此下
 * @param param0 
 */
export const getRecordActions: React.FC<ActionsProps> = params => {
    const { moduleInfo } = params;
    const actions: any = getAdditionFunction(params);
    actions.push(getDisplayAction(params));
    if (hasEdit(moduleInfo))
        actions.push(getEditAction(params));
    if (hasDelete(moduleInfo))
        actions.push(getDeleteAction(params));
    return <Space>{actions}</Space>;
}

const getActionsCount = (moduleInfo: ModuleModal) => {
    let count = 1;                  // display button
    const { additionFunctions: functions } = moduleInfo;
    functions.map((fun: AdditionFunctionModal) => {
        if (fun.minselectrecordnum == 1 && fun.maxselectrecordnum == 1 && !fun.menuname)
            count++;
    })
    if (hasEdit(moduleInfo))
        count++;
    if (hasDelete(moduleInfo))
        count++;
    return count;
}

/**
 * 生成所有附加功能里面只选择一条记录的操作
 */
const getAdditionFunction: React.FC<ActionsProps> =
    ({ moduleInfo, moduleState, dispatch, record }): any => {
        const { additionFunctions: functions } = moduleInfo;
        const result: any = [];
        functions.map((fun: AdditionFunctionModal) => {
            if (fun.minselectrecordnum == 1 && fun.maxselectrecordnum == 1 && !fun.menuname) {
                result.push(<Tooltip title={fun.title} key={fun.fcode}><a>
                    <span
                        className={fun.iconcls}
                        onClick={() => {
                            const params: ActionParamsModal = {
                                moduleInfo, moduleState, dispatch, funcDefine: fun, record,
                            }
                            if (systemActions[fun.fcode])
                                systemActions[fun.fcode](params);
                            else
                                message.error(`${moduleInfo.title}功能『${fun.title}』的执行函数“${fun.fcode}”没有找到！`)
                        }} />
                </a></Tooltip>)
            }
        })
        return result;
    }

const getDisplayAction: React.FC<ActionsProps> = ({ dispatch, moduleState, record }) => {
    const { formState, moduleName } = moduleState;
    return <a key="recorddisplay"
        onClick={() => {
            dispatch({
                type: 'modules/formStateChanged',
                payload: {
                    moduleName,
                    formState: {
                        ...formState,
                        visible: true,
                        formType: 'display',
                        currRecord: record, // convertToFormRecord(record, moduleInfo),
                    },
                }
            })
        }}><FileTextOutlined />
    </a>;
}

/**
 * 修改记录的action,放在grid列表的记录的最后
 * @param param0 
 */
const getEditAction: React.FC<ActionsProps> = ({ moduleInfo, moduleState, dispatch, record }) => {
    const { formState, moduleName } = moduleState;
    const state = canEdit(moduleInfo, record);
    return state.canEdit ?
        <a key="recordedit"
            onClick={() => {
                dispatch({
                    type: 'modules/formStateChanged',
                    payload: {
                        moduleName,
                        formState: {
                            ...formState,
                            visible: true,
                            formType: 'edit',
                            currRecord: record,
                        },
                    }
                })
            }}><EditOutlined />
        </a> :
        <Tooltip title={state.message} key="recorddontedit">
            <Text type='secondary' style={{ cursor: "not-allowed" }}>
                <EditOutlined />
            </Text>
        </Tooltip >
}

/**
 * 记录删除的action,放在grid列表的记录的最后
 * @param param0 
 */
const getDeleteAction: React.FC<ActionsProps> = ({ moduleInfo, dispatch, record }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [visible, setVisible] = useState<boolean>(false);
    const recordTitle = <span>{moduleInfo.title}『 <b> {record[moduleInfo.namefield]}</b>』</span>;
    const deleteRecord = () => {
        const { modulename: moduleName, primarykey } = moduleInfo;
        const stateInfo = (state: string) => <span>{recordTitle} {state}</span>;
        setVisible(true);
        setLoading(true);
        deleteModuleRecord({
            moduleName,
            recordId: record[primarykey]
        }).then((result: any) => {
            setLoading(false);
            setVisible(false);
            if (result.resultCode === 0) {
                message.success(stateInfo('已成功删除！'));
                dispatch({
                    type: 'modules/fetchData',
                    payload: {
                        moduleName,
                        forceUpdate: true,
                    }
                })
                return true;
            }
            Modal.warning({
                okText: '知道了',
                title: stateInfo('删除失败'),
                content: <span dangerouslySetInnerHTML={{ __html: result.message }}></span>,
                width: 500,
            });
            return null;
        }).finally(() => {
        }); // 清除正在删除的提示信息
    };
    const state = canDelete(moduleInfo, record);
    return state.canDelete ?
        <Popconfirm visible={visible} key="recorddelete"
            trigger="click"
            placement="topRight"
            onVisibleChange={v => setVisible(v)}
            okButtonProps={{ loading: loading }}
            okType="danger"
            okText="删除"
            onConfirm={deleteRecord}
            onCancel={() => setVisible(false)}
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            title={<span style={{ paddingBottom: '15px' }} > 确定要删除{recordTitle}吗?</span>}>
            <a><DeleteOutlined /></a>
        </Popconfirm> :
        <Tooltip title={state.message} key="recordnotdelete">
            <Text type='secondary' style={{ cursor: "not-allowed" }}>
                <DeleteOutlined />
            </Text>
        </Tooltip >

}