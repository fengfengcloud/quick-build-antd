import React, { useCallback, useMemo } from 'react';
import { Card, Table } from 'antd';
import type { Key, SorterResult, TableCurrentDataSource } from 'antd/lib/table/interface';
import { getModuleInfo } from '@/pages/module/modules';
import type { DataminingModal } from '../data';
import {
  ACT_DATAMINING_EXPAND_CHANGED,
  ACT_DATAMINING_FETCHDATA,
  ACT_SELECTED_ROWKEYS_CHANGED,
  ACT_SORT_CHANGE,
  ROWID,
} from '../constants';
import { selectionsMenu } from './selections';
import { DragDropHeaderCell } from './headCellDragDrop';
import { rebuildColumns } from './columnFactory';
import { DragableBodyRow } from './bodyRowDragDrop';
import StartEndDateSectionSelect from './sqlparams';

interface ResultTreeParams {
  state: DataminingModal;
  dispatch: Function;
}

const ResultTree: React.FC<ResultTreeParams> = ({ state, dispatch }) => {
  const { moduleName, schemeState } = state;
  const { dataSource } = schemeState;
  const moduleInfo = getModuleInfo(moduleName);
  // console.log('refresh resultTree .........................');

  const handleTableChange = (
    pagination: any,
    filters: Record<string, (Key | boolean)[] | null>,
    sorter: SorterResult<any> | SorterResult<any>[],
    extra: TableCurrentDataSource<any>,
  ) => {
    const { action } = extra;
    if (action === 'sort') {
      if (
        !Array.isArray(sorter) &&
        sorter.field &&
        typeof sorter.field === 'string' &&
        sorter.order
      )
        dispatch({
          type: ACT_SORT_CHANGE,
          payload: {
            property: sorter.field,
            direction: sorter.order === 'descend' ? 'DESC' : 'ASC',
          },
        });
    }
  };
  const handlerSelectedRowKeys = (selectedRowKeys: any[]) => {
    dispatch({
      type: ACT_SELECTED_ROWKEYS_CHANGED,
      payload: {
        selectedRowKeys,
      },
    });
  };

  // 如果选择的时候，按住了shift,或者ctrl，会切换选中状态
  const selectRow = (record: any, toggle: boolean) => {
    // console.log(record, toggle)
    const { selectedRowKeys } = state;
    const rowid = record[ROWID];
    const selections: string[] = [];
    if (toggle) {
      selections.push(...selectedRowKeys);
      if (selections.find((v) => v === rowid))
        selections.splice(
          selections.findIndex((v) => v === rowid),
          1,
        );
      else selections.push(rowid);
    } else {
      if (selectedRowKeys.length === 1 && selectedRowKeys[0] === rowid) return;
      selections.push(rowid);
    }
    dispatch({
      type: ACT_SELECTED_ROWKEYS_CHANGED,
      payload: {
        selectedRowKeys: selections,
      },
    });
  };

  // 如果当前记录已选中，则不进行操作，如果未选中并且没有选中的记录，则选中当前记录
  // const selectRowIf = (record: any) => {
  //   if (!state.selectedRowKeys.find(key => key === record['rowid']) &&
  //     state.selectedRowKeys.length === 0)
  //     dispatch({
  //       type: ACT_SELECTED_ROWKEYS_CHANGED,
  //       payload: {
  //         selectedRowKeys: [record['rowid']],
  //       },
  //     });
  // };

  const components: any = {
    body: {
      row: (props: any) => <DragableBodyRow {...props} />,
    },
    header: {
      cell: (props: any) => <DragDropHeaderCell {...props} />,
    },
  };
  // 如果聚合字段有分组，则不允许对头部进行操作，这种方案只能在extjs的界面中进行配置
  if (state.schemeState.isMultFieldGroup) {
    delete components.header;
  }

  const moveRow = useCallback(
    (dragIndex, hoverIndex, dragRecord) => {
      if (dragRecord.parentNode) {
        // 总计行没有parentNode
        const data: any[] = dragRecord.parentNode.children;
        const dragRow = data[dragIndex];
        data.splice(dragIndex, 1);
        data.splice(hoverIndex, 0, dragRow);
        dispatch({
          type: ACT_DATAMINING_FETCHDATA,
          payload: {
            dataSource: [...state.schemeState.dataSource],
          },
        });
      }
    },
    [state.schemeState.dataSource],
  );

  const columns = useMemo(
    () =>
      rebuildColumns(
        schemeState.fieldGroup,
        schemeState.isMultFieldGroup,
        schemeState.columnGroup,
        state,
        dispatch,
      ),
    [
      schemeState.fieldGroup,
      schemeState.columnGroup,
      state.monetary,
      state.monetaryPosition,
      state.schemeState.sorts,
      state.currSetting.fieldGroupFixedLeft,
    ],
  );

  return (
    <>
      {moduleInfo.moduleLimit.hassqlparam ? (
        <StartEndDateSectionSelect state={state} dispatch={dispatch} />
      ) : null}
      <Card className="dataminingcard">
        <Table
          className="dataminingtable"
          size="small"
          bordered
          sticky={{ offsetHeader: 48 }} // 设置粘性表头
          tableLayout="auto" // 'auto','fixed'
          loading={state.fetchLoading}
          pagination={false}
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: true }} // y，加了y表头可以固定,可以加一个配置项来确定y是不是固定，固定的话sticky可以不用配置了
          indentSize={15}
          rowKey={ROWID}
          onChange={handleTableChange}
          showSorterTooltip={false}
          expandable={{
            defaultExpandAllRows: true,
          }}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: state.selectedRowKeys,
            onChange: handlerSelectedRowKeys,
            selections: selectionsMenu(state, dispatch),
          }}
          components={components}
          onRow={(record, index) => ({
            index,
            record,
            moveRow,
            onClick: (e) => {
              // 如果选择的时候，按住了shift,或者ctrl，会切换选中状态
              if (e.shiftKey || e.ctrlKey) selectRow(record, e.shiftKey || e.ctrlKey);
            },
            onDoubleClick: () => {},
            onContextMenu: () => {
              // 右键是否选择当前记录
              // selectRowIf(record);
            },
          })}
          expandedRowKeys={state.expandedRowKeys}
          onExpand={(expanded: boolean, record: any) => {
            dispatch({
              type: ACT_DATAMINING_EXPAND_CHANGED,
              payload: {
                expanded,
                key: record[ROWID],
              },
            });
          }}
        />
      </Card>
    </>
  );
};

export default ResultTree;
