import React, { useEffect, useState } from 'react';
import { Dispatch } from 'redux';
import request, { syncRequest } from '@/utils/request';
import { Form, Input, Space, message, Modal, Popconfirm, InputNumber, DatePicker, Checkbox, Row, Col } from 'antd';
import Button from 'antd/es/button';
import { ModuleFieldType, ModuleModal } from '../data';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { refreshNotices } from '@/components/GlobalHeader/NoticeIconView';
import { DateFormat, DateTimeFormatWithOutSecond } from '../moduleUtils';
import { getPercentFormField } from '../form/formFactory';
import { convertToFormRecord } from '../form/formUtils';
import { getFieldDefine } from '../modules';

// 保存每一个流程定义的所有usertask的form和outgoing。在和当前的不一样的时候，如果有缓存就调用当前的

// {"outgoing":[{"name":"审批","id":"flow2"}],"formdata":[]}
interface ProcTaskButton {
    name: string,
    id: string,
}

interface ProcTaskDefine {
    outgoing: ProcTaskButton[],
    formdata: any[],
}

interface ApproveFormPrpos {
    moduleInfo: ModuleModal;
    record: any;
    dispatch: Dispatch;
}

const actProcTaskDefs = new Map<string, ProcTaskDefine>();

const FormItem = Form.Item;

// 根据流程定义id和任务定义id取得该任务的formdata和outgoing值
const getProcTaskDef = (procdefid: string, taskkey: string): any => {
    const key = procdefid + '+' + taskkey;
    if (!actProcTaskDefs.has(key)) {
        const result: ProcTaskDefine = syncRequest('/api/platform/workflow/task/getdefinfo.do', {
            params: {
                procdefid,
                taskkey,
            },
        });
        actProcTaskDefs.set(key, result);
    }
    return actProcTaskDefs.get(key);
}

const approve_context_ = "approve_context_";

export const ApproveForm: React.FC<ApproveFormPrpos> = ({ moduleInfo, record, dispatch }) => {
    const [form] = Form.useForm();
    const [fieldsValidate, setFieldsValidate] = useState({});
    useEffect(() => {
        setFieldsValidate({});
        form.resetFields();
        form.setFieldsValue(convertToFormRecord(record, moduleInfo));
    }, [record]);
    const labelCol = { flex: `0 0 120px` };
    const actProcDefId = record['actProcDefId'];
    const actTaskDefKey = record['actTaskDefKey'];
    const defs: ProcTaskDefine = getProcTaskDef(actProcDefId, actTaskDefKey);

    const submitApprove = ({ submitData, button }:
        { submitData: any, button: ProcTaskButton }) => {
        const { primarykey, namefield, modulename: moduleName } = moduleInfo;
        const id = record[primarykey];
        const name = record[namefield];
        const approveContext = submitData['approve_context_'];          // 审批意见
        let moduledata = { ...submitData };
        delete moduledata.approve_context_;
        // 如果有修改的业务数据，加入id
        if (Object.getOwnPropertyNames(moduledata).length > 0) {
            moduledata[moduleInfo.primarykey] = id;
        } else moduledata = null;
        request('/api/platform/workflow/runtime/complete.do', {
            params: {
                objectName: moduleName,
                id,
                name,
                taskId: record['actExecuteTaskId'],
                outgoingid: button.id, // 选中的连线的id
                outgoingname: button.name,// 选中的连线的name
                type: button.name,// 选中的连线的name
                content: approveContext || '', // 审批里写的文字
                moduledata: moduledata ? JSON.stringify(moduledata) : moduledata
                // 业务系统的修改字段
            }
        }).then((response) => {
            if (response.success) {
                setFieldsValidate({});
                // 需要刷新主页上面的提示还有多少审批信息的内容。refresh
                const toastText = '『' + name + '』的 ' + button.name + ' 操作已完成!';
                message.success(toastText);
                dispatch({
                    type: 'modules/refreshRecord',
                    payload: {
                        moduleName,
                        recordId: id,
                    },
                });
                refreshNotices();
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
                        errorMessage.push(<div>
                            <li key={'key_' + fn}><b>{fi ? fi.fieldtitle : fn}</b>：{errors[fn]}</li>
                        </div>)
                    }
                }
                console.log(errors);
                Modal.error({
                    width: 500,
                    title: '记录保存时发生错误',
                    content: <ul style={{ listStyle: 'decimal' }}>{errorMessage}</ul>,
                });
            }
        })
    }


    const getFormItem = () => {
        return defs.formdata?.map((item: any) => {
            const type = ((item.type || 'string') as string).toLowerCase();
            const colspan = item.colspan || 1;
            const formItemProp: any = {};
            let field: any;
            switch (type) {
                case 'double':
                case 'float':
                    field = <InputNumber className='double'
                        precision={2}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value: any) => value.replace(/\$\s?|(,*)/g, '')}
                        style={{ width: '138px' }}
                    />
                    break;
                case 'int':
                case 'integer':
                    field = <InputNumber precision={0} className='integer'
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value: any) => value.replace(/\$\s?|(,*)/g, '')}
                        style={{ width: '120px' }} />
                    break;
                case 'percent':
                    field = getPercentFormField(2, {});
                    break;
                case 'date':
                    field = <DatePicker format={DateFormat} />
                    break;
                case 'datetime':
                case 'timestamp':
                    const dateFormat = DateTimeFormatWithOutSecond;
                    field = <DatePicker showTime format={dateFormat} />
                    break;
                case 'boolean':
                    field = <Checkbox />;
                    formItemProp.valuePropName = 'checked'
                case 'string':
                    const len = item.fieldlen;
                    if (len > 0 && len <= 100)      // allowClear={!fieldDefine.isrequired}
                        field = <Input maxLength={len}
                            style={len <= 10 ? { maxWidth: (len * 16 + 24) + 'px' } : {}} />
                    else if (len == 0)
                        field = <Input.TextArea autoSize />
                    else
                        field = <Input.TextArea maxLength={len}
                            autoSize={{ maxRows: 10 }} />
                    break;
                default:
            }
            return <Col xs={24}
                md={12 * Math.min(colspan, 2)}
                xl={(24 / 2) * Math.min(colspan, 2)}
                key={item.id} >
                {item.unittext ?
                    <FormItem label={item.label} key={item.id + '1'} labelCol={labelCol}>
                        <FormItem noStyle name={item.id} key={item.id}
                            validateStatus={fieldsValidate[item.id] ? 'error' : undefined}  //'error'表示出错
                            help={fieldsValidate[item.id] || item.help}
                            {...formItemProp} >
                            {field}
                        </FormItem>
                        <span style={{ paddingLeft: '5px' }}>{item.unittext}</span>
                    </FormItem> :
                    <FormItem label={item.label} name={item.id} key={item.id}
                        validateStatus={fieldsValidate[item.id] ? 'error' : undefined}  //'error'表示出错
                        help={fieldsValidate[item.id] || item.help}
                        {...formItemProp} labelCol={labelCol} >
                        {field}
                    </FormItem>}
            </Col>
        })
    }

    return <Form className="moduleform" autoComplete="off" form={form}>
        <Row gutter={16}>
            {getFormItem()}
            <Col xs={24} key={approve_context_}>
                <FormItem label="审批意见" name={approve_context_} labelCol={labelCol} key={approve_context_} >
                    <Input.TextArea autoSize={{ maxRows: 10 }} maxLength={200} />
                </FormItem>
            </Col>
            <Col xs={24} key="approve_buttons">
                <Space style={{ float: 'right', marginTop: '4px' }}>{
                    defs.outgoing.map((button: ProcTaskButton, index) =>
                        <Form.Item noStyle shouldUpdate={true}>
                            {(form: any) => {
                                console.log(button)
                                return (
                                    <Popconfirm
                                        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                        title={'确定要执行『' + button.name + '』的任务操作吗?'}
                                        onConfirm={() => {
                                            const submitData = form.getFieldsValue();
                                            submitApprove({ submitData, button })
                                        }}
                                    >
                                        <Button type={index == 0 ? 'primary' : 'default'}>{button.name}
                                        </Button>
                                    </Popconfirm>
                                )
                            }}
                        </Form.Item>
                    )
                }
                </Space>
            </Col>
        </Row>
    </Form>
}
