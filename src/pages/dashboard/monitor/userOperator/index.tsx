import React, { useEffect, useState } from 'react';
import { Card, CardProps, Col, Radio, Row } from 'antd';
import { currentUser } from 'umi';
import { serialize } from 'object-to-formdata';
import request from '@/utils/request';
import { stringifyObjectField } from '@/utils/utils';
import { PieConfig } from '@ant-design/charts/es/pie';
import { getColumnDataIndex } from '@/pages/datamining/utils';
import { Column, Pie } from '@ant-design/charts';
import { TextValue } from '@/pages/module/data';
import { ColumnConfig } from '@ant-design/charts/es/column';

const numeral = require('numeral');

const cardParams: CardProps = {
  size: 'default',
  bodyStyle: { height: '360px', paddingTop: 12, paddingBottom: 12 },
};

export const UserOperator: React.FC<any> = () => {
  return (
    <Row gutter={[12, 12]} style={{ margin: '12px 6px' }}>
      <Col md={24} lg={12}>
        <Card title="用户操作类型分析" {...cardParams}>
          <UserOperatorPie groupfieldid={{ fieldname: 'dotype' }} />
        </Card>
      </Col>
      <Col md={24} lg={12}>
        <Card title="用户操作模块分析" {...cardParams}>
          <UserOperatorPie groupfieldid={{ fieldahead: 'FDataobject' }} />
        </Card>
      </Col>
      <Col span={24}>
        <UserOperatorYearMonthColumn {...cardParams} />
      </Col>
    </Row>
  );
};

const COUNT = getColumnDataIndex('count.*');

export const UserOperatorPie: React.FC<any> = ({ groupfieldid }: { groupfieldid: any }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = () => {
    const fields = ['count.*'];
    const filter = {
      property_: {
        moduleName: 'FUseroperatelog',
        fieldahead: 'FUser',
      },
      operator: '=',
      value: currentUser.userid,
    };
    request('/api/platform/datamining/fetchdata.do', {
      method: 'POST',
      data: serialize(
        stringifyObjectField({
          moduleName: 'FUseroperatelog',
          fields,
          navigatefilters: [filter],
          groupfieldid,
        }),
      ),
    }).then((response) => {
      setData(
        (response as any[])
          .map((rec) => ({
            type: rec.text,
            value: rec[COUNT],
          }))
          .sort((rec1, rec2) => rec2.value - rec1.value),
      );
    });
    setLoading(false);
  };

  const config: PieConfig = {
    appendPadding: 10,
    data,
    loading,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.64,
    label: {
      type: 'outer',
      formatter: (datum) => `${datum.value}次(${numeral(datum.percent).format('0.00%')})`,
    },
    statistic: {
      title: {
        formatter: () => '总计',
        offsetY: -15,
      },
      content: {
        formatter: (value, datum) => {
          let sum = 0;
          if (datum)
            datum.forEach((rec) => {
              sum += rec.value;
            });
          return `${numeral(sum).format('0,0')}次`;
        },
        offsetY: 15,
        style: {
          fontSize: '20px',
        },
      },
    },
    interactions: [{ type: 'element-active' }],
    legend: {
      layout: 'vertical',
      position: 'right',
      animate: true,
    },
    tooltip: {
      formatter: (datum) => {
        return { name: datum.type, value: `${numeral(datum.value).format('0,0')}次` };
      },
    },
  };
  useEffect(() => {
    fetchData();
  }, []);
  return <Pie {...config} />;
};

const columnStyle = {
  fillOpacity: 0.5,
  strokeOpacity: 0.7,
  shadowColor: 'black',
  shadowBlur: 10,
  shadowOffsetX: 5,
  shadowOffsetY: 5,
  cursor: 'pointer',
};

const sectionTypes: TextValue[] = [
  {
    text: '每日',
    value: 'yyyy年mm月dd日',
  },
  {
    text: '月度',
    value: 'yyyy年mm月',
  },
  {
    text: '年度',
    value: 'yyyy年',
  },
  {
    text: '季度',
    value: 'yyyy年n季度',
  },
];

const UserOperatorYearMonthColumn: React.FC = (params) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);
  const [sectionType, setSectionType] = useState<string>(sectionTypes[0].value || '');
  const asyncFetch = () => {
    setLoading(true);
    request('/api/platform/datamining/fetchdata.do', {
      method: 'POST',
      data: serialize(
        stringifyObjectField({
          moduleName: 'FUseroperatelog',
          fields: ['count.*'],
          groupfieldid: {
            fieldname: 'odate',
            function: sectionType,
          },
        }),
      ),
    }).then((response) => {
      setData(
        (response as any[])
          .map((rec) => ({
            type: rec.text,
            value: rec[COUNT],
          }))
          .sort((a, b) => (a.type > b.type ? 1 : -1)),
      );
      setLoading(false);
    });
  };
  const config: ColumnConfig = {
    loading,
    data,
    xField: 'type',
    yField: 'value',
    columnWidthRatio: 0.618,
    xAxis: { label: { autoRotate: false } },
    slider: {
      start: data.length > 13 ? 1 - 12 / data.length : 0,
      end: 1,
    },
    columnStyle,
    label: {
      position: 'top',
      formatter: (datum) => {
        return `${numeral(datum.value).format('0,0')}次`;
      },
    },
    tooltip: {
      formatter: (datum) => {
        return { name: '操作', value: `${numeral(datum.value).format('0,0')}次` };
      },
    },
    meta: {
      type: { alias: '年月' },
      value: {
        alias: '操作',
        formatter: (value: number) => {
          return `${numeral(value).format('0,0')}次`;
        },
      },
    },
  };
  useEffect(() => {
    asyncFetch();
  }, [sectionType]);
  return (
    <Card
      title={
        <>
          <span>用户操作</span>
          <Radio.Group
            value={sectionType}
            size="small"
            style={{ margin: '0px 8px' }}
            onChange={(e) => {
              setSectionType(e.target.value);
            }}
          >
            {sectionTypes.map((type) => (
              <Radio.Button value={type.value}>{type.text}</Radio.Button>
            ))}
          </Radio.Group>
          <span>柱状图</span>
        </>
      }
      {...params}
    >
      <Column {...config} />
    </Card>
  );
};
