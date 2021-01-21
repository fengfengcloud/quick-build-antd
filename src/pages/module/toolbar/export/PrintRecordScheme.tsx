import React from 'react';
import { Button, Card, Menu, message, Space, } from 'antd';
import { PrinterOutlined, } from '@ant-design/icons';
import { ModuleModal, ModuleState, RecordPrintSchemeModal } from '../../data';
import { getModuleInfo } from '../../modules';
import { setGlobalDrawerProps } from '@/layouts/BasicLayout';
import { getRecordByKey } from '../../moduleUtils';

const RECORDPRINT = 'recordprint';


/**
 * 打印记录的print方案
 * @param key 
 */
export const execPrintRecordScheme = ({ moduleName, scheme, record }:
    { moduleName: string, scheme: RecordPrintSchemeModal, record: any }) => {
    const moduleInfo = getModuleInfo(moduleName);
    const props = {
        visible: true,
        style: { zIndex: 1000000 },
        bodyStyle: {
            margin: 0,
            padding: 0,
            height: '100%'
        },
        width: '800px',
        closeIcon: null,
        footer: null,
        destroyOnClose: true,
        onClose: () => setGlobalDrawerProps((props: any) => ({ visible: false })),
        children: <Card size="default"
            bordered={false}
            title={<span><PrinterOutlined /> {record[moduleInfo.namefield] + ' 的 ' + scheme.title}</span>}
            style={{ height: '100%' }}
            bodyStyle={{ padding: '8px', height: '90%' }}
            extra={<Space>
                <Button type="primary"
                    onClick={() => {
                        let iframe: any = document.getElementById('_printrecord_');
                        iframe.contentWindow.print();
                    }}>打印
                    </Button>
                <Button
                    onClick={() => {
                        setGlobalDrawerProps((props: any) => ({ visible: false }))
                    }}>关闭
                    </Button>
            </Space>}>
            <iframe
                id="_printrecord_"
                src={`/api/platform/dataobjectexport/printrecord.do?` +
                    `moduleName=${moduleName}&schemeId=${scheme.schemeid}&` +
                    `id=${record[moduleInfo.primarykey]}&title=${moduleInfo.title}` +
                    `&t=${new Date().getTime()}`}
                width="100%"
                height="100%"
                frameBorder={0}
            ></iframe>
        </Card>
    }
    setGlobalDrawerProps(props);
}

const PrintRecordScheme = ({ moduleState, setVisible }:
    { moduleState: ModuleState, setVisible: Function }) => {

    const { moduleName } = moduleState;
    const moduleInfo = getModuleInfo(moduleName);

    const getRecordExcelExportItems = (moduleInfo: ModuleModal) => {
        const { recordPrintSchemes } = moduleInfo;
        if (!recordPrintSchemes)
            return null;
        const result: any[] = [];
        const items: any[] = recordPrintSchemes.map((scheme) =>
            <Menu.Item key={RECORDPRINT + "||" + scheme.schemeid + "||" + scheme.title}
                title={scheme.title} onClick={() => {
                    const { selectedRowKeys, selectedTextValue } = moduleState;
                    if (selectedRowKeys.length !== 1) {
                        message.warn('先选择一条记录，才能执行此导出操作！');
                        return;
                    }
                    setVisible(false);
                    execPrintRecordScheme({
                        moduleName,
                        scheme,
                        record: getRecordByKey(moduleState.dataSource, selectedTextValue[0].value || '', moduleInfo.primarykey),
                    })
                }}>
                {scheme.iconcls ? <span className={scheme.iconcls}></span> : <PrinterOutlined />}
                {scheme.title}
            </Menu.Item>)
        if (items.length > 0) {
            result.push(<Menu.ItemGroup title="记录打印方案" key="_export_record_key1_">
                {items}
            </Menu.ItemGroup>)
            result.push(<Menu.Divider key='_print_record_key_div' />)
        }
        return result;
    }
    return getRecordExcelExportItems(moduleInfo);
}

export default PrintRecordScheme;