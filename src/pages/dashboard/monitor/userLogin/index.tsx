import React, { useEffect, useState } from 'react';
import { Card, CardProps, Col, Radio, Row } from 'antd';
import request, { API_HEAD } from '@/utils/request';
import { serialize } from 'object-to-formdata';
import { stringifyObjectField } from '@/utils/utils';
import { getColumnDataIndex } from '@/pages/datamining/utils';
import { currentUser } from 'umi';
import moment from 'moment';

import { PieConfig } from '@ant-design/charts/es/pie';
import { Column, Pie } from '@ant-design/charts';
import { TextValue } from '@/pages/module/data';
import { ColumnConfig } from '@ant-design/charts/es/column';
import { DateFormat } from '@/pages/module/moduleUtils';
import { DateSectionSelect } from '../../utils/DateSectionSelect';
import { chartsColSpan } from '../../charts';

const numeral = require('numeral');

const cardParams: CardProps = {
  size: 'default',
  bodyStyle: { height: '360px', paddingTop: 12, paddingBottom: 12 },
};

export const UserLogin: React.FC = () => {
  return (
    <Row gutter={[12, 12]}>
      <Col {...chartsColSpan}>
        <UserLogginPie title="用户登录地址分析" groupfieldid={{ fieldname: 'ipaddress' }} />
      </Col>
      <Col {...chartsColSpan}>
        <UserLogginInOutColumn />
      </Col>
      <Col span={24}>
        <UserLogginYearMonthColumn {...cardParams} />
      </Col>
    </Row>
  );
};

const COUNT = getColumnDataIndex('count.*');
const AVG = getColumnDataIndex('avg.udfloginminute');

const UserLogginPie: React.FC<any> = ({
  title,
  groupfieldid,
}: {
  title: string;
  groupfieldid: any;
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dateSection, setDateSection] = useState<[any, any]>([null, null]);
  const fetchData = () => {
    setLoading(true);
    const fields = ['count.*'];
    const filter = {
      property_: {
        moduleName: 'FUserloginlog',
        fieldahead: 'FUser',
      },
      operator: '=',
      value: currentUser.userid,
    };
    const navigatefilters: any[] = [filter];
    const [d1, d2] = dateSection;
    if (d1 || d2) {
      navigatefilters.push({
        property: 'logindate',
        operator: 'daysection',
        searchfor: 'date',
        value: `${d1 ? moment(d1).format(DateFormat) : ''}--${
          d2 ? moment(d2).format(DateFormat) : ''
        }`,
      });
    }
    request(`${API_HEAD}/platform/datamining/fetchdata.do`, {
      method: 'POST',
      data: serialize(
        stringifyObjectField({
          moduleName: 'FUserloginlog',
          fields,
          navigatefilters,
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
      setLoading(false);
    });
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
  }, [dateSection]);
  return (
    <Card
      title={title}
      {...cardParams}
      extra={<DateSectionSelect dateSection={dateSection} setDateSection={setDateSection} />}
    >
      <Pie {...config} />
    </Card>
  );
};

const UserLogginInOutColumn: React.FC<any> = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dateSection, setDateSection] = useState<[any, any]>([null, null]);
  const fetchData = () => {
    const fields = ['count.*'];
    let datas: any[];
    const filter = {
      property_: {
        moduleName: 'FUserloginlog',
        fieldahead: 'FUser',
      },
      operator: '=',
      value: currentUser.userid,
    };
    const navigatefilters: any[] = [filter];
    const [d1, d2] = dateSection;
    if (d1 || d2) {
      navigatefilters.push({
        property: 'logindate',
        operator: 'daysection',
        searchfor: 'date',
        value: `${d1 ? moment(d1).format(DateFormat) : ''}--${
          d2 ? moment(d2).format(DateFormat) : ''
        }`,
      });
    }
    request(`${API_HEAD}/platform/datamining/fetchdata.do`, {
      method: 'POST',
      data: serialize(
        stringifyObjectField({
          moduleName: 'FUserloginlog',
          fields,
          navigatefilters,
          groupfieldid: { fieldname: 'logintype' },
        }),
      ),
    }).then((response) => {
      datas = (response as any[])
        .map((rec) => ({
          type: rec.text === '空' ? '正常登录' : rec.text,
          value: rec[COUNT],
          group: '登录',
        }))
        .sort((rec1, rec2) => rec2.value - rec1.value);
      request(`${API_HEAD}/platform/datamining/fetchdata.do`, {
        method: 'POST',
        data: serialize(
          stringifyObjectField({
            moduleName: 'FUserloginlog',
            fields,
            navigatefilters,
            groupfieldid: { fieldname: 'logouttype' },
          }),
        ),
      }).then((response1) => {
        datas.splice(
          datas.length,
          0,
          ...(response1 as any[])
            .map((rec) => ({
              type: rec.text === '空' ? '登出异常' : rec.text,
              value: rec[COUNT],
              group: '登出',
            }))
            .sort((rec1, rec2) => rec2.value - rec1.value),
        );
        setData(datas);
        setLoading(false);
      });
    });
  };
  useEffect(() => {
    fetchData();
  }, [dateSection]);
  const config = {
    data,
    loading,
    xField: 'group',
    yField: 'value',
    isGroup: true,
    isStack: true,
    seriesField: 'type',
    groupField: 'group',
  };
  return (
    <Card
      title="用户登录登出方式分析"
      {...cardParams}
      extra={<DateSectionSelect dateSection={dateSection} setDateSection={setDateSection} />}
    >
      <Column {...config} />
    </Card>
  );
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

const UserLogginYearMonthColumn: React.FC = (params) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);
  const [sectionType, setSectionType] = useState<string>(sectionTypes[0].value || '');
  const asyncFetch = () => {
    setLoading(true);
    const filter = {
      property_: {
        moduleName: 'FUserloginlog',
        fieldahead: 'FUser',
      },
      operator: '=',
      value: currentUser.userid,
    };
    request(`${API_HEAD}/platform/datamining/fetchdata.do`, {
      method: 'POST',
      data: serialize(
        stringifyObjectField({
          moduleName: 'FUserloginlog',
          fields: ['count.*', 'avg.udfloginminute'],
          navigatefilters: [filter],
          groupfieldid: {
            fieldname: 'logindate',
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
            avg: rec[AVG],
          }))
          .sort((a, b) => (a.type > b.type ? 1 : -1))
          .reverse()
          .filter((value, index) => index < 300)
          .reverse(),
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
        return { name: '登录', value: `${numeral(datum.value).format('0,0')}次` };
      },
    },
    meta: {
      type: { alias: '年月' },
      value: {
        alias: '登录',
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
          <span>用户登录</span>
          <Radio.Group
            value={sectionType}
            size="small"
            style={{ margin: '0px 8px', fontWeight: 400 }}
            onChange={(e) => {
              setSectionType(e.target.value);
            }}
          >
            {sectionTypes.map((type) => (
              <Radio.Button key={type.value} value={type.value}>
                {type.text}
              </Radio.Button>
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
