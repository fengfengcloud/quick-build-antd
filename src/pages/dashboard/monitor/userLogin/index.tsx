import React, { useEffect, useState } from 'react';
import type { CardProps } from 'antd';
import { Card, Col, Radio, Row } from 'antd';
import request, { API_HEAD } from '@/utils/request';
import { serialize } from 'object-to-formdata';
import { stringifyObjectField } from '@/utils/utils';
import { getColumnDataIndex } from '@/pages/datamining/utils';
import { currentUser } from 'umi';
import moment from 'moment';

import type { PieConfig } from '@ant-design/charts/es/pie';
import { Column, Pie } from '@ant-design/charts';
import type { TextValue } from '@/pages/module/data';
import type { ColumnConfig } from '@ant-design/charts/es/column';
import { DateFormat } from '@/pages/module/moduleUtils';
import { DateSectionSelect } from '../../utils/DateSectionSelect';
import { chartsColSpan } from '../../charts';

const numeral = require('numeral');

const cardParams: CardProps = {
  size: 'default',
  bodyStyle: { height: '360px', paddingTop: 12, paddingBottom: 12 },
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
      formatter: (datum) => `${datum.value}???(${numeral(datum.percent).format('0.00%')})`,
    },
    statistic: {
      title: {
        formatter: () => '??????',
        offsetY: -15,
      },
      content: {
        formatter: (value, datum) => {
          let sum = 0;
          if (datum)
            datum.forEach((rec) => {
              sum += rec.value;
            });
          return `${numeral(sum).format('0,0')}???`;
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
        return { name: datum.type, value: `${numeral(datum.value).format('0,0')}???` };
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
          type: rec.text === '???' ? '????????????' : rec.text,
          value: rec[COUNT],
          group: '??????',
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
              type: rec.text === '???' ? '????????????' : rec.text,
              value: rec[COUNT],
              group: '??????',
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
      title="??????????????????????????????"
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
    text: '??????',
    value: 'yyyy???mm???dd???',
  },
  {
    text: '??????',
    value: 'yyyy???mm???',
  },
  {
    text: '??????',
    value: 'yyyy???',
  },
  {
    text: '??????',
    value: 'yyyy???n??????',
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
        return `${numeral(datum.value).format('0,0')}???`;
      },
    },
    tooltip: {
      formatter: (datum) => {
        return { name: '??????', value: `${numeral(datum.value).format('0,0')}???` };
      },
    },
    meta: {
      type: { alias: '??????' },
      value: {
        alias: '??????',
        formatter: (value: number) => {
          return `${numeral(value).format('0,0')}???`;
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
          <span>????????????</span>
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
          <span>?????????</span>
        </>
      }
      {...params}
    >
      <Column {...config} />
    </Card>
  );
};

export const UserLogin: React.FC = () => {
  return (
    <Row gutter={[12, 12]}>
      <Col {...chartsColSpan}>
        <UserLogginPie title="????????????????????????" groupfieldid={{ fieldname: 'ipaddress' }} />
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
