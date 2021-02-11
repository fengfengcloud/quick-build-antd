import { integerRender, stringRenderer } from '@/pages/module/grid/columnRender';
import { uuid } from '@/utils/utils';
import { BlockOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Drawer, Table, Tooltip } from 'antd';
import React, { useContext, useState } from 'react';
import { DataminingContext, DataminingStateContext } from '..';
import { ACT_DELETE_ROWGROUP_FROM_INDEX, ROWID } from '../constants';
import { DataminingModal } from '../data';
import { getTreeRecordByKey } from '../utils';

export const rowOperTypes = {
  expand: '记录展开',
  expandallleaf: '展开所有末级记录',
  edittext: '修改记录描述',
  deleterow: '删除记录',
  deletechildren: '删除记录子节点',
  combinerows: '合并记录',
  combinerowsadd: '合并后加入原记录',
  expandwithnavigaterecords: '记录展开导航值',
};

export const RowActionHistoryButton = () => {
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <>
      <Button
        type={visible ? 'link' : 'text'}
        size="small"
        onClick={() => {
          setVisible((v) => !v);
        }}
      >
        <BlockOutlined /> 操作记录
      </Button>
      <Drawer
        title="数据分析方案的数据操作记录"
        visible={visible}
        width="50%"
        onClose={() => {
          setVisible(false);
        }}
      >
        <RowActionHistory />
      </Drawer>
    </>
  );
};

const deleteRowAction = (state: DataminingModal, dispatch: Function, recno: number) => {
  dispatch({
    type: ACT_DELETE_ROWGROUP_FROM_INDEX,
    payload: {
      deleteFormIndex: recno,
    },
  });
};

export const RowActionHistory = () => {
  const context = useContext<DataminingStateContext>(DataminingContext);
  const { state, dispatch } = context;

  const columns: any = [
    {
      width: 36,
      title: <span style={{ whiteSpace: 'nowrap' }}>序号</span>,
      dataIndex: 'recno',
      align: 'right',
      render: integerRender,
    },
    {
      title: '操作类型',
      dataIndex: 'type',
      render: (value: string, record: any, recno: number) =>
        stringRenderer(rowOperTypes[value], record, recno),
    },
    {
      title: '展开的字段',
      dataIndex: 'title',
      render: stringRenderer,
    },
    {
      title: '选中操作的列',
      dataIndex: 'rowcontext',
    },
    {
      width: 36,
      align: 'center',
      render: (value: any, record: any, recno: number) => (
        <Tooltip title="从当前行开始删除所有后续操作">
          <DeleteOutlined
            onClick={() => {
              deleteRowAction(state, dispatch, recno);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  const rowDataSource: any[] = [];
  const {
    schemeState: { rowGroup, dataSource },
  } = state;
  rowGroup.forEach((group) => {
    const conditionRecord = getTreeRecordByKey(dataSource, group.conditionpath, ROWID) || {};
    rowDataSource.push({
      key: uuid(),
      type: group.type + (group.addSelectedChildrens ? 'add' : ''),
      title: group.title,
      rowcontext: group.conditiontext || group.text || conditionRecord.text,
    });
  });
  let recno = 1;
  rowDataSource.forEach((r) => {
    const row = r;
    row.recno = recno;
    recno += 1;
  });
  return (
    <Table
      className="rowactionhistorytable"
      columns={columns}
      dataSource={rowDataSource}
      bordered
      size="small"
      pagination={false}
    />
  );
};
