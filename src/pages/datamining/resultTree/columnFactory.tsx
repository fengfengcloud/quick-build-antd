import React from 'react';
import { apply, MD5 } from '@/utils/utils';
import { fieldTitleTransform } from '../utils';
import styles from '../index.less';
import { DataminingModal, FieldModal } from '../data';
import {
  dateRender, datetimeRender, integerRender, monetaryRender, percentRenderWithTooltip,
} from '@/pages/module/grid/columnRender';
import { categoryFieldRender } from './categoryFieldRender';
import CategoryActionButton from './categoryActionButton';
import { PARENT_ROWID, ROWID } from '../constants';
import { message } from 'antd';
import { adjustColumnGroupToggleButton } from './columnUtils';
import { getSortOrder } from '@/pages/module/grid/sortUtils';

const groupText = '分 组 项 目';

/**
 * 根据选 中的聚合字段 和 分组条件 来生成一个 二维的 分组条件+聚合字段，个数是二个的乘法
 */
export const rebuildColumns = (aggregateFields: any, groupColumns: any,
  state: DataminingModal, dispatch: Function): any[] => {
  message.warn('rebuild  -- columns');
  let allColumns: any[] = [{
    fixed: 'left',
    isCategory: true,
    text: groupText,
    title: (
      <div style={{ whiteSpace: 'nowrap', display: 'flex' }} >
        <span style={{ flex: 1 }}>{groupText}</span>
        <span style={{ margin: '0px 8px 0px 24px' }}><CategoryActionButton /></span>
      </div>),
    dataIndex: 'text',
    key: 'text',
    className: styles.categorycolumn,
    render: categoryFieldRender,
    sorter: true,
    sortDirections: ['ascend', 'descend', 'ascend'],
    sortOrder: getSortOrder(state.schemeState.sorts, 'text') || getSortOrder(state.schemeState.sorts, 'value'),
    rowid: 'category',
  },]; // 加入展开列
  // 要把最底层的dataindex设计好，有可能字段也是分组的多层的
  let rowidCount = 101;
  // 选中的字段的rowid,从101开始，也就是总计的字段的rowid，101,102,103
  aggregateFields.forEach((field: any) => field[ROWID] = 'field-' + rowidCount++);
  const cloneAggregateFields = JSON.parse(JSON.stringify(aggregateFields));
  // 取得所有的底层的总计的字段，设计所有的列表字段的时候，可能会有分组
  // 这个太复杂，设计的时候不要设计二层以上的字段分组
  const leafAggregateFields: any[] = getLeafColumns(cloneAggregateFields);
  leafAggregateFields.forEach((f) => {
    setColumnXtypeAndDataIndex(f, state); // 设置column的显示xtype以及 dataIndex名称
    f.isTotalColumn = true;               // 这列是总计
    if (state.currSetting.fieldGroupFixedLeft)
      f.fixed = 'left';
  });
  allColumns = allColumns.concat(cloneAggregateFields); // 加入总计的字段到allcolumns中
  // 所有列分组是一个树形结构，也要加入rowid,从201开始，201，202，201-201，201-202
  addRowidToTree(groupColumns, '', 201);
  const cloneGroupColumns = JSON.parse(JSON.stringify(groupColumns)); // 深度复制一个包括所有分组的分组信息
  const cloneGroupDetails: any[] = getLeafColumns(cloneGroupColumns); // 所有的底层的分组
  // 如果聚合字段只有一个，那么就把选 中的分组加进去就行了。
  if (leafAggregateFields.length == 1) {
    // 总计不包括在设计器里
    cloneGroupDetails.forEach((d) => {
      if (d.text == '总计') d.text = cloneAggregateFields[0].text;
      d.title = d.text;
      d.aggregatefieldname = leafAggregateFields[0].aggregatefieldname;
      d.aggregate = leafAggregateFields[0].aggregate;
      d.unitText = leafAggregateFields[0].unitText;
      d.ismonetary = leafAggregateFields[0].ismonetary;
      d.fieldname = leafAggregateFields[0].fieldname;
      d.fieldtype = leafAggregateFields[0].fieldtype;
      setColumnXtypeAndDataIndex(d, state);
    });
    allColumns = allColumns.concat(cloneGroupColumns);
  } else {
    // 选中的聚合字段有2个以上
    cloneGroupDetails.forEach((d) => {
      // 对每一个分组的底层都要加入所有的aggregateFields 的一个拷贝
      const cloneAggregateFields: any[] = JSON.parse(JSON.stringify(aggregateFields)).
        filter((field: FieldModal) => !field.hiddenInColumnGroup);
      // 取得所有的底层的总计的字段，设计所有的列表字段的时候，可能会有分组
      const cloneLeafAggregateFields: any[] = getLeafColumns(cloneAggregateFields);
      cloneLeafAggregateFields.forEach((f) => {
        // 每一个末级的聚合字段，加上分组信息
        f.condition = d.condition;
        // 末级节点的rowid  201--field-101, 201-field-102;
        f[ROWID] = d[ROWID] + '--' + f[ROWID];
        setColumnXtypeAndDataIndex(f, state);
      });
      d.children = cloneAggregateFields;
    });
    allColumns = allColumns.concat(cloneGroupColumns);
  }
  //me.clearSelectedColumns();
  adjustCloneGroupColumns(allColumns, state);
  console.log('----------')
  adjustColumnGroupToggleButton(allColumns, dispatch)
  console.log(allColumns);
  return allColumns;
};

// 对树形结构的每一级加入uuid,上一级为101开始，下一级为 101-101,以此类推
const addRowidToTree = (columns: any[], parentId: string, firstCount: number) => {
  let rowidCount = firstCount;
  columns.forEach(column => {
    column[PARENT_ROWID] = parentId;
    column[ROWID] = parentId + (parentId && '-') + rowidCount++;
    column.children && addRowidToTree(column.children, column[ROWID], firstCount);
  })
}

const adjustCloneGroupColumns = (cloneGroupColumns: any[], state: DataminingModal) => {
  cloneGroupColumns.forEach((column) => {
    if (!column.isCategory && !column.onHeaderCell)
      column.onHeaderCell = (column: any) => ({ column });
    if (column.children)
      column.style = 'background-color:#f6f5ec;';
    else
      column.style = 'background-color:#fffef9;';
    if (column.isCategory) {

    } else if (column.children) {
      delete column.width;
      adjustCloneGroupColumns(column.children, state);
      column.className = styles.parentcolumnheader;
      column.title = (
        <span dangerouslySetInnerHTML={{ __html: fieldTitleTransform(column.text) }}></span>
      );
    } else {
      if (!column.className) column.className = styles.leafcolumnheader;
      column.title = (
        <span
          className={styles.columnheader}
          dangerouslySetInnerHTML={{ __html: getColumnText(column, state) }}
        ></span>
      );
    }
  });
};

export const getLeafColumns = (columns: any[]): any[] => {
  const result: any[] = [];
  columns.forEach((column) => {
    if (column.children) result.push(...getLeafColumns(column.children));
    else result.push(column);
  });
  return result;
};

const getColumnText = (column: any, state: DataminingModal) => {
  let text = column.text_ || column.text;
  const unittext = column.unittext,
    agg = column.aggregate,
    ismonetary = column.ismonetary;
  if (!text) text = '未定义';
  let result: string = text.replace(new RegExp('--', 'gm'), '<br/>');
  if (agg == 'sum' || agg == 'avg' || agg == 'max' || agg == 'min') {
    let mtext = '';
    if (ismonetary && state.monetaryPosition === 'columntitle') {
      mtext = state.monetary.unittext === '个' ? '' : state.monetary.unittext;
    }
    if (mtext || unittext) {
      // 如果最后一行只有2个字，那不要加<br/>
      const array: string[] = result.split('<br/>');
      if (array[array.length - 1].length > 2) result += '<br/>';
      result += '<span style="color:green;">(' + mtext + (unittext ? unittext : '') + ')</span>';
    }
  }
  return result;
};

const setColumnXtypeAndDataIndex = (column: any, state: DataminingModal) => {
  let t = column.fieldtype;
  if (typeof t == 'string') {
    t = t.toLowerCase();
  }
  const md5str = column.aggregatefieldname + (column.condition ? column.condition : '');
  column.dataIndex = 'jf' + MD5(md5str).substr(0, 27);
  column.sorter = true;
  column.sortDirections = ['ascend', 'descend', 'ascend'];
  column.sortOrder = getSortOrder(state.schemeState.sorts, column.dataIndex);
  // 所有底层的聚合字段加入dataindex
  const agg = column.aggregatefieldname.substr(0, column.aggregatefieldname.indexOf('.'));
  column.aggregateType = agg;
  if (column.text) {
    // 对有些相对字段进行处理，比如 下01个月，前01个月等
    column.text_ = fieldTitleTransform(column.text);
    column.menuText = column.text.replace(new RegExp('--', 'gm'), '');
    column.title = fieldTitleTransform(column.text.replace(new RegExp('--', 'gm'), '<br/>'));
    //column.title = getColumnText(column);
  }
  //const addCountSumPercent = me.getController().getViewModel().isAddCountSumPercent();
  // 加入tooltip 分子和分母
  if (agg == 'wavg') {
    apply(column, {
      align: 'center',
      render: (value: number, record: object, _recno: number) =>
        percentRenderWithTooltip(
          value,
          record[column.dataIndex + '1'],
          record[column.dataIndex + '2'],
        ),
      minWidth: 60,
      filter: 'number',
      width: 110,
    });
  } else if (agg == 'count') {
    // 如果是count 那么 ismonetary unittext 都无效
    delete column.ismonetary;
    delete column.unittext;
    apply(column, {
      align: 'right',
      tdCls: 'intcolor',
      format: '#',
      render: integerRender,
      filter: 'number',
    });
  } else if (
    (agg == 'max' || agg == 'min') &&
    (t == 'date' || t == 'datetime' || t == 'timestamp')
  ) {
    apply(column, {
      align: 'center',
      xtype: 'datecolumn',
      render: t == 'date' ? dateRender : datetimeRender,
    });
  } else if (agg == 'sum' || agg == 'avg' || agg == 'max' || agg == 'min') {
    if (agg == 'sum') {
      apply(column, {
        align: 'right',
        //renderer: addCountSumPercent ? (column.ismonetary ? Ext.util.Format.aggregateSumRenderer : Ext.util.Format.aggregateSumFloatRenderer) : (column.ismonetary ? Ext.util.Format.monetaryRenderer : Ext.util.Format.floatRenderer),
        filter: 'number',
      });
    } else {
      apply(column, {
        align: 'right',
        //renderer: column.ismonetary ? Ext.util.Format.monetaryRenderer : Ext.util.Format.floatRenderer,
        filter: 'number',
      });
    }
    if (column.ismonetary) {
      column.render = (value: number, record: object, _recno: number) =>
        monetaryRender(value, record, _recno, state);
    }
  }
};
