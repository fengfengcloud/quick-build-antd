import { FormInstance } from 'antd/lib/form';
import { Store } from 'antd/es/form/interface';
import moment, { isMoment } from 'moment';
import { getNextId, apply, showResultInfo } from '@/utils/utils';
import { ModuleModal, ModuleFieldType, ModuleState } from '../data';
import { getModuleInfo, getFieldDefine } from '../modules';
import { getMaxPrimaryKeyFromKey, DateTimeFormat } from '../moduleUtils';
import { getAjaxNewDefault } from '../service';

/**
 * 在编辑记录前对记录做一下处理
 * 日期的转换成moment,百分比的乘100
 * @param sourRecord
 */
export const convertToFormRecord = (sourRecord: any, moduleInfo: ModuleModal) => {
  if (!sourRecord || Object.keys(sourRecord).length === 0) return {};
  const record = { ...sourRecord };
  moduleInfo.fields.forEach((field: ModuleFieldType) => {
    const { fieldname } = field;
    if (field.isDateField) {
      if (record[fieldname] && !isMoment(record[fieldname])) {
        record[fieldname] = moment(record[fieldname], DateTimeFormat);
      }
    }
  });
  // console.log('sourceRecord', sourRecord);
  // console.log('target Record', record);
  return record;
};

/**
 * 比较二个对象的不同字段，返回dest与sour不同的字段
 */
export const getDifferentField = ({
  dest,
  sour,
  moduleInfo,
}: {
  dest: object;
  sour: object;
  moduleInfo: ModuleModal;
}) => {
  // console.log('当前的所有字段');
  // console.log(sour);
  // console.log('修改后所有字段');
  // console.log(dest);
  const result = { ...dest };
  // 把相同的值去掉，不返回值
  Object.keys(result).forEach((key) => {
    if (result[key] === '')
      // 为空的字符串全保存为null
      result[key] = null;
    const field: ModuleFieldType = getFieldDefine(key, moduleInfo);
    if (field && field.isDateField) {
      if (!result[key]) {
        // 原来是空，现在也是空
        if (!sour[key]) {
          delete result[key];
        }
      } else if (result[key].isSame(sour[key], DateTimeFormat)) delete result[key];
    } else if (result[key] === sour[key]) {
      delete result[key];
    }
  });
  // 由于undefined不能被传送到后台，因此改成null
  Object.keys(result).forEach((key) => {
    if (result[key] === undefined) result[key] = null;
  });
  // console.log('修改过的字段');
  // console.log(result);
  // message.warn(JSON.stringify(result))
  return result;
};

/**
 * 模块记录新建时，根据模块字段的定义取得缺省值
 * @param form
 * @param moduleState
 */
export const getNewDefaultValues = (
  form: FormInstance,
  moduleState: ModuleState,
  setV?: Function,
): object => {
  const result = {};
  const {
    moduleName,
    dataSource,
    filters: { navigate, parentfilter: pf },
    selectedRowKeys,
    lastInsertRecord,
  } = moduleState;
  const moduleInfo = getModuleInfo(moduleName);
  const { primarykey } = moduleInfo;
  const fields: Store = form.getFieldsValue();
  // 先加入字段中字义的缺省值
  Object.keys(fields).forEach((key: string) => {
    const inst = form.getFieldInstance(key);
    if (inst && inst.props && inst.props.fielddefaultvalue) {
      const v = inst.props.fielddefaultvalue;
      // eslint-disable-next-line
      result[key] = v === 'true' ? true : v === 'false' ? false : v === 'now' ? moment() : v;
    }
  });
  const params: any = {
    objectname: moduleName,
    parentfilter: null,
    navigates: null,
  };
  // 再加入导航和父模块的设定值
  navigate.forEach((rec: any) => {
    const ahead: string | null = rec.fieldahead;
    // fieldahead 没有或者不能有二级以上的才可以加入缺省值
    if (!ahead || ahead.indexOf('.') === -1) {
      const key: string = (ahead ? `${ahead}.` : '') + rec.fieldName;
      if (key in fields) {
        result[key] = rec.fieldvalue;
        if (ahead) {
          // 找一下有没有ahead.namefield,如果有的话也要把值加进去
          const fieldname = getFieldDefine(ahead, moduleInfo);
          const pmodule = getModuleInfo(fieldname.fieldtype);
          const namefieldname = `${ahead}.${pmodule.namefield}`;
          if (namefieldname in fields) result[namefieldname] = rec.text;
        }
      }
    }
  });
  if (pf) {
    const ahead: string | null = pf.fieldahead;
    if (!ahead || ahead.indexOf('.') === -1) {
      const key: string = (ahead ? `${ahead}.` : '') + pf.fieldName;
      if (key in fields) {
        result[key] = pf.fieldvalue;
        if (ahead) {
          // 找一下有没有ahead.namefield,如果有的话也要把值加进去
          const fieldname = getFieldDefine(ahead, moduleInfo);
          const pmodule = getModuleInfo(fieldname.fieldtype);
          const namefieldname = `${ahead}.${pmodule.namefield}`;
          if (namefieldname in fields) result[namefieldname] = pf.text;
        }
      }
    }
  }
  // 如果是树状的cocelevel型的模块，并且选中了一个记录，那么新建的时候主键+1
  if (moduleInfo.istreemodel && moduleInfo.codelevel) {
    // 如果树形结构已经新建了一条，那么下一条就在上一条的记录上加1
    if (lastInsertRecord) {
      result[primarykey] = getNextId(lastInsertRecord[primarykey]);
    } else if (selectedRowKeys.length) {
      result[primarykey] = getNextId(
        getMaxPrimaryKeyFromKey(dataSource, selectedRowKeys[0], primarykey),
      );
    }
  }
  // 去服务器后台取得后台提供的缺省值
  if (navigate.length) params.navigates = JSON.stringify(navigate);
  if (pf) params.parentfilter = JSON.stringify(pf);
  getAjaxNewDefault(params).then((response) => {
    showResultInfo(response.resultInfo);
    const ajaxDefault = convertToFormRecord(response.data, moduleInfo);
    if (ajaxDefault) {
      form.setFieldsValue(apply(form.getFieldsValue(), ajaxDefault));
      if (setV) setV((v: number) => v + 1);
    }
  });
  return result;
};
