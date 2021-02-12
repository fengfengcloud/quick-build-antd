/**
 * 自定义模块的参数定义
 */

import { ReactNode } from 'react';
import { MonetaryType } from './grid/monetary';

// 模块字段类型
export interface ModuleFieldType {
  fieldgroup: string; // 字段分组
  fieldid: string; // 字段id
  fieldname: string; // 字段名
  fieldtitle: string; // 字段描述
  fieldtype: string; // 字段类型
  fieldlen: number; // 字段长度
  isBaseField: boolean; // 是否是基础字段
  selectedmode: string; // 被子模块选择时的选择模式
  fieldrelation?: string;
  isManyToOne: boolean; // 是否是ManyToOne字段
  isOneToOne: boolean;
  isOneToMany: boolean;
  isManyToMany: boolean;
  manyToOneInfo?: any;
  fieldahead?: string;
  gridcolumnset: string; // grid列表的中字段的配置
  formfieldset: string; // form表单中字段的配置
  aggregate?: string;
  jointable?: string;

  orderno: number; // 顺序号
  defaultvalue?: string; // 新建时的缺省值
  fDictionaryid?: string; // 数据字典id
  tooltip?: string;
  tooltiptpl?: string;
  digitslen: numbrer;
  unittext?: string;
  disableSecond?: boolean; // 设置为===false，则显示日期字段的秒，否则只显示到分
  placeholder?: string; // 写在字段附加设置中的form中字段未设置值时的文本显示
  maxval: number;
  minval: number;
  allowParentValue?: boolean; // 树形结构的值是否可以选择非末级节点
  isRate?: boolean; // 是否是rate评分组件，5分满分
  divisor?: string;
  denominator?: string;
  propertyvalue?: string; // 字段的可选录入值
  fPropertyid?: string; // 字段的列表属性
  requiredMessage?: string; //
  help?: string; //

  isrequired: boolean; // 是否必填
  ishidden: boolean; // 是否隐藏
  isdisable: boolean; // 是否禁用
  ismonetary: boolean;
  isDateField: boolean;
  allownew: boolean; // 允许新建
  allowedit: boolean; // 允许修改
  allowgroup: boolean;
  allowsummary: boolean;
}

// 模块的权限或者设置
export interface ModuleLimit {
  hasenable: boolean; // 可用
  hasbrowse: boolean; // 可浏览
  hasinsert: boolean; // 可新建
  allownewinsert?: boolean; // 允许复制新建
  allowinsertexcel?: boolean; // 允许excel导入新建数据
  hasedit: boolean; // 可修改
  hasdelete: boolean; // 可删除
  rowediting: boolean; // 是否可进行行内编辑(对于字段较少相对简单的模块可以用此方式)
  hasattachment: boolean; // 是否有附件
  hasapprove: boolean; // 有审批流程
  hasaudit: boolean; // 有审核
  hasdatamining: boolean; // 可数据挖掘(BI)
  hassqlparam: boolean; // 是否使用查询SQL语句
  issystem: boolean; // 是否是系统模块
}

// 用户的模块附件操作权限
export interface AttachmentLimit {
  query?: boolean; // 附件可查看
  add?: boolean; // 附件可上传
  edit?: boolean; // 附件可修改
  delete?: boolean; // 附件可删除
}

// 审批流程的操作权限。注：是否可以进行流程审批由指定的人员来确定，并不用权限设置。
export interface ApproveLimit {
  start: boolean; // 可以启动审批流
  pause: boolean; // 可以暂停审批流
  cancel: boolean; // 可以取消审批流
}

// 用户的操作权限
export interface UserLimit {
  query: boolean; // 可查看数据
  new: boolean; // 可新建
  edit: boolean; // 可修改
  delete: boolean; // 可删除
  newnavigate?: boolean; // 新建时可用新建向导
  approve?: ApproveLimit; // 审批操作权限
  attachment?: AttachmentLimit; // 附件权限
}

// 排序字段的定义
export interface SortModal {
  property: Key;
  direction: 'ASC' | 'DESC';
  title?: any;
}

export interface ColumnFilter {
  property: Key;
  value: string | Array;
  operator: string;
  dataIndex?: string;
}

export interface UserFilter {
  property: Key;
  value: any;
  operator: string;
  operator1?: string;
  title?: string;
  text?: string;
  searchfor?: string;
  type?: string;
  fDictionaryid?: string;
}

export interface TextValue {
  text: string | undefined | ReactNode;
  value: string | undefined;
  label?: string | undefined;
  children?: TextValue[];
  count?: number;
  leaf?: boolean;
  disabled?: boolean;
  objectid?: string;
}

interface NavigateSetting {
  visible: boolean;
}

export interface AttachmentModal {
  id: string; // 文件id
  title: string; // 文件描述
  filename: string; // 文件名
  fileext: string; // 后缀名
  thumbnail: boolean; // 是否有缩略图，有的话可以显示
  pdfpreview: boolean; // 是否有PDF预览，包括doc,xls,等这些文件
  previewmode: 'image' | 'direct' | any; // 原文件预览方式,image是图像文件,direct表示可以在网页中直接打开(pdf,mov,mp4,html等)
}

// form 操作类型 显示,新建,修改,审核,审批
declare const FormOperateTypes: ['display', 'insert', 'edit', 'audit', 'approve'];
export declare type FormOperateType = typeof FormOperateTypes[number];

// form 的显示类型，弹出式窗口、抽屉式、在主区域中(grid的位置)显示，
declare const FormShowTypes: ['modal', 'drawer', 'mainregion'];
export declare type FormShowType = typeof FormShowTypes[number];

declare const GridOperateTypes: ['normal', 'onetomanygrid', 'selectfield'];
export declare type GridOperateType = typeof GridOperateTypes[number];

/**
 * 表单form的状态，改变后会按设置显示，编辑，新建记录
 */
export interface FormState {
  visible: boolean; // 是否显示form
  formType: FormOperateType; // form 操作类型
  // 在加载了fdataobject后，取第一条form记录的visibleKind,默认为窗口
  showType: FormShowType; // form 显示位置，主区域、弹出式窗口、抽屉式
  currRecord: any; // 当前操作的记录值
}

export interface ViewSchemeType {
  title: string | undefined;
  viewschemeid: string | undefined;
}

interface ModuleSetting {
  navigate: NavigateSetting;
  userFilterRegionVisible: boolean; // regionVisible 初始显示还是隐藏
  userFilterRestNumber: number; // 筛选字段隐藏个数   restNumber : 3, 从第三个开始隐藏 ，设置在筛选分组里面
  userFilterRestHidden: boolean; // 筛选字段是否隐藏 展开，收起 restHidden : false ，默认隐藏
  gridSize: 'default' | 'middle' | 'small';
}

export interface ExcelSchemeState {
  schemeid: string;
  title: string;
  iconcls: string;
  onlypdf: boolean; // 只能下载和打印pdf文件
}

export interface GridExportSetting {
  usemonetary: boolean;
  // monetaryUnit: 10000,
  // monetaryText: 万,
  colorless: boolean;
  sumless: boolean;
  unitalone: boolean;
  pagesize: string; // pageautofit,A4,A4landscape,A3,A3landscape
  scale: number; // 0-1+
  autofitwidth: boolean;
}

export interface AdditionFunctionModal {
  title: string; // 菜单或按钮标题
  fcode: string; // 附加功能code
  fdescription?: string; // 详细说明
  orderno: number; // 顺序号
  iconcls?;
  string; // 图标x-fa fa-XXXXXX
  minselectrecordnum: number; // 最少选择记录
  maxselectrecordnum: number; // 最多选择记录
  menuname?: string; // 放在哪个菜单下
  othersetting?: string; // 其他设置
  functionname?: string; // 函数名称
  functionstatement?: string; // 函数执行的命令
  buttonType?: ButtonType; // 用在grid生成自定义button时
  disableInForm?: boolean; //
  visibleWithEmpty?: boolean; // 记录为空时显示
  visibleWithRecord?: boolean; // 有记录时显示
  needParentFilter?: boolean; // 需要一个导航值
}

// 模块记录单条打印方案
export interface RecordPrintSchemeModal {
  schemeid: string;
  title: string;
  iconcls: string;
  orderno: number;
  othersetting: string;
}

// {
//     flex: 0,
//     orderno: 10,
//     paramid: "ff80808175775446017583f3bd0d0371",
//     paramlen: 0,
//     paramname: "startDate",
//     paramtype: "Date",
//     title: "起始日期",
//     width: 0,
// }

export interface SqlParamsDefine {
  flex?: number;
  orderno?: number;
  paramid: string;
  paramlen?: number;
  paramname: string;
  paramtype: string;
  title: string;
  width?: number;
}

export interface ModuleModal {
  moduleid: string; // 模块id,
  modulename: string; // 模块名称,
  objectname: string;
  title: string; // 实体对象中文名称
  primarykey: string; // 主键
  namefield: string; // 名称字段，该字段可以用来描述唯一的记录
  namefieldtpl?: string; // 名称定段tpl,如果单个字段不能用来描述唯一记录，可以用组合字段
  description?: string; // 模块描述
  istreemodel: boolean; // 是否是树形模块
  codelevel?: string; // 树形结构编码级长
  iconcls?: string; // awesome定义的图标
  helpmarkdown?: string; // markdown的帮助信息
  attachmentTypes: TextValue[] | null; // 模块的附件类型
  orderfield?: string; // 顺序号字段
  orderfieldcontroltable?: string; // 顺序号字段的父模块的限定字段

  moduleLimit: ModuleLimit; // 当前模块的权限设置
  userLimit: UserLimit; // 当前用户的权限设置
  additionFunctions: AdditionFunctionModal[];
  selectedmode: string; // 被选择的方式
  fields: ModuleFieldType[];
  gridDefaultSchemeId: string;
  gridschemes: any[];
  formschemes: any[];
  viewschemes: any;
  userdefinedsorts: any[];
  navigateSchemes: any[];
  filterSchemes: any;
  sortSchemes: any;
  excelSchemes: ExcelSchemeState[]; // excel 或 word 的导出方案
  associates: any[]; // 关联区域
  sqlparamsDefine: SqlParamsDefine[]; // sql 查询的参数字段
  recordPrintSchemes: RecordPrintSchemeModal[]; // 模块单条记录打印方案
}

/* parentFilter: {
    "moduleName":"FOrganization",
    "fieldahead":"FOrganization",
    "fieldName":"orgid",
    "fieldtitle":"组织机构",
    "operator":"=",
    "fieldvalue":"00",
    "text":"无锡市华亨公司"}
*/

export interface ParentFilterModal {
  moduleName: string;
  fieldahead: string | null;
  fieldName: string;
  fieldtitle: string;
  operator: string;
  fieldvalue: string;
  text: string;
}

export interface ParentFormModal {
  moduleName: string;
  dispatch: Dispatch;
  currRecord: any;
}

export interface ModuleFilters {
  parentfilter?: ParentFilterModal; // 父模块的限定条件
  viewscheme: ViewSchemeType; // 当前生效的视图方案
  navigate: any[]; // 当前生效的导航
  searchfilter?: any; // 查询框中的文字
  columnfilter?: ColumnFilter[]; // 当前生效的列筛选条件
  userfilter?: any[]; // 用户自定义的筛选条件
  sqlparam?: any; // sql语句的参数 {"startDate":"2020-01-01","endDate":"2020-12-31"}
}

export interface ModuleState {
  moduleName: string;
  moduleInfo?: ModuleModal;
  dataSourceLoadCount: number; // 列表调用次数，当需要刷新时，将此值+1即可
  currentGridschemeid: string; // 当前显示的列表方案的id
  selectedRowKeys: any[]; // 当前选中的记录
  selectedTextValue: TextValue[]; // 当前选中的记录的id和name
  expandedRowKeys: any[]; // 树形结构展开的节点
  pinkey: string; // 树形结构当前以哪一个主键值作为根节点显示
  dataSource: any[]; // 当前页的模块数据
  lastInsertRecord?: any; // 最后一条插入的记录
  remoteRoot?: any; // 需要加入总计的总计值
  monetary: MonetaryType;
  monetaryPosition: 'behindnumber' | 'columntitle';
  recordOrderChanged?: boolean; // 记录的顺序改变过了
  filters: ModuleFilters;
  sorts: SortModal[];
  sortschemeid?: string | null;
  sortMultiple: any; // {} or {multiple : 1}
  gridParams: {
    curpage: number; // 当前页码
    limit: number; // 每页记录数
    start: number; // 起始记录数
    total: number; // 记录总数
    totalpage: number; // 总页数
  };
  currSetting: ModuleSetting;
  formState: FormState; // form状态
  gridExportSetting: GridExportSetting;
  fetchLoading: boolean; // detailGrid使用的loading态
  parentForm?: ParentFormModal | undefined; // detailGrid的父模块信息
}

export interface ColumnFilterInfoType {
  title: string;
  comboValue?: TextValue[];
  type: 'dictionary' | 'combobox' | 'string' | 'boolean' | 'number' | 'date';
}

export interface ColumnFilterType {
  [index: string]: ColumnFilterInfoType;
}

/**
 * fetchobjectdata返回的数据结构
 */
export interface FetchObjectResponse {
  start: number;
  limit: number;
  total: number;
  curpage: number;
  totalpage: number;
  data: any[] | any;
  spendtime: number;
  children?: any[];
  expandedRowKeys?: any[];
  remoteRoot?: any;
}
