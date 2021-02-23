import React, { useEffect, useState } from 'react';
import { Pie, Column } from '@ant-design/charts';
import { PieConfig } from '@ant-design/charts/es/pie';
import request from '@/utils/request';
import { ColumnConfig } from '@ant-design/charts/es/column';
import { Card, Col, Radio, Row } from 'antd';
import { CardProps } from 'antd/lib/card';
import { serialize } from 'object-to-formdata';
import { stringifyObjectField } from '@/utils/utils';
import { TextValue } from '@/pages/module/data';
import DataTable from './components/DataTable';
import ToggleTableChartButton from './components/ToggleTableChartButton';

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

export default () => {
  return (
    <Row gutter={[12, 12]} style={{ margin: '12px 6px' }}>
      <Col md={24} lg={12}>
        <OrganizationPmAgreementPayoutPie />
      </Col>
      <Col md={24} lg={12}>
        <PlatformPmAgreementPayoutPie />
      </Col>

      <Col span={24}>
        <PmAgreementPayoutYearMonthColumn {...cardParams} />
      </Col>
    </Row>
  );
};

const OrganizationPmAgreementPayoutPie: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const asyncFetch = () => {
    request('/api/platform/datamining/fetchdata.do', {
      method: 'POST',
      data: serialize(
        stringifyObjectField({
          moduleName: 'PmPaymentDetail',
          fields: ['count.factMoney', 'sum.factMoney'],
          groupfieldid: {
            fieldahead: 'pmPayment.pmAgreement.pmProject.pmGlobal.FOrganization',
            codelevel: '2',
          },
        }),
      ),
    }).then((response) => {
      setData(
        (response as any[])
          .map((rec) => ({
            type: rec.text,
            value: parseInt(numeral(rec.jf3d68fe59d40e7f86fc73fc79218 / 10000).format('0'), 10),
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
        return `${numeral(datum.value).format('0,0')}万元(${numeral(datum.percent).format(
          '0.00%',
        )})`;
      },
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
          return `${numeral(sum).format('0,0')}万元`;
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
        return { name: datum.type, value: `${numeral(datum.value).format('0,0')}万元` };
      },
    },
  };
  useEffect(() => {
    setTimeout(() => {
      asyncFetch();
    }, 200);
  }, []);
  return (
    <Card
      title={
        <React.Fragment>
          部门累计支付总额
          <ToggleTableChartButton showGrid={showGrid} setShowGrid={setShowGrid} />
        </React.Fragment>
      }
      {...cardParams}
    >
      {showGrid ? (
        <DataTable data={data} unitText="万元" typeTitle="管理部门" valueTitle="累计支付金额" />
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
  const asyncFetch = () => {
    request('/api/platform/datamining/fetchdata.do', {
      method: 'POST',
      data: serialize(
        stringifyObjectField({
          moduleName: 'PmPaymentDetail',
          fields: ['count.factMoney', 'sum.factMoney'],
          groupfieldid: {
            fieldahead: 'pmPayment.pmAgreement.pmPayorg',
          },
        }),
      ),
    }).then((response) => {
      setData(
        (response as any[])
          .map((rec) => ({
            type: rec.text,
            value: parseInt(numeral(rec.jf3d68fe59d40e7f86fc73fc79218 / 10000).format('0'), 10),
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
        return `${numeral(datum.value).format('0,0')}万元(${numeral(datum.percent).format(
          '0.00%',
        )})`;
      },
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
          return `${numeral(sum).format('0,0')}万元`;
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
        return { name: datum.type, value: `${numeral(datum.value).format('0,0')}万元` };
      },
    },
  };
  useEffect(() => {
    setTimeout(() => {
      asyncFetch();
    }, 400);
  }, []);
  return (
    <Card
      title={
        <React.Fragment>
          支付平台累计支付总额
          <ToggleTableChartButton showGrid={showGrid} setShowGrid={setShowGrid} />
        </React.Fragment>
      }
      {...cardParams}
    >
      {showGrid ? (
        <DataTable data={data} unitText="万元" typeTitle="支付平台" valueTitle="累计支付金额" />
      ) : (
        <Pie {...config} />
      )}
    </Card>
  );
};

const sectionTypes: TextValue[] = [
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

const PmAgreementPayoutYearMonthColumn: React.FC = (params) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);
  const [sectionType, setSectionType] = useState<string>(sectionTypes[0].value || '');
  const asyncFetch = () => {
    request('/api/platform/datamining/fetchdata.do', {
      method: 'POST',
      data: serialize(
        stringifyObjectField({
          moduleName: 'PmPaymentDetail',
          fields: ['count.factMoney', 'sum.factMoney'],
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
            value: parseInt(numeral(rec.jf3d68fe59d40e7f86fc73fc79218 / 10000).format('0'), 10),
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
        return `${numeral(datum.value).format('0,0')}万元`;
      },
    },
    tooltip: {
      formatter: (datum) => {
        return { name: '支付金额', value: `${numeral(datum.value).format('0,0')}万元` };
      },
    },
    meta: {
      type: { alias: '年月' },
      value: {
        alias: '支付金额',
        formatter: (value: number) => {
          return `${numeral(value).format('0,0')}万元`;
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
          <span>项目合同</span>
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
          <span>已付金额柱状图</span>
        </>
      }
      {...params}
    >
      <Column {...config} />
    </Card>
  );
};
