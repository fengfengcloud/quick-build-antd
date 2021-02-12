import React from 'react';

import { Button, Menu, Tooltip } from 'antd';
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { apply } from '@/utils/utils';
import { ModuleState, ModuleFilters, TextValue } from '../../data';
import { downloadGridExcel } from '../../service';
import { getCurrentExportGridColumnDefine } from '../../grid/columnFactory';
import { getAllFilterAjaxParam, getAllFilterAjaxText } from '../../grid/filterUtils';
import { getModuleInfo } from '../../modules';

const GRIDEXCELEXPORT = 'gridmodeexcelexport';

export const downloadGridSchemeFile = ({
  moduleState,
  key,
  topdf,
  onlyselected,
}: {
  moduleState: ModuleState;
  key: string;
  topdf: boolean;
  onlyselected: boolean;
}) => {
  const { moduleName, gridExportSetting } = moduleState;
  const moduleInfo = getModuleInfo(moduleName);
  const params: any = {
    moduleName,
    columns: JSON.stringify(getCurrentExportGridColumnDefine(moduleName)),
    page: 1,
    start: 0,
    limit: 1000000,
    conditions: JSON.stringify([]),
    topdf,
  };
  params.monetaryUnit = moduleState.monetary.monetaryUnit;
  params.monetaryText = moduleState.monetary.monetaryText;
  apply(params, gridExportSetting);
  // 如果只导出选中记录，并且选中记录不为空
  if (onlyselected) {
    const filters: ModuleFilters = { ...moduleState.filters };
    filters.columnfilter = filters.columnfilter ? [...filters.columnfilter] : [];
    filters.columnfilter.push({
      property: moduleInfo.primarykey,
      operator: 'in',
      value: moduleState.selectedTextValue.map((rec: TextValue) => rec.value),
    });
    apply(params, getAllFilterAjaxParam(filters));
  } else apply(params, getAllFilterAjaxParam(moduleState.filters));
  const conditions: any[] = getAllFilterAjaxText(moduleState);
  if (onlyselected) {
    conditions.push({
      property: '选中的',
      operator: `${moduleState.selectedTextValue.length}`,
      value: '条记录',
    });
  }
  params.conditions = JSON.stringify(conditions);
  if (key.startsWith(GRIDEXCELEXPORT)) {
    const parts = key.split('||');
    [, params.formschemeid, params.formschemetitle] = parts;
  }
  downloadGridExcel(params);
};

const ExportGridScheme = ({
  moduleState,
  setVisible,
  onlyselected,
}: {
  moduleState: ModuleState;
  setVisible: Function;
  onlyselected: boolean;
}) => {
  const { moduleName } = moduleState;
  const moduleInfo = getModuleInfo(moduleName);
  const getGridExcelExportItems = () => {
    const { formschemes } = moduleInfo;
    const result: any[] = [];
    const items: any[] = formschemes
      .filter((ascheme) => ascheme.formtype === GRIDEXCELEXPORT)
      .map((scheme) => {
        const key = `${GRIDEXCELEXPORT}||${scheme.formschemeid}||${scheme.schemename}`;
        return (
          <Menu.Item
            key={key}
            onClick={() => {
              downloadGridSchemeFile({ moduleState, key, topdf: false, onlyselected });
            }}
            title={scheme.schemename}
          >
            <FileExcelOutlined />
            {scheme.schemename}
            <Tooltip title="导出pdf文件" placement="topRight">
              <Button
                style={{ float: 'right', paddingRight: '0px' }}
                type="link"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setVisible(false);
                  downloadGridSchemeFile({ moduleState, key, topdf: true, onlyselected });
                }}
              >
                <FilePdfOutlined style={{ marginLeft: '10px' }} />
              </Button>
            </Tooltip>
          </Menu.Item>
        );
      });
    if (items.length > 0) {
      result.push(
        <Menu.ItemGroup title="列表导出方案" key="_export_grid_key_">
          {items}
        </Menu.ItemGroup>,
      );
      result.push(<Menu.Divider key="_export_grid_key_div" />);
    }
    return result;
  };
  return getGridExcelExportItems();
};

export default ExportGridScheme;
