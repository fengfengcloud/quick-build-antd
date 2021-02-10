import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, message, Space, Drawer, Tooltip, Popconfirm, Typography } from 'antd';
import {
    EditOutlined, PlusOutlined, SaveOutlined, CopyOutlined, CloseOutlined, FileTextOutlined,
    RollbackOutlined, DownloadOutlined, AuditOutlined, PlayCircleOutlined, LeftOutlined, RightOutlined, 
    ReloadOutlined, CheckCircleOutlined, QuestionCircleOutlined, UndoOutlined, PrinterOutlined
} from '@ant-design/icons';
import { ModuleModal, ModuleFieldType, ModuleState, FormState, AdditionFunctionModal } from '../data';
import { getFormSchemePanel } from './formFactory';
import { saveOrUpdateRecord, downloadRecordExcel } from '../service';
import { Dispatch } from 'redux';
import { AttachemntRenderer } from '../attachment/utils';
import ClosePopconfirm from './component/closePopconfirm';
import { getDifferentField, convertToFormRecord, getNewDefaultValues } from './formUtils';
import { apply, showResultInfo } from '@/utils/utils';
import { getFieldDefine, hasInsert, hasEdit, canEdit, insertToModuleComboDataSource } from '../modules';
import { ShowTypeSelect } from './component/showTypeSelect';
import { PageHeaderWrapper, GridContent } from '@ant-design/pro-layout';
import { ActionParamsModal, systemActions } from '../additionalAction/systemAction';
import { canStartProcess, startProcess, isStartProcess, getApproveIconClass } from '../approve/utils';
import FooterToolbar from './component/footToolbar';
import { getSelectedRecord } from '../moduleUtils';
import { DrawerRecordPdfScheme } from '../toolbar/export/DrawerRecordPdfScheme';
import { isAudited, canAudited, canCancelAudited, auditRecord, cancelAudit } from '../audit/utils';
import { businessActionButtons } from '../additionalAction/businessAction';
import { execPrintRecordScheme } from '../toolbar/export/PrintRecordScheme';
import { AuditFinished, AuditWaititng } from '../constants';

interface ModuleFormProps {
    moduleInfo: ModuleModal,
    moduleState: ModuleState,
    dispatch: Dispatch,
    callback?: Function,           // form 关闭时的回调函数
    hiddenSetNull?: boolean,       // 如果隐藏那么就返回null,
}

const ModuleForm: React.FC<ModuleFormProps> = ({ moduleInfo, moduleState, dispatch, callback, hiddenSetNull }) => {
    const { formState } = moduleState;
    const { visible, currRecord, formType, showType } = formState;
    // console.log('module form ........' + formType + ', 传入的记录如下')
    // console.log(currRecord);
    // console.log('--------');
    // console.log(formState);
    if ((showType === 'mainregion' || hiddenSetNull) && !visible)  // 其他二种不显示时也返回原值，可以有动画的隐藏效果
        return null;
    const { modulename: moduleName, primarykey, namefield, moduleLimit, userLimit } = moduleInfo;
    const scheme = moduleInfo.formschemes[0];
    const [form] = Form.useForm();
    // 只是为了调用setV来刷新界面的折叠panel
    const [v, setV] = useState(0); v;
    // 在保存了新建的记录后，此值置为true
    const [isAfterSave, setIsAfterSave] = useState(false);
    // 从后台返回的错误信息
    const [fieldsValidate, setFieldsValidate] = useState({});
    const [readOnly, setReadOnly] = useState(false);
    const [saveing, setSaving] = useState(false);
    const [changed, setChanged] = useState(0);
    const setFormState = (formState: FormState) => {
        dispatch({
            type: 'modules/formStateChanged',
            payload: {
                moduleName,
                formState,
            }
        })
    }

    useEffect(() => {
        console.log('module form use effect')
        // 当currRecord改变了以后，执行此操作
        setChanged(0);
        form.resetFields();
        setFieldsValidate({});
        form.setFieldsValue(convertToFormRecord(currRecord, moduleInfo));
        if (visible && formType === 'insert' && !isAfterSave) {
            setTimeout(() => {
                form.setFieldsValue(apply(form.getFieldsValue(),
                    getNewDefaultValues(form, moduleState, setV)));
            }, 0);
        }
        if (formType === 'edit') {
            setReadOnly(!canEdit(moduleInfo, currRecord).canEdit);
        }
    }, [currRecord])

    const onCloseWindow = () => {
        setFormState({
            ...formState,
            visible: false,
        });
        setTimeout(() => {
            setReadOnly(false);
            setIsAfterSave(false);
            setChanged(0);
            form.resetFields();
        }, 0);
        if (callback) {
            setTimeout(() => {
                callback();
            }, 0);
        }
    }

    const getTitle = () => {
        const title = form.getFieldValue(moduleInfo.namefield) || currRecord[moduleInfo.namefield]; // + '--' + currRecord[primarykey];
        return <Space>{formType === 'edit' ? <EditOutlined /> :
            formType === 'insert' ? <PlusOutlined /> :
                formType === 'display' ? <FileTextOutlined /> :
                    formType === 'approve' ? <AuditOutlined /> :
                        formType === 'audit' ? <CheckCircleOutlined /> : formType}
            <span style={{ fontWeight: 400, marginLeft: '4px' }}> {moduleInfo.title}</span>
            {title ? ' 『 ' + title + '』' : null}
            {moduleInfo.moduleLimit.hasapprove && currRecord[primarykey] && moduleName !== 'VActRuTask' ?
                <Typography.Text type="secondary" code >
                    <span className={getApproveIconClass(moduleInfo, currRecord)}
                        style={{ marginRight: '4px' }} />
                    {currRecord['actProcState']}</Typography.Text>
                : null
            }
            {moduleInfo.moduleLimit.hasaudit && currRecord[primarykey] ? !isAudited(currRecord) ?
                 AuditWaititng : AuditFinished : null
            }
        </Space >
    }

    const getHeaderButtons = () => {
        const getRefreshButon = () => {
            return formType !== 'insert' && !moduleInfo.moduleLimit.hassqlparam ?
                <Tooltip title="刷新当前记录">
                    <ReloadOutlined onClick={() => {
                        dispatch({
                            type: 'modules/refreshRecord',
                            payload: {
                                moduleName,
                                recordId: currRecord[primarykey],
                            },
                        })
                    }} />
                </Tooltip> : null
        }
        const getAttachmentButton = () => {
            if (moduleLimit.hasattachment && userLimit.attachment?.query && currRecord[primarykey]) {
                return <span style={{ verticalAlign: 'text-bottom' }}>
                    <AttachemntRenderer value={currRecord?.attachmentdata} record={currRecord} _recno={0}
                        moduleInfo={moduleInfo} dispatch={dispatch} isLink={false} readonly={!!changed} />
                </span>
            } else return null;
        }
        // 生成所有附加功能里面只选择一条记录的操作
        const getAdditionFunction = () => {
            // 如果无当前主键值，或者记录值改变了，则不显示
            if (!currRecord[primarykey] || changed) return null;
            const { additionFunctions: functions } = moduleInfo;
            const result: any = [];
            functions.map((fun: AdditionFunctionModal) => {
                if (fun.minselectrecordnum == 1 && fun.maxselectrecordnum == 1 && !fun['disableInForm']) {
                    const params: ActionParamsModal = {
                        moduleInfo, moduleState, dispatch, funcDefine: fun, record: currRecord,
                    }
                    result.push(
                        // 查一下是否有按钮字义，有则先加入按钮定义。按钮定义里面有全部的处理过程
                        businessActionButtons[fun.fcode] ? businessActionButtons[fun.fcode](params) :
                            <Tooltip title={fun.title}>
                                <span
                                    className={fun.iconcls}
                                    onClick={() => {
                                        if (systemActions[fun.fcode])
                                            systemActions[fun.fcode](params);
                                        else
                                            message.error(`${moduleInfo.title}功能『${fun.title}』的执行函数“${fun.fcode}”没有找到！`)
                                    }} />
                            </Tooltip>)
                }
            })
            return result;
        }

        const getFirstRecordExcelScheme = () => {
            if (!currRecord[primarykey] || changed) return null;
            const { excelSchemes } = moduleInfo;
            if (excelSchemes && excelSchemes.length > 0) {
                // 只加入第一个，全部加入比较乱
                const scheme = excelSchemes[0];
                const download = (filetype: any) => {
                    downloadRecordExcel({
                        recordids: currRecord[moduleInfo.primarykey],
                        moduleName: moduleInfo.modulename,
                        schemeid: scheme.schemeid,
                        filetype,
                    });
                }
                return [
                    scheme.onlypdf ? null : <Tooltip title={`导出${scheme.title}`} key='_download_'>
                        <DownloadOutlined onClick={
                            () => { download(null) }} /></Tooltip>,
                    // 这个按钮加上，按钮太多了，可以在预览中下载
                    // <Tooltip title={`导出${scheme.title}的pdf文件`} key='_exportfilepdf_'>
                    //     <FilePdfOutlined onClick={
                    //         () => { download('pdf') }} /></Tooltip>,
                    <DrawerRecordPdfScheme moduleInfo={moduleInfo} record={currRecord}
                        scheme={scheme} key='_recordpdf_' />
                ]
            } else return null;
        }

        const getRecordPrintScheme = () => {
            if (!currRecord[primarykey] || changed) return null;
            const { recordPrintSchemes } = moduleInfo;
            if (recordPrintSchemes && recordPrintSchemes.length > 0) {
                const scheme = recordPrintSchemes[0];
                return <Tooltip title={'打印' + scheme.title} key='_printrecord_'>
                    <PrinterOutlined onClick={() => {
                        execPrintRecordScheme({
                            moduleName,
                            scheme,
                            record: currRecord
                        })
                    }} />
                </Tooltip>
            } else return null;
        }

        return (
            <Space>
                {getAttachmentButton()}
                {getFirstRecordExcelScheme()}
                {getRecordPrintScheme()}
                {getAdditionFunction()}
                <ShowTypeSelect
                    moduleName={moduleName}
                    moduleState={moduleState}
                    dispatch={dispatch}
                    formState={formState}
                    changed={!!changed} />
                {getRefreshButon()}
                {/* <ClosePopconfirm
                    placement="bottom"
                    changed={!!changed}
                    confirmAction={onCloseWindow}>
                    {showType == 'mainregion' ?
                        <Tooltip title="返回列表界面">
                            <a><RollbackOutlined /> 返回列表</a>
                        </Tooltip> :
                        <CloseOutlined />}
                </ClosePopconfirm> */}
            </Space>
        )
    }

    const getTitleAndButtons = () => {
        return <span style={{ display: 'flex' }} >
            {getTitle()}
            <span style={{ flex: 1 }}></span>
            {getHeaderButtons()} </span>
    }

    const getFooter = () => {
        const closeButton = <ClosePopconfirm
            key="closeButton"
            changed={!!changed}
            confirmAction={onCloseWindow}>
            <Button key="closeButton" type={formType === 'audit' || (changed || isAfterSave) ? 'default' : 'primary'}>
                {showType == 'mainregion' ?
                    <><RollbackOutlined /> 返回列表</> :
                    <><CloseOutlined /> 关闭</>}
            </Button>
        </ClosePopconfirm>;

        // 在复制新增之前处理一下当前的记录，把主键，新增，修改日期和人员删掉，
        // 把所有只读字段删掉
        const adjustCopyedRecord = (record: any) => {
            const result = { ...record };
            delete result[primarykey];
            moduleInfo.fields.forEach((field: ModuleFieldType) => {
                if (!field.allownew)
                    delete result[field.fieldname];
            })
            return result;
        }

        const onButtonClick = (params: any) => {
            setReadOnly(false);
            setIsAfterSave(false);
            setFormState({
                ...formState,
                ...params,
            });
        }

        const gotoRecord = (record: any) => {
            dispatch({
                type: 'modules/selectedRowKeysChanged',
                payload: {
                    moduleName,
                    selectedRowKeys: [record[primarykey]],
                }
            })
            onButtonClick({
                currRecord: { ...record }
            })
        }
        const index = moduleState.dataSource.findIndex(rec => rec[primarykey] === currRecord[primarykey]);
        const priorButton = index !== -1 ? <Button key="priorButton" disabled={index <= 0}
            onClick={() => {
                if (index > 0) {
                    const record = moduleState.dataSource[index - 1];
                    gotoRecord(record);
                }
            }} ><LeftOutlined /></Button> : null;
        const nextButton = index !== -1 ? <Button key="nextButton" disabled={index == moduleState.dataSource.length - 1}
            onClick={() => {
                if (index < moduleState.dataSource.length - 1) {
                    const record = moduleState.dataSource[index + 1];
                    gotoRecord(record);
                }
            }} ><RightOutlined /></Button> : null;

        // 在新建保存后，如果有修改权限，则可对当前记录进行修改
        const editAfterInsertButton = hasEdit(moduleInfo) ?
            <Button key="editAfterInsertButton"
                onClick={() => onButtonClick({
                    formType: 'edit',
                    currRecord: { ...currRecord }
                })
                }><EditOutlined />修改</Button> : null;
        const startApproveAfterInsertButton = <Button
            onClick={() => startProcess(moduleInfo, currRecord, dispatch)}>
            <PlayCircleOutlined />启动流程
            </Button>;
        const insertButton = hasInsert(moduleInfo) ? <Button
            key="insertButton"
            type="primary"
            onClick={() => onButtonClick({
                formType: 'insert',
                currRecord: {}
            })
            }><PlusOutlined />继续新建</Button> : null;
        const insertAfterEditButton = hasInsert(moduleInfo) ?
            <Button
                key="insertAfterEditButton"
                onClick={() => onButtonClick({
                    formType: 'insert',
                    currRecord: {}
                })
                }><PlusOutlined />新建</Button> : null;
        const copyInsertButton = moduleInfo.moduleLimit.allownewinsert &&
            hasInsert(moduleInfo) ? <Button
                key="copyInsertButton"
                onClick={() => onButtonClick({
                    formType: 'insert',
                    currRecord: adjustCopyedRecord(currRecord),
                })
                }><CopyOutlined />复制新建</Button> : null;
        const importRecordInsertButton = moduleInfo.moduleLimit.allownewinsert &&
            moduleState.selectedRowKeys.length == 1 &&
            !changed && Object.getOwnPropertyNames(currRecord).length == 0 ?
            <Button
                key="importRecordInsertButton"
                onClick={() => onButtonClick({
                    formType: 'insert',
                    currRecord: adjustCopyedRecord(getSelectedRecord(moduleState)),
                })
                }><CopyOutlined />读入选中记录</Button> : null;
        const saveButton = <Button key="saveButton" type="primary" loading={saveing} disabled={!changed}
            onClick={() => { saveRecord(); }}><SaveOutlined />保存</Button>;
        const auditButton = <Button key="auditButton" type="primary" loading={saveing}
            onClick={() => { auditRecord(currRecord, moduleInfo, dispatch); }}><SaveOutlined />通过审核</Button>;
        const auditCancelButton =
            <Popconfirm
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                title={'要取消 ' + currRecord[namefield] + ' 的审核吗?'}
                onConfirm={() => cancelAudit(currRecord, moduleInfo, dispatch)}
            >
                <Button key="auditButton" danger loading={saveing} >
                    <UndoOutlined />取消审核
                </Button>
            </Popconfirm>
        if (formType === 'insert') {
            if (isAfterSave) {
                return <>
                    {closeButton}
                    {editAfterInsertButton}
                    {moduleLimit.hasaudit && canAudited(currRecord) ? auditButton : null}
                    {canStartProcess(moduleInfo) && !isStartProcess(currRecord) ? startApproveAfterInsertButton : null}
                    {copyInsertButton}
                    {insertButton}
                </>
            } else {
                return <>
                    <span style={{ float: "left", marginRight: '12px' }}>
                        {importRecordInsertButton}
                    </span>
                    {closeButton}
                    {saveButton}
                    {/* <Button
                    onClick={() => {
                        console.log(form.getFieldsValue());
                    }} >打印记录值
                    </Button> */}
                </>
            }
        } else if (formType === 'edit') {
            if (!changed) {
                return <>
                    <span style={{ float: "left", marginRight: '8px' }}>
                        {priorButton}
                        {nextButton}
                        {insertAfterEditButton}
                        {moduleLimit.hasaudit && canAudited(currRecord) ? auditButton : null}
                        {/* {isAfterSave ? copyInsertButton : null} */}
                    </span>
                    {closeButton}
                    {saveButton}
                </>
            } else
                return <>{closeButton}{saveButton}
                    {/* <Button
                    onClick={() => {
                        console.log(form.getFieldsValue());
                    }} >打印记录值
                    </Button> */}
                </>
        } if (formType === 'audit') {
            return <>
                <span style={{ float: "left", marginRight: '8px' }}>
                    {priorButton}
                    {nextButton}
                </span>
                {closeButton}
                {canAudited(currRecord) ? auditButton : null}
                {canCancelAudited(currRecord) ? auditCancelButton : null}
            </>
        } else {
            return <>
                <span style={{ float: "left", marginRight: '8px' }}>
                    {priorButton}
                    {nextButton}
                    {formType !== 'approve' ? insertAfterEditButton : null}
                </span>
                {closeButton}
            </>
        }
    }

    const getCommitValues = (formValues: object) => {
        if (formType == 'edit') {
            const values = getDifferentField({
                dest: formValues,
                sour: currRecord,
                moduleInfo
            })
            // 加入主键，主键这里不能修改，如果修改了主键另外处理
            values[primarykey] = currRecord[primarykey];
            return values;
        } else if (formType == 'insert')
            return formValues;
        else {
            message.error(`未指定的表单类型：${formType}`);
            return formValues;
        }
    }

    const saveRecord = () => {
        if (formType === 'edit') {
            const canedit = canEdit(moduleInfo, currRecord);
            if (!canedit.canEdit) {
                message.warn(canedit.message);
                return;
            }
        }
        form.validateFields().then(fieldValues => {
            setFieldsValidate({});
            setSaving(true);
            saveOrUpdateRecord({
                moduleName,
                opertype: formType,
                data: getCommitValues(fieldValues),
            }).then((response: any) => {
                console.log(response);
                const { data: updatedRecord } = response;   // 从后台返回过来的数据
                if (response.success) {
                    setIsAfterSave(true);
                    message.success(`${moduleInfo.title}的『${updatedRecord[moduleInfo.namefield]}』保存成功！`);
                    // 显示 response.resultInfo 中的内容
                    showResultInfo(response.resultInfo);
                    // 更新当前form的数据
                    if (formType == 'insert') {
                        setReadOnly(true);
                    }
                    setFormState({
                        ...formState,
                        currRecord: updatedRecord
                    });
                    if (formType == 'insert') {
                        // 新建后，选中当前记录，不然不知道操作的是哪条
                        insertToModuleComboDataSource(moduleName, updatedRecord);
                        dispatch({
                            type: 'modules/insertRecord',
                            payload: {
                                moduleName,
                                record: updatedRecord,
                            }
                        })
                    } else dispatch({
                        type: 'modules/updateRecord',
                        payload: {
                            moduleName,
                            record: updatedRecord,
                        }
                    })
                } else {
                    //response.data没处理，参考extjs版
                    const errorMessage = response.message ?
                        [<div><li>{typeof response.message === 'string' ?
                            response.message :
                            JSON.stringify(response.message)}</li></div>] : [];
                    //  样式 { personnelage : '必须小于200岁'}
                    const { data: errors } = response;
                    if (errors) {
                        setFieldsValidate(errors);
                        for (let fn in errors) {
                            const fi: ModuleFieldType = getFieldDefine(fn, moduleInfo);
                            errorMessage.push(<div><li><b>{fi ? fi.fieldtitle : fn}</b>：{errors[fn]}</li></div>)
                        }
                    }
                    Modal.error({
                        width: 500,
                        title: '记录保存时发生错误',
                        content: <ul style={{ listStyle: 'decimal' }}>{errorMessage}</ul>,
                    });
                }
            }).finally(() => {
                setSaving(false);
            })

        }).catch(errorInfo => {
            console.log(errorInfo)
        });
    }
    const onValuesChange = (_changedValues: any, _values: any) => {
        if (formType == 'audit' || formType == 'approve' || formType == 'display') {
            message.warn('当前表单状态不允许修改')
            form.resetFields();
            form.setFieldsValue(convertToFormRecord(currRecord, moduleInfo));
            return;
        }
        // console.log(_changedValues)      // 当前改变的字段
        // console.log(_values)             // 当前form的所有值
        // 第一次改变或者改变了namefield的字段值，就刷新一下
        if (!changed || _changedValues[namefield])
            setChanged((value) => value + 1);
    }
    // 为了使manytoone的selecttable在选中之后执行onChange而设置
    form['onValuesChange'] = onValuesChange;
    const { centered, hideRequiredMark, } = scheme;
    let { formLayout, formSize, } = scheme;
    formLayout = formLayout === 'vertical' ? 'vertical' : 'horizontal';
    formSize = formSize === 'small' || formSize === 'large' ? formSize : 'middle';
    const labelCol = formLayout === 'vertical' ? {} :
        { flex: `0 0 ${scheme.labelWidth || (showType == 'mainregion' ? 120 : 120)}px` };    // 如果是horizontal，那么字段label最少120px,vertical则不设置;
    const formPanel = getFormSchemePanel({
        moduleInfo, details: scheme.details,
        form, currRecord, showType, formType,
        fieldsValidate, readOnly, setV, dispatch,
        parentCols: 0,                      // 如果此值为0，则表示其子模块都需要分栏
    });
    const schemeForm = <Form className="moduleform" autoComplete="off"
        key={`form_${moduleName}_${formType}_${showType}`}
        onValuesChange={onValuesChange}
        form={form}
        labelCol={labelCol}
        layout={formLayout}
        hideRequiredMark={!!hideRequiredMark}
        size={formSize}>
        {showType == 'mainregion' ?
            <Space direction='vertical' size='middle'>
                {formPanel}
            </Space> :
            formPanel
        }
    </Form>;

    const width = scheme.width > 0 ?                //正数是像素数，负数是百分比
        Math.min(document.body.clientWidth, scheme.width) + 'px' :
        Math.abs(scheme.width) + '%';
    const windowParams = {
        title: getTitleAndButtons(),
        visible: visible,
        width: width,
        closable: false,
    }
    return showType == 'mainregion' ?
        <PageHeaderWrapper className='pageheaderformwrapper'
            title={<>
                <ClosePopconfirm
                    placement="bottom"
                    changed={!!changed}
                    confirmAction={onCloseWindow}>
                    {showType == 'mainregion' ?
                        <Tooltip title="返回列表界面">
                            <a><RollbackOutlined style={{ padding: '0 12px' }} /></a>
                        </Tooltip> :
                        <CloseOutlined />}
                </ClosePopconfirm>
                <span className="ant-page-header-heading-title">{getTitle()}</span>
            </>}
            extra={<span className="ant-modal-title" style={{ marginRight: '24px' }}>
                {getHeaderButtons()}</span>}
        >
            <GridContent>
                {schemeForm}
                <FooterToolbar>
                    {getFooter()}
                </FooterToolbar>
            </GridContent>
        </PageHeaderWrapper >
        :
        showType == 'drawer' ?
            <Drawer onClose={!changed ? onCloseWindow : () => { }} destroyOnClose
                {...windowParams}
                footer={
                    <div style={{ borderTop: '0px solid #f0f0f0', padding: 0 }}
                        className="ant-modal-footer">{getFooter()}
                    </div>}
                bodyStyle={{
                    padding: '0px 24px'
                }}>
                {schemeForm}
            </Drawer>
            :
            <Modal onCancel={!changed ? onCloseWindow : () => { }} destroyOnClose
                {...windowParams}
                centered={!!centered}
                footer={getFooter()}
                bodyStyle={{
                    // modal 模式下 减掉的110为表头和表footer的高度
                    maxHeight: Math.floor((document.body.clientHeight - 110) * 0.9) + 'px',
                    overflowY: 'auto',
                    padding: '0px 24px'
                }}>
                {schemeForm}
            </Modal>;

}

export default ModuleForm;
