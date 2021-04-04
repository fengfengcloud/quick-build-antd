import { abcEmployeeTodayState } from '../grid/columnBusinessRender';

interface BusinessDescriptionItemRender {
  [name: string]: Function;
}

const BusinessDescriptionItemRender: BusinessDescriptionItemRender = {
  // abcgate
  'AbcEmployee--todayState': abcEmployeeTodayState,
  'AbcInoutEmployeeRecord--state': abcEmployeeTodayState,
};

export const getBusinessDescriptionItemRender = (moduleName: string, dataIndex: string) => {
  return BusinessDescriptionItemRender[`${moduleName}--${dataIndex}`];
};
