import { abcEmployeeTodayState } from '../grid/columnBusinessRender';

const BusinessDescriptionItemRender: Record<string, Function> = {
  // abcgate
  'AbcEmployee--todayState': abcEmployeeTodayState,
  'AbcInoutEmployeeRecord--state': abcEmployeeTodayState,
};

export const getBusinessDescriptionItemRender = (moduleName: string, dataIndex: string) => {
  return BusinessDescriptionItemRender[`${moduleName}--${dataIndex}`];
};
