import React, { useMemo, useState } from 'react';
import { applyIf, download } from '@/utils/utils';
import { FileExcelOutlined, LikeOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Input,
  Space,
  Form,
  Table,
  Drawer,
  Switch,
  Badge,
  Alert,
  Progress,
  Statistic,
  message,
} from 'antd';
import moment from 'moment';
import { API_HEAD } from '@/utils/request';
import { ModuleFieldType, ModuleState, ParentFilterModal } from '../data';
import { getFieldDefine, getGridBatchImport, getModuleInfo } from '../modules';
import { integerRender } from './columnRender';
import { getAjaxNewDefault, saveOrUpdateRecord } from '../service';
import { DateTimeFormat } from '../moduleUtils';

interface BatchImportParams {
  moduleState: ModuleState;
  dispatch: Function;
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
const BatchImportButton: React.FC<BatchImportParams> = ({ moduleState, dispatch }) => {
  const { moduleName } = moduleState;
  const moduleInfo = getModuleInfo(moduleName);
  const [batchImportVisible, setBatchImportVisible] = useState<boolean>(false);
  const [step, setStep] = useState<Steps>(Steps.Init);
  const [dataText, setDataText] = useState<string>('');
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [addParentFilter, setAddParentFilter] = useState<boolean>(true);
  const [addRemoteDefault, setAddRemoteDefault] = useState<boolean>(true);
  const [addDefaultValue, setAddDefaultValue] = useState<boolean>(true);
  // 本次一共导入了多少条记录，关闭才清零
  const [allSuccessCount, setAllSuccessCount] = useState<number>(0);
  const [executeCount, setExecuteCount] = useState<number>(0);
  const [percent, setPercent] = useState<number>(0);

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

  const importStatusRender = (value: string) => {
    if (!value) return null;
    if (value.startsWith('success')) {
      return <Badge status="success" text="写入成功" />;
    }
    if (value.startsWith('error')) {
      return <Badge status="error" text={value.substring(6)} />;
    }
    return value;
  };

  const fieldDefaultValue = useMemo(() => {
    const defaultValue: any = {};
    moduleInfo.fields
      .filter((field) => !field.isdisable && field.allownew && field.defaultvalue)
      .forEach((field) => {
        const v = field.defaultvalue;
        /* eslint-disable */
        defaultValue[field.fieldname] =
          v === 'true'
            ? true
            : v === 'false'
            ? false
            : v === 'now'
            ? moment().format(DateTimeFormat)
            : v;
        /* eslint-enable */
      });
    return defaultValue;
  }, []);

  const parentfilter: ParentFilterModal | null = useMemo(() => {
    const {
      filters: { parentfilter: pf },
    } = moduleState;
    if (pf) {
      const ahead: string | null = pf.fieldahead;
      if (ahead && ahead.indexOf('.') === -1) {
        return pf;
      }
    }
    return null;
  }, [moduleState.filters.parentfilter]);

  const saveRecord = async (rec: any) => {
    const record = rec;
    const data = { ...record };
    delete data.keyOfImportRecord;
    delete data.statusOfImportRecord;

    if (addDefaultValue) {
      applyIf(data, fieldDefaultValue);
    }
    if (addRemoteDefault) {
      // 从后台读取记录的缺省值
      const params: any = {
        objectname: moduleName,
        parentfilter: null,
        navigates: null,
      };
      const response = await getAjaxNewDefault(params);
      const ajaxDefault = response.data;
      if (ajaxDefault) {
        applyIf(data, ajaxDefault);
      }
    }

    // 加入父模块的限定条件值
    if (addParentFilter && parentfilter) {
      data[`${parentfilter.fieldahead}.${parentfilter.fieldName}`] = parentfilter.fieldvalue;
    }

    return saveOrUpdateRecord({
      moduleName,
      opertype: 'insert',
      data,
    }).then((response: any) => {
      if (response.success) {
        setAllSuccessCount((c) => c + 1);
        record.statusOfImportRecord = 'success';
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
            msg += `${fi ? fi.fieldtitle : fn}:${errors[fn]}`;
          });
        }
        record.statusOfImportRecord = `error:${msg}`;
        setDataSource([...dataSource]);
      }
      // console.log(`${record.keyOfImportRecord}完成`);
    });
  };

  const executeImport = async () => {
    const needSaves: any[] = dataSource.filter((rec) => rec.statusOfImportRecord !== 'success');
    if (needSaves.length === 0) {
      message.info('列表中的记录都上传成功了！');
      return;
    }
    for (let i = 0; i < needSaves.length; i += 1) {
      setExecuteCount(i + 1);
      setPercent(Math.floor(((i + 1) * 100) / needSaves.length));
      const record = needSaves[i];
      // console.log(`${record.keyOfImportRecord}开始`);
      /* eslint-disable no-await-in-loop */
      await saveRecord(record);
      /* eslint-ensable no-await-in-loop */
    }
    setExecuteCount(0);
  };

  /**
   * 把错误的记录生成多条文本，重新放到textarea中，可以进行编辑，或复制后放到excel中加工再进行导入
   */
  const editErrorRecords = () => {
    setDataSource([]);
    setDataText(
      dataSource
        .filter((rec) => rec.statusOfImportRecord && rec.statusOfImportRecord.startsWith('error'))
        .map((rec) => columns.map((col) => rec[col.dataIndex]).join('\t'))
        .join('\r'),
    );
    setStep(Steps.Init);
    setExecuteCount(0);
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
            render: importStatusRender,
            // width: 96,
          },
          ...columns,
        ]}
        scroll={{ x: true, y: '100%' }}
      />
    );
  };
  const errorCount = dataSource.filter(
    (rec) => rec.statusOfImportRecord && rec.statusOfImportRecord.startsWith('error'),
  ).length;
  const successCount = dataSource.filter((rec) => rec.statusOfImportRecord === 'success').length;
  const initState = () => {
    setStep(Steps.Init);
    setDataText('');
    setDataSource([]);
    setExecuteCount(0);
  };
  return (
    <React.Fragment>
      <Button onClick={() => setBatchImportVisible(true)}>导入</Button>
      <Drawer
        title={
          <span>
            <span>{`『${moduleInfo.title}』数据导入`}</span>
            <span style={{ float: 'right', marginRight: '36px' }}>
              <Button
                size="small"
                type="link"
                onClick={() => {
                  download(`${API_HEAD}/platform/dataobjectimport/downloadimporttemplate.do`, {
                    objectid: moduleName,
                  });
                }}
              >
                <FileExcelOutlined />
                下载导入Excel模板
              </Button>
            </span>
          </span>
        }
        visible={batchImportVisible}
        width="100%"
        onClose={() => {
          initState();
          setBatchImportVisible(false);
          setAllSuccessCount(0);
          dispatch({
            type: 'modules/fetchData',
            payload: {
              moduleName,
              forceUpdate: true,
            },
          });
        }}
      >
        <span style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Space style={{ paddingBottom: 16 }}>
                {/* <Button disabled={step !== Steps.Init} onClick={() => setStep(Steps.CopyCliboard)}>
                  <UploadOutlined /> 上传导入文件
                </Button> */}
                <Button
                  disabled={step !== Steps.CopyCliboard}
                  onClick={() => {
                    setStep(Steps.FirstValidate);
                    createDataSource();
                  }}
                >
                  数据校验
                </Button>
                <Button disabled={step !== Steps.FirstValidate} onClick={executeImport}>
                  数据导入
                </Button>
                {dataSource.length ? (
                  <>
                    {successCount === 0 && errorCount === 0 ? (
                      <Button
                        onClick={() => {
                          setStep(Steps.CopyCliboard);
                          setDataSource([]);
                        }}
                        type="link"
                      >
                        重新编辑导入数据
                      </Button>
                    ) : null}
                    {dataSource.length === successCount ? (
                      <Button onClick={initState} type="primary">
                        开始新的导入
                      </Button>
                    ) : null}
                    {errorCount && !executeCount ? (
                      <Button onClick={editErrorRecords} type="link">
                        错误的记录重新编辑
                      </Button>
                    ) : null}{' '}
                  </>
                ) : null}
              </Space>
              {executeCount ? <Progress style={{ marginBottom: 16 }} percent={percent} /> : null}
              {parentfilter && addParentFilter ? (
                <Alert
                  style={{ marginBottom: 16 }}
                  message={
                    <span>
                      {`${parentfilter.fieldtitle}『 `}
                      <b>{`${parentfilter.text} 』`}</b>
                    </span>
                  }
                  type="info"
                />
              ) : null}
              <Space style={{ paddingBottom: 16 }} size="large">
                {parentfilter ? (
                  <span>
                    加入限定条件或导航值：
                    <Switch
                      checkedChildren=" 请加入 "
                      unCheckedChildren=" 不加入 "
                      checked={addParentFilter}
                      onChange={(value) => setAddParentFilter(value)}
                    />
                  </span>
                ) : null}
                <span>
                  加入从服务端获得的缺省值：
                  <Switch
                    checkedChildren=" 请加入 "
                    unCheckedChildren=" 不加入 "
                    checked={addRemoteDefault}
                    onChange={(value) => setAddRemoteDefault(value)}
                  />
                </span>
                <span>
                  加入实体字段设置的默认值：
                  <Switch
                    checkedChildren=" 请加入 "
                    unCheckedChildren=" 不加入 "
                    checked={addDefaultValue}
                    onChange={(value) => setAddDefaultValue(value)}
                  />
                </span>
              </Space>
              {dataSource.length ? (
                <Space style={{ paddingBottom: 16 }} size="large">
                  <Badge status="default" text={`共有 ${dataSource.length} 条记录`} />
                  <Badge status="success" text={`已导入 ${successCount} 条记录`} />
                  <Badge status="error" text={`导入失败 ${errorCount} 条记录`} />
                </Space>
              ) : null}
            </div>
            <Statistic
              style={{ width: '200px', padding: 24 }}
              title="已导入记录数"
              value={allSuccessCount}
              prefix={<LikeOutlined />}
            />
          </div>

          <Card style={{ flex: 1 }} bodyStyle={{ height: '100%' }}>
            {step === Steps.Init || step === Steps.CopyCliboard ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <span style={{ marginBottom: 12 }}>
                  字段顺序：{columns.map((col, index) => `${index + 1}.${col.title}`).join('  ')}
                </span>
                <Form style={{ flex: 1 }} initialValues={{ uploaddata: dataText }}>
                  <Form.Item noStyle name="uploaddata">
                    <Input.TextArea
                      style={{ height: '100%' }}
                      autoSize={false}
                      onChange={(element) => {
                        const { value } = element.target;
                        setDataText(value);
                        setStep(value ? Steps.CopyCliboard : Steps.Init);
                      }}
                      placeholder="请将导入的数据粘贴在此处，每行中以Tab或逗号分隔字段。可以在Excel中选择数据复制后，粘贴进来即可。"
                    />
                  </Form.Item>
                </Form>
              </div>
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
