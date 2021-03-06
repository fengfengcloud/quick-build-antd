import React, { useEffect, useState } from 'react';
import { Pie, Column } from '@ant-design/charts';
import type { PieConfig } from '@ant-design/charts/es/pie';
import request, { API_HEAD } from '@/utils/request';
import type { ColumnConfig } from '@ant-design/charts/es/column';
import { Card, Col, Radio, Row } from 'antd';
import type { CardProps } from 'antd/lib/card';
import { serialize } from 'object-to-formdata';
import moment from 'moment';
import { stringifyObjectField } from '@/utils/utils';
import type { TextValue } from '@/pages/module/data';
import { getColumnDataIndex } from '@/pages/datamining/utils';
import { DateFormat } from '@/pages/module/moduleUtils';
import DataTable from './components/DataTable';
import ToggleTableChartButton from './components/ToggleTableChartButton';
import { DateSectionSelect } from '../../utils/DateSectionSelect';
import { chartsColSpan } from '..';

const numeral = require('numeral');

const columnStyle = {
  fillOpacity: 0.5,
  strokeOpacity: 0.7,
  shadowColor: 'black',
  shadowBlur: 10,
  shadowOffsetX: 5,
  shadowOffsetY: 5,
  cursor: 'pointer',
};

const cardParams: CardProps = {
  size: 'default',
  bodyStyle: { height: '360px', paddingTop: 12, paddingBottom: 12 },
};

// const COUNTX = getColumnDataIndex('count.*');
const SUMFACT = getColumnDataIndex('sum.factMoney');

const OrganizationPmAgreementPayoutPie: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [dateSection, setDateSection] = useState<[any, any]>([null, null]);
  const asyncFetch = () => {
    setLoading(true);
    const navigatefilters: any[] = [];
    const [d1, d2] = dateSection;
    if (d1 || d2) {
      navigatefilters.push({
        property: 'factDate',
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
          moduleName: 'PmPaymentDetail',
          fields: ['count.*', 'sum.factMoney'],
          groupfieldid: {
            fieldahead: 'pmPayment.pmAgreement.pmProject.pmGlobal.FOrganization',
            codelevel: '2',
          },
          navigatefilters,
        }),
      ),
    }).then((response) => {
      setData(
        (response as any[])
          .map((rec) => ({
            type: rec.text,
            value: parseInt(numeral(rec[SUMFACT] / 10000).format('0'), 10),
          }))
          .sort((a, b) => b.value - a.value),
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
      formatter: (datum) => {
        return `${numeral(datum.value).format('0,0')}??????(${numeral(datum.percent).format(
          '0.00%',
        )})`;
      },
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
          return `${numeral(sum).format('0,0')}??????`;
        },
        offsetY: 15,
        style: {
          fontSize: '18px',
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
        return { name: datum.type, value: `${numeral(datum.value).format('0,0')}??????` };
      },
    },
  };
  useEffect(() => {
    asyncFetch();
  }, [dateSection]);
  return (
    <Card
      title={
        <React.Fragment>
          ????????????????????????
          <ToggleTableChartButton showGrid={showGrid} setShowGrid={setShowGrid} />
        </React.Fragment>
      }
      {...cardParams}
      extra={<DateSectionSelect dateSection={dateSection} setDateSection={setDateSection} />}
    >
      {showGrid ? (
        <DataTable data={data} unitText="??????" typeTitle="????????????" valueTitle="??????????????????" />
      ) : (
        <Pie {...config} />
      )}
    </Card>
  );
};

const PlatformPmAgreementPayoutPie: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [dateSection, setDateSection] = useState<[any, any]>([null, null]);
  const asyncFetch = () => {
    setLoading(true);
    const navigatefilters: any[] = [];
    const [d1, d2] = dateSection;
    if (d1 || d2) {
      navigatefilters.push({
        property: 'factDate',
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
          moduleName: 'PmPaymentDetail',
          fields: ['count.*', 'sum.factMoney'],
          groupfieldid: {
            fieldahead: 'pmPayment.pmAgreement.pmPayorg',
          },
          navigatefilters,
        }),
      ),
    }).then((response) => {
      setData(
        (response as any[])
          .map((rec) => ({
            type: rec.text,
            value: parseInt(numeral(rec[SUMFACT] / 10000).format('0'), 10),
          }))
          .sort((a, b) => b.value - a.value),
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
      formatter: (datum) => {
        return `${numeral(datum.value).format('0,0')}??????(${numeral(datum.percent).format(
          '0.00%',
        )})`;
      },
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
          return `${numeral(sum).format('0,0')}??????`;
        },
        offsetY: 15,
        style: {
          fontSize: '18px',
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
        return { name: datum.type, value: `${numeral(datum.value).format('0,0')}??????` };
      },
    },
  };
  useEffect(() => {
    asyncFetch();
  }, [dateSection]);
  return (
    <Card
      title={
        <React.Fragment>
          ??????????????????????????????
          <ToggleTableChartButton showGrid={showGrid} setShowGrid={setShowGrid} />
        </React.Fragment>
      }
      {...cardParams}
      extra={<DateSectionSelect dateSection={dateSection} setDateSection={setDateSection} />}
    >
      {showGrid ? (
        <DataTable data={data} unitText="??????" typeTitle="????????????" valueTitle="??????????????????" />
      ) : (
        <Pie {...config} />
      )}
    </Card>
  );
};

const sectionTypes: TextValue[] = [
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

const PmAgreementPayoutYearMonthColumn: React.FC = (params) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);
  const [sectionType, setSectionType] = useState<string>(sectionTypes[0].value || '');
  const asyncFetch = () => {
    setLoading(true);
    request(`${API_HEAD}/platform/datamining/fetchdata.do`, {
      method: 'POST',
      data: serialize(
        stringifyObjectField({
          moduleName: 'PmPaymentDetail',
          fields: ['count.*', 'sum.factMoney'],
          groupfieldid: {
            fieldname: 'factDate',
            function: sectionType,
          },
        }),
      ),
    }).then((response) => {
      setData(
        (response as any[])
          .map((rec) => ({
            type: rec.text,
            value: parseInt(numeral(rec[SUMFACT] / 10000).format('0'), 10),
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
        return `${numeral(datum.value).format('0,0')}??????`;
      },
    },
    tooltip: {
      formatter: (datum) => {
        return { name: '????????????', value: `${numeral(datum.value).format('0,0')}??????` };
      },
    },
    meta: {
      type: { alias: '??????' },
      value: {
        alias: '????????????',
        formatter: (value: number) => {
          return `${numeral(value).format('0,0')}??????`;
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
          <span>?????????????????????</span>
        </>
      }
      {...params}
    >
      <Column {...config} />
    </Card>
  );
};

export default () => {
  return (
    <Row gutter={[12, 12]}>
      <Col {...chartsColSpan}>
        <OrganizationPmAgreementPayoutPie />
      </Col>
      <Col {...chartsColSpan}>
        <PlatformPmAgreementPayoutPie />
      </Col>
      <Col span={24}>
        <PmAgreementPayoutYearMonthColumn {...cardParams} />
      </Col>
    </Row>
  );
};
