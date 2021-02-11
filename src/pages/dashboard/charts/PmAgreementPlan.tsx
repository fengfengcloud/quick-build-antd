import request from '@/utils/request';
import { Column } from '@ant-design/charts';
import { ColumnConfig } from '@ant-design/charts/es/column';
import { Card, Col, Row } from 'antd';
import { CardProps } from 'antd/lib/card';
import moment from 'moment';
import { serialize } from 'object-to-formdata';
import React, { useEffect, useState } from 'react';

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
      <Col span={24}>
        <PmLiabilityYearColumn />
      </Col>
      <Col span={24}>
        <PmAgreementPlanYearStackColumn />
      </Col>
      <Col span={24}>
        <PmAgreementPlanYearColumn />
      </Col>
      <Col span={24}>
        <PmAgreementPlanYearMonthColumn />
      </Col>
    </Row>
  );
};

const PmLiabilityYearColumn: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);
  const fields = JSON.stringify(['sum.nopayAmount']);
  const asyncFetch = () => {
    request('/api/platform/datamining/fetchdata.do', {
      method: 'POST',
      data: serialize({
        moduleName: 'PmAgreementPlan',
        fields,
        groupfieldid: 'ff8080817517d40c017517d59464017f-8a53b78262ea6e6d0162ea6e89810000',
      }),
    }).then((response: any[]) => {
      // 每一年度把以前未付的加起来
      let thisyearbefore = 0;
      const dataSource = response
        .map((rec) => ({
          type: rec.text,
          // 未支付
          value: parseInt(numeral(rec.jf1cddb74923df9f536626517dddf / 10000).format('0'), 10),
          group: '当年度',
        }))
        .sort((a, b) => (a.type > b.type ? 1 : -1))
        .filter((rec) => {
          if (rec.type >= `${parseInt(moment().format('YYYY'), 10)}`) return true;
          thisyearbefore += rec.value;
          return false;
        });
      const chartdata: any[] = [...dataSource];
      // 当前年度之前的是当年结转
      if (thisyearbefore > 0) {
        chartdata.splice(0, 0, {
          type: `${parseInt(moment().format('YYYY'), 10)}年前`,
          value: thisyearbefore,
          group: '当年度',
        });
      }

      dataSource.forEach((rec) => {
        chartdata.push({
          type: rec.type,
          value: thisyearbefore,
          group: '以前年度结转',
        });
        thisyearbefore += rec.value;
      });
      setData(chartdata);
      setLoading(false);
    });
  };
  const config: ColumnConfig = {
    loading,
    data,
    isStack: true,
    xField: 'type',
    yField: 'value',
    seriesField: 'group',
    columnWidthRatio: 0.618,
    xAxis: { label: { autoRotate: false } },
    columnStyle,
    legend: {
      layout: 'horizontal',
      position: 'bottom',
    },
    label: {
      position: 'middle',
      formatter: (datum) => {
        // 小于10万的不要显示值了，太小
        return datum.value > 10 ? `${numeral(datum.value).format('0,0')}万` : '';
      },
    },
    tooltip: {
      formatter: (datum) => {
        return { name: datum.group, value: `${numeral(datum.value).format('0,0')}万元` };
      },
    },
  };
  useEffect(() => {
    setTimeout(() => {
      asyncFetch();
    }, 200);
  }, []);
  return (
    <Card title="根据付款计划测算的年度付款压力(隐性债务)柱状图" {...cardParams}>
      <Column {...config} />
    </Card>
  );
};

/**
 * 年度计划,可支付，不可支付
 */
const PmAgreementPlanYearStackColumn: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);
  const fields = JSON.stringify(['sum.planAmount', 'sum.alreadyAmount', 'sum.nopayAmount']);
  const asyncFetch = () => {
    request('/api/platform/datamining/fetchdata.do', {
      method: 'POST',
      data: serialize({
        moduleName: 'PmAgreementPlan',
        fields,
        groupfieldid: 'ff8080817517d40c017517d59464017f-8a53b78262ea6e6d0162ea6e89810000',
      }),
    }).then((response: any[]) => {
      const dataSource = response
        .map((rec) => ({
          type: rec.text,
          value: parseInt(numeral(rec.jfae8913f5b24bdbb25b431582dab / 10000).format('0'), 10),
          payout: parseInt(numeral(rec.jf1208b6fed8ea0615d208003d004 / 10000).format('0'), 10),
          remain: parseInt(numeral(rec.jf1cddb74923df9f536626517dddf / 10000).format('0'), 10),
        }))
        .sort((a, b) => (a.type > b.type ? 1 : -1))
        .filter((rec) => rec.type > `${parseInt(moment().format('YYYY'), 10) - 7}`);
      const chartdata: any[] = [];
      dataSource.forEach((rec) => {
        chartdata.push({
          type: rec.type,
          group: '计划已支付金额',
          value: rec.payout,
        });
        chartdata.push({
          type: rec.type,
          group: '计划未支付金额',
          value: rec.remain,
        });
      });
      setData(chartdata);
      setLoading(false);
    });
  };
  const config: ColumnConfig = {
    loading,
    data,
    isStack: true,
    xField: 'type',
    yField: 'value',
    seriesField: 'group',
    columnWidthRatio: 0.618,
    xAxis: { label: { autoRotate: false } },
    columnStyle,
    legend: {
      layout: 'horizontal',
      position: 'bottom',
    },
    label: {
      position: 'middle',
      formatter: (datum) => {
        // 小于10万的不要显示值了，太小
        return datum.value > 10 ? `${numeral(datum.value).format('0,0')}万` : '';
      },
    },
    tooltip: {
      formatter: (datum) => {
        return { name: datum.group, value: `${numeral(datum.value).format('0,0')}万元` };
      },
    },
  };
  useEffect(() => {
    setTimeout(() => {
      asyncFetch();
    }, 400);
  }, []);
  return (
    <Card title="项目合同年度计划支付情况柱状图" {...cardParams}>
      <Column {...config} />
    </Card>
  );
};

/**
 * 年度计划
 */
const PmAgreementPlanYearColumn: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);
  const fields = JSON.stringify(['sum.planAmount', 'sum.alreadyAmount', 'sum.nopayAmount']);
  const asyncFetch = () => {
    request('/api/platform/datamining/fetchdata.do', {
      method: 'POST',
      data: serialize({
        moduleName: 'PmAgreementPlan',
        fields,
        groupfieldid: 'ff8080817517d40c017517d59464017f-8a53b78262ea6e6d0162ea6e89810000',
      }),
    }).then((response: any[]) => {
      setData(
        response
          .map((rec) => ({
            type: rec.text,
            value: parseInt(numeral(rec.jfae8913f5b24bdbb25b431582dab / 10000).format('0'), 10),
          }))
          .sort((a, b) => (a.type > b.type ? 1 : -1)),
      );
      setLoading(false);
    });
  };
  const getStart = (): number => {
    return data.length > 13
      ? Math.max(
          (data.findIndex((rec) => (rec.type as string) > moment().format('YYYY')) - 2) /
            data.length,
          0,
        )
      : 0;
  };
  const getEnd = (): number => {
    return data.length > 13
      ? (data.findIndex((rec) => (rec.type as string) > moment().format('YYYY')) + 8.0) /
          data.length
      : 1;
  };
  const config: ColumnConfig = {
    loading,
    data,
    xField: 'type',
    yField: 'value',
    columnWidthRatio: 0.618,
    xAxis: { label: { autoRotate: false } },
    slider: {
      // 找到当年度的第一个位置，显示12个月
      start: getStart(),
      end: getEnd(),
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
        return { name: '计划金额', value: `${numeral(datum.value).format('0,0')}万元` };
      },
    },
    meta: {
      type: { alias: '年月' },
      value: {
        alias: '计划金额',
        formatter: (value: number) => {
          return `${numeral(value).format('0,0')}万元`;
        },
      },
    },
  };
  useEffect(() => {
    setTimeout(() => {
      asyncFetch();
    }, 600);
  }, []);
  return (
    <Card title="项目合同年度度付款计划柱状图" {...cardParams}>
      <Column {...config} />
    </Card>
  );
};

const PmAgreementPlanYearMonthColumn: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);
  const fields = JSON.stringify(['sum.planAmount', 'sum.alreadyAmount', 'sum.nopayAmount']);
  const asyncFetch = () => {
    request('/api/platform/datamining/fetchdata.do', {
      method: 'POST',
      data: serialize({
        moduleName: 'PmAgreementPlan',
        fields,
        groupfieldid: 'ff8080817517d40c017517d59464017f-8a53b78262ea6e6d0162ea6e89ab0001',
      }),
    }).then((response: any[]) => {
      setData(
        response
          .map((rec) => ({
            type: rec.text,
            value: parseInt(numeral(rec.jfae8913f5b24bdbb25b431582dab / 10000).format('0'), 10),
          }))
          .sort((a, b) => (a.type > b.type ? 1 : -1)),
      );
      setLoading(false);
    });
  };
  const getStart = (): number => {
    return data.length > 13
      ? (data.findIndex((rec) => (rec.type as string).startsWith(moment().format('YYYY'))) + 1.0) /
          data.length
      : 0;
  };
  const getEnd = (): number => {
    return data.length > 13
      ? (data.findIndex((rec) => (rec.type as string).startsWith(moment().format('YYYY'))) + 12.0) /
          data.length
      : 1;
  };
  const config: ColumnConfig = {
    loading,
    data,
    xField: 'type',
    yField: 'value',
    columnWidthRatio: 0.618,
    xAxis: { label: { autoRotate: false } },
    slider: {
      // 找到当年度的第一个位置，显示12个月
      start: getStart(),
      end: getEnd(),
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
        return { name: '计划金额', value: `${numeral(datum.value).format('0,0')}万元` };
      },
    },
    meta: {
      type: { alias: '年月' },
      value: {
        alias: '计划金额',
        formatter: (value: number) => {
          return `${numeral(value).format('0,0')}万元`;
        },
      },
    },
  };
  useEffect(() => {
    setTimeout(() => {
      asyncFetch();
    }, 800);
  }, []);
  return (
    <Card title="项目合同月度付款计划柱状图" {...cardParams}>
      <Column {...config} />
    </Card>
  );
};
