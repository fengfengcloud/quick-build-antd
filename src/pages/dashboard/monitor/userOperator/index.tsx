import React, { useEffect, useState } from 'react';
import { Card, CardProps, Col, Row } from 'antd';
import { currentUser } from 'umi';
import { serialize } from 'object-to-formdata';
import request from '@/utils/request';
import { stringifyObjectField } from '@/utils/utils';
import { PieConfig } from '@ant-design/charts/es/pie';
import { getColumnDataIndex } from '@/pages/datamining/utils';
import { Pie } from '@ant-design/charts';

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
      {/* 
      <Col span={24}>
      </Col> */}
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
