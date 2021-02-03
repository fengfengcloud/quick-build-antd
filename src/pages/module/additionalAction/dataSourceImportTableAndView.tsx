import React, { Key, useEffect, useState } from 'react';
import { ActionParamsModal } from './systemAction';
import { DrawerProps } from 'antd/lib/drawer';
import { Button, Card, Checkbox, Col, Form, Input, message, Row, Space, Table, Tooltip, Tree, Typography } from 'antd';
import { setGlobalDrawerProps } from '@/layouts/BasicLayout';
import request from '@/utils/request';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { serialize } from 'object-to-formdata';
import { getParentOrNavigateIdAndText } from '../modules';
const { Title, Paragraph } = Typography;

interface ImportDrawerProps extends DrawerProps {
    children: any,
}

const context = <Typography>
    <Title level={5}>转入相关说明</Title>
    <Paragraph>
        <ul>
            <li>表对象前缀_数据库的表名’为生成的模块名，模块和字段名的转换都是按照驼峰命名规则进行；</li>
            <li>表必须有唯一主键,不能有复合主键; 视图也必须有唯一主键,主键设置可以在导入表信息后自行设置; 必须有名称字段，如果没有可以设置为主键字段；</li>
            <li>各表之间的关联关系是树状结构，不许有循环引用;表自顶向下导入;所有视图的关联关系需要自己设置；</li>
            <li>业务数据库的表仅用于查询，不用建立实体bean；</li>
            <li>具有树形结构的表(代码分级或id-pid类型)只能用做于基础模块，不能用于有大量数据的业务模块；</li>
            <li>请建立一个只读帐号来操作业务数据库,确保业务数据库不受本系统的影响；</li>
        </ul>
    </Paragraph>
</Typography>;

/**
 * 
 * 导入表和字段
 * @param params 
 * 
 */
export const dataSourceImportTableAndView = (params: ActionParamsModal) => {
    const { record } = params;

    const FormComponent = () => {
        const [tableviews, setTableviews] = useState<any>([]);
        const [schema, setSchema] = useState<string | null>(null);
        const [selected, setSelected] = useState<string | null>();
        const [fieldSource, setFieldSource] = useState<any[]>([]);
        const [form] = Form.useForm();

        const columns: any = [{
            dataIndex: 'order',
            title: '序号',
            width: '48px',
            align: 'right',
            render: (_: any, record: any, index: number) => {
                return index + 1;
            }
        }, {
            dataIndex: 'fieldname',
            title: '字段名',
        }, {
            dataIndex: 'comments',
            title: '字段名',
        }, {
            dataIndex: 'namefield',
            title: '名称字段',
            align: 'center',
            width: '76px',
            render: (value: any, record: any) => <Checkbox checked={!!value}
                onChange={(e: CheckboxChangeEvent) => {
                    fieldSource.forEach(field => {
                        field.namefield = e.target.checked ? field.fieldname === record.fieldname : false;
                    })
                    setFieldSource([...fieldSource]);
                }} />
        }, {
            dataIndex: 'fieldtype',
            title: '字段类型',
        }, {
            dataIndex: 'fieldlen',
            title: '长度',
        }, {
            dataIndex: 'fieldrelation',
            title: '关联关系',
        }, {
            dataIndex: 'jointable',
            title: '关联表',
            render: (value: string, record: any) => {
                if (!value) return value;
                if (!record["by5"]) return value;
                return <Tooltip title="转到此表或视图">
                    <Button type='link' style={{ padding: 0, margin: 0 }}
                        onClick={() => {
                            selectTableView(value);
                        }}>{value}
                    </Button>
                </Tooltip>;
            }
        }, {
            dataIndex: 'by5',
            title: '备注',
            render: (value: string) => <span dangerouslySetInnerHTML={{ __html: value }}></span>,
            flex: 1,
        }];

        const selectTableView = (selectedTableViewName: string | null) => {
            setSelected(selectedTableViewName);
            form.setFieldsValue({
                title: selectedTableViewName
            });
            if (selectedTableViewName) {
                request(`/api/platform/database/getfields.do?schema=${schema ?
                    schema : ''}&tablename=${selectedTableViewName}`)
                    .then((response: any) => { setFieldSource(response) });
            } else
                setFieldSource([]);
        }

        // 导入后把导入的表或视图从树中删除
        const removeTableView = (selectedTableViewName: string) => {
            tableviews.forEach((rec: any) => {
                if (rec.children)
                    rec.children = rec.children.filter((r: any) => r.title != selectedTableViewName)
            })
            setTableviews([...tableviews]);
            selectTableView(null)
        }

        const importAction = () => {
            const objectgroup: string = form.getFieldValue('objectgroup');
            const title: string = form.getFieldValue('title');
            let namefield = null;
            fieldSource.forEach(rec => {
                if (rec.namefield)
                    namefield = rec.fieldname;
            })
            if (!selected) {
                message.warn('请先选择一个表或视图！');
                return;
            }
            if (!objectgroup) {
                message.warn('请先选择一个模块分组！');
                return;
            }
            if (!namefield) {
                message.warn('没有选择名称字段，请在下面的grid中选择一个名称字段，如果没有名称字段，则选择主键！');
                return;
            }
            if (!title) {
                message.warn('请录入模块中文名称！');
                return;
            }
            request('/api/platform/database/importtableorview.do', {
                params: {
                    schema,
                    tablename: selected,
                    title,
                    namefield,
                    objectgroup,
                }
            }).then((response) => {
                if (response.status)
                    message.error(selected + '--表信息导入失败，请检查后台日志！');
                else {
                    message.info(selected + '--表信息导入成功！');
                    removeTableView(selected);
                }
            })
        };

        const toolbar = (
            <Card bodyStyle={{ padding: 0, margin: 0 }}>
                <Form form={form}>
                    <Space size='large' style={{ padding: '16px', margin: 0 }}>
                        <Form.Item label='模块中文名称：' name="title" style={{ marginBottom: 0 }}>
                            <Input style={{ width: 200 }} />
                        </Form.Item>
                        <Form.Item label='模块分组名称：' name="objectgroup" style={{ marginBottom: 0 }}>
                            <Input style={{ width: 200 }} />
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button type='primary' onClick={importAction}>导入</Button>
                        </Form.Item>
                    </Space>
                </Form>
                <Row>
                    <Col span={6}>
                        <Card title="未加入到系统的表和视图" size='small'
                            bodyStyle={{ maxHeight: '600px', overflowY: 'auto' }}>
                            <Tree treeData={tableviews} showLine key="_tableviewstree"
                                expandedKeys={['table', 'view']}
                                selectedKeys={[selected as string]}
                                onSelect={(selectedKeys: Key[], info: {
                                    event: 'select';
                                    selected: boolean;
                                }) => {
                                    if (info.selected) {
                                        selectTableView(selectedKeys[0] as string);
                                    } else {
                                        selectTableView(null)
                                    }
                                }}
                            >
                            </Tree>
                        </Card>
                    </Col>
                    <Col span={18}>
                        <Card title="字段信息" size='small'
                            bodyStyle={{ maxHeight: '600px', overflowY: 'auto' }}>
                            <Table columns={columns} size='small' bordered dataSource={fieldSource}
                                pagination={false} key="_fieldtable" rowKey='fieldname'>
                            </Table>
                        </Card>
                    </Col>
                </Row>
            </Card>
        )

        // 获取数据库未导入的表和视图
        const getTableViews = () => {
            request('/api/platform/datasource/getnotimporttableview.do', {
                params: {
                    databaseschemeid: record['schemaid']
                }
            }).then((response: any) => {
                setTableviews(response.children.map((child: any) => {
                    return {
                        title: child.text,
                        key: child.value,
                        selectable: false,
                        children: child.children && child.children.map((c: any) => ({
                            title: c.text,
                            key: c.value,
                        }))
                    }
                }));
            })
        }

        // useEffect(() => {
        //     getTableViews();
        // }, [])

        return toolbar;
    }

    const props: ImportDrawerProps = {
        visible: true,
        title: <>{`『${record.title}』数据库表和视图的导入`}</>,
        width: '100%',
        zIndex: undefined,
        children: <span>{context}<FormComponent /></span>,
        onClose: () => setGlobalDrawerProps((props: any) => ({ visible: false })),
    }
    setGlobalDrawerProps(props);
}


/**
 * 刷新一个表的字段，把表中没有的字段加进来。
 * @param params 
 */
export const refreshFields = (params: ActionParamsModal) => {
    const { record, dispatch, moduleState } = params;
    const { moduleName } = moduleState;
    if (moduleName === 'FDataobjectfield')
        return refreshFieldsInDataobjectFields(params);
    const title = record['title'];
    const objectid = record['objectid'];
    request('/api/platform/database/refreshtablefields.do', {
        method: 'POST',
        data: serialize({
            objectid
        })
    }).then(response => {
        if (response.tag === 0)
            message.info(`模块${title}表中没有发现新增的字段`);
        else {
            message.info(`已成功刷新字段，共加入了 ${response.tag} 个字字段, 字段名称是: ${response.msg}`);
            dispatch({
                type: 'modules/refreshRecord',
                payload: {
                    moduleName,
                    recordId: objectid,
                },
            })
        }
    })

}

/**
 * 在实体对象字段模块中刷新字段
 * @param params 
 */
const refreshFieldsInDataobjectFields = (params: ActionParamsModal) => {
    const { moduleState, dispatch } = params;
    const filter = getParentOrNavigateIdAndText(moduleState, 'FDataobject');
    if (!filter) {
        message.warn('请先在导航列表中选择一个实体对象！');
        return;
    }
    const title = filter.text;
    const objectid = filter.id;
    request('/api/platform/database/refreshtablefields.do', {
        method: 'POST',
        data: serialize({
            objectid
        })
    }).then(response => {
        if (response.tag === 0)
            message.info(`模块${title}表中没有发现新增的字段`);
        else {
            message.info(`已成功刷新字段，共加入了 ${response.tag} 个字字段, 字段名称是: ${response.msg}`);
            dispatch({
                type: 'modules/fetchData',
                payload: {
                    moduleName: moduleState.moduleName,
                    forceUpdate: true,
                }
            })
        }
    })

}