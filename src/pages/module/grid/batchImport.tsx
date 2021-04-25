import React, { useState } from 'react';
import { download } from '@/utils/utils';
import { FileExcelOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Card, Input, Space, Form, Table, Drawer, Switch } from 'antd';
import { ModuleFieldType, ModuleState } from '../data';
import { getFieldDefine, getGridBatchImport, getModuleInfo } from '../modules';
import { integerRender } from './columnRender';
import { saveOrUpdateRecord } from '../service';

interface BatchImportParams {
  moduleState: ModuleState;
}

enum Steps {
  Init, // 导入页面刚进来的状态
  CopyCliboard, // 已经将导入数据通过剪切版或者上传文件转入到了Table中
  FirstValidate, // 已经初步验证过了
  Import, // 已经导入过了
}

/**
 * 模块数据导入
 *
 * 1、在表单form方案中创建gridimportfields类型的方案，把要导入的字段都加进去；
 * 2、下载模块导入数据的模板Excel文件；
 * 3、把模块数据填写到模板文件中；
 * 4、上传填写好的Excel文件；
 * 5、在表单中查看预处理的信息；
 * 6、选中记录，进行导入操作（每条记录单独导入，不是整体事务，写入一条算一条的方式）。
 *
 * @param param0
 * @returns
 */
const BatchImportButton: React.FC<BatchImportParams> = ({ moduleState }) => {
  const { moduleName } = moduleState;
  const moduleInfo = getModuleInfo(moduleName);
  const [batchImportVisible, setBatchImportVisible] = useState<boolean>(false);
  const [step, setStep] = useState<Steps>(Steps.Init);
  const [dataText, setDataText] = useState<string>('');
  const [dataSource, setDataSource] = useState<any[]>([]);

  const getColumns = (): any[] => {
    return getGridBatchImport(moduleInfo).details.map((col: any) => {
      const field: ModuleFieldType = getFieldDefine(col.fieldid, moduleInfo);
      return {
        dataIndex: field.fieldname,
        title: field.fieldtitle,
      };
    });
  };
  const [columns] = useState<any[]>(getColumns());

  const createDataSource = () => {
    if (!dataText) return;
    const separator = dataText.indexOf('\t') === -1 ? ',' : '\t';
    const records: any[] = dataText.split(/\r?\n/);
    setDataSource(
      records.map((record, index) => {
        const arecord = { keyOfImportRecord: `${index + 1}` };
        const datas = record.split(separator);
        for (let i = 0; i < columns.length; i += 1) {
          arecord[columns[i].dataIndex] = datas[i];
        }
        return arecord;
      }),
    );
  };

  const saveRecord = async (rec: any) => {
    const record = rec;
    const data = { ...record };
    delete data.keyOfImportRecord;
    delete data.statusOfImportRecord;
    return saveOrUpdateRecord({
      moduleName,
      opertype: 'insert',
      data: record,
    }).then((response: any) => {
      if (response.success) {
        record.statusOfImportRecord = 'ok';
        setDataSource([...dataSource]);
      } else {
        let msg =
          (typeof response.message === 'string'
            ? response.message
            : JSON.stringify(response.message)) || '';
        const { data: errors } = response;
        if (errors) {
          Object.keys(errors).forEach((fn) => {
            const fi: ModuleFieldType = getFieldDefine(fn, moduleInfo);
            msg += (fi ? fi.fieldtitle : fn) + errors[fn];
          });
        }
        record.statusOfImportRecord = `error:${msg}`;
        setDataSource([...dataSource]);
      }
      console.log(`${record.keyOfImportRecord}完成`);
    });
  };

  const executeImport = async () => {
    for (let i = 0; i < dataSource.length; i += 1) {
      const record = dataSource[i];
      console.log(`${record.keyOfImportRecord}开始`);
      /* eslint-disable no-await-in-loop */
      await saveRecord(record);
      /* eslint-ensable no-await-in-loop */
    }
  };

  // me.validAllRecord();
  const ImportGrid = () => {
    return (
      <Table
        size="small"
        bordered
        rowSelection={{ type: 'checkbox' }}
        dataSource={dataSource}
        rowKey="keyOfImportRecord"
        pagination={{ pageSize: 20 }}
        columns={[
          {
            dataIndex: 'keyOfImportRecord',
            title: '序号',
            width: 48,
            align: 'right',
            render: (value) => integerRender(value),
          },
          {
            dataIndex: 'statusOfImportRecord',
            title: '导入状态',
            width: 96,
          },
          ...columns,
        ]}
        scroll={{ x: true, y: '100%' }}
      />
    );
  };

  return (
    <React.Fragment>
      <Button onClick={() => setBatchImportVisible(true)}>导入</Button>
      <Drawer
        title={`${moduleInfo.title}数据导入`}
        visible={batchImportVisible}
        width="100%"
        onClose={() => {
          setStep(Steps.Init);
          setDataText('');
          setBatchImportVisible(false);
          setDataSource([]);
        }}
      >
        <span style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Space style={{ paddingBottom: 16 }}>
            <Button disabled={step !== Steps.Init} onClick={() => setStep(Steps.CopyCliboard)}>
              <UploadOutlined /> ①上传导入文件
            </Button>
            <Button
              disabled={step !== Steps.CopyCliboard}
              onClick={() => {
                setStep(Steps.FirstValidate);
                createDataSource();
              }}
            >
              ②数据校验
            </Button>
            <Button disabled={step !== Steps.FirstValidate} onClick={executeImport}>
              ③数据导入
            </Button>
            <Button
              onClick={() => {
                download('/api/platform/dataobjectimport/downloadimporttemplate.do', {
                  objectid: moduleName,
                });
              }}
            >
              <FileExcelOutlined /> 下载模板文件
            </Button>
          </Space>
          <Space style={{ paddingBottom: 16 }} size="large">
            <span>
              加入限定条件或导航值：
              <Switch checkedChildren=" 请加入 " unCheckedChildren=" 不加入 " defaultChecked />
            </span>{' '}
            <span>
              加入从服务端获得的值：
              <Switch checkedChildren=" 请加入 " unCheckedChildren=" 不加入 " defaultChecked />
            </span>
            <span>
              加入所有默认值的字段：
              <Switch checkedChildren=" 请加入 " unCheckedChildren=" 不加入 " defaultChecked />
            </span>
          </Space>
          <Card style={{ flex: 1 }} bodyStyle={{ height: '100%' }}>
            {step === Steps.Init || step === Steps.CopyCliboard ? (
              <Form style={{ height: '100%' }}>
                <Form.Item noStyle name="uploaddata" style={{ height: '100%' }}>
                  <Input.TextArea
                    style={{ height: '100%' }}
                    autoSize={false}
                    value={dataText}
                    onChange={(element) => {
                      const { value } = element.target;
                      setDataText(value);
                      setStep(value ? Steps.CopyCliboard : Steps.Init);
                    }}
                    placeholder="请将导入数据分行以Tab为分隔粘贴在此处。可以在Excel中选择数据复制后，粘贴进来即可。"
                  />
                </Form.Item>
              </Form>
            ) : null}
            {step === Steps.FirstValidate ? (
              <span>
                数据校验:
                <ImportGrid />
              </span>
            ) : null}
          </Card>
        </span>
      </Drawer>
    </React.Fragment>
  );
};

export default BatchImportButton;
