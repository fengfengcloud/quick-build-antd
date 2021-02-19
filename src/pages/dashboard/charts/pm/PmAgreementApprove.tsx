import React, { useEffect, useState } from 'react';
import { Pie, Bar, Column, Rose } from '@ant-design/charts';
import { PieConfig } from '@ant-design/charts/es/pie';
import request from '@/utils/request';
import { ColumnConfig } from '@ant-design/charts/es/column';
import { RoseConfig } from '@ant-design/charts/es/rose';
import { Card, Col, Row } from 'antd';
import { CardProps } from 'antd/lib/card';
import { BarConfig } from '@ant-design/charts/es/bar';
import DataTable from './components/DataTable';
import ToggleTableChartButton from './components/ToggleTableChartButton';

//  http://localhost:8080/platform/datamining/fetchdataminingdata.do?schemeid=ff8080817577544601757dc2f86b0030

const numeral = require('numeral');

const cardParams: CardProps = {
  size: 'default',
  bodyStyle: { height: '360px', paddingTop: 12, paddingBottom: 12 },
};

export default () => {
  return (
    <Row gutter={[12, 12]} style={{ margin: '12px 6px' }}>
      <Col md={24} lg={12}>
        <OrganizationPmAgreementApprovePie />
      </Col>
      <Col md={24} lg={12}>
        <YearPmAgreementApprovePie />
      </Col>
      <Col span={24}>
        <Card title="合同文件审批表部门年度审批" {...cardParams}>
          <OrgYearPmAgreementApproveColumn />
        </Card>
      </Col>
      <Col span={24}>
        <Card title="合同文件审批表月度审批" {...cardParams}>
          <PmAgreementApproveYearMonthColumn />
        </Card>
      </Col>
    </Row>
  );
};

const OrganizationPmAgreementApprovePie: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const asyncFetch = () => {
    request('/api/platform/datamining/fetchdataminingdata.do', {
      params: {
        schemetitle: '合同文件审批表部门年度(并列)汇总表',
        treemodel: false,
      },
    }).then((response: any[]) => {
      setData(
        response
          .filter((rec) => rec.moduleName === 'FOrganization')
          .map((rec) => ({
            type: rec.text,
            value: rec.jf01d8858185234f0c8140e3d973d,
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
    radius: 0.9,
    innerRadius: 0.64,
    label: {
      type: 'outer',
      formatter: (datum) => {
        return `${numeral(datum.value).format('0,0')}个(${numeral(datum.percent).format('0.00%')})`;
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
          return `${numeral(sum).format('0,0')}个`;
        },
        offsetY: 15,
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
        return { name: datum.type, value: `${numeral(datum.value).format('0,0')}个\n` };
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
          合同文件审批表部门审批
          <ToggleTableChartButton showGrid={showGrid} setShowGrid={setShowGrid} />
        </React.Fragment>
      }
      {...cardParams}
    >
      {showGrid ? (
        <DataTable data={data} unitText="个" typeTitle="管理部门" valueTitle="文件数" />
      ) : (
        <Pie {...config} />
      )}
    </Card>
  );
};

const YearPmAgreementApprovePie: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const asyncFetch = () => {
    request('/api/platform/datamining/fetchdataminingdata.do', {
      params: {
        schemetitle: '合同文件审批表部门年度(并列)汇总表',
        treemodel: false,
      },
    }).then((response: any[]) => {
      setData(
        response
          .filter(
            ({ text }: { text: string }) =>
              (text.length === 5 && text.endsWith('年')) || text === '空',
          )
          .map((rec) => ({
            type: rec.text === '空' ? '尚未审批' : rec.text,
            value: rec.jf01d8858185234f0c8140e3d973d,
          }))
          .sort((a, b) => (a.type > b.type ? -1 : 1)),
      );
      setLoading(false);
    });
  };
  const config: RoseConfig = {
    appendPadding: 10,
    data,
    loading,
    xField: 'type',
    yField: 'value',
    seriesField: 'type',
    radius: 0.9,
    tooltip: {
      formatter: (datum) => {
        return { name: datum.type, value: `${numeral(datum.value).format('0,0')}个\n` };
      },
    },
    label: {
      offset: 15,
    },
    interactions: [{ type: 'element-active' }],
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
          合同文件审批表年度审批
          <ToggleTableChartButton showGrid={showGrid} setShowGrid={setShowGrid} />
        </React.Fragment>
      }
      {...cardParams}
    >
      {showGrid ? (
        <DataTable data={data} unitText="个" typeTitle="年度" valueTitle="文件数" />
      ) : (
        <Rose {...config} />
      )}
    </Card>
  );
};

const OrgYearPmAgreementApproveColumn: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);
  const asyncFetch = () => {
    request('/api/platform/datamining/fetchdataminingdata.do', {
      params: {
        schemetitle: '合同文件审批表部门年度(层叠)汇总表',
        treemodel: true,
      },
    }).then((response) => {
      const datum: any[] = [];
      if (response[0] && response[0].children)
        (response[0].children as any[]).forEach((org: any) => {
          org.children.forEach((rec: any) => {
            datum.push({
              type: rec.text === '空' ? '尚未审批' : rec.text,
              value: rec.jf01d8858185234f0c8140e3d973d,
              org: org.text,
            });
          });
        });
      setData(
        datum.sort((a, b) => {
          if (b.type > a.type) return -1;
          return a.type === b.type ? a.value - b.value : 1;
        }),
      );
      setLoading(false);
    });
  };
  const config: BarConfig = {
    loading,
    data,
    isStack: true,
    yField: 'type',
    xField: 'value',
    seriesField: 'org',
    barWidthRatio: 0.618,
    xAxis: { label: { autoRotate: false } },
    legend: {
      layout: 'horizontal',
      position: 'bottom',
    },
    tooltip: {
      formatter: (datum) => {
        return { name: datum.org, value: `${numeral(datum.value).format('0,0')}个` };
      },
    },
    meta: {
      type: { alias: '年月' },
      value: {
        alias: '合同文件审批',
        formatter: (value: number) => {
          return `${numeral(value).format('0,0')}个`;
        },
      },
    },
  };
  useEffect(() => {
    setTimeout(() => {
      asyncFetch();
    }, 600);
  }, []);
  return <Bar {...config} />;
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

// 月度审批个数
export const PmAgreementApproveYearMonthColumn: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);
  const asyncFetch = () => {
    request('/api/platform/datamining/fetchdataminingdata.do', {
      params: {
        schemetitle: '合同文件审批表月度审批汇总表',
        treemodel: true,
      },
    }).then((response) => {
      if (response[0] && response[0].children)
        setData(
          (response[0].children as any[])
            .map((rec) => ({
              type: rec.text === '空' ? '尚未审批' : rec.text,
              value: rec.jf01d8858185234f0c8140e3d973d,
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
        return `${datum.value}个`;
      },
    },
    tooltip: {
      formatter: (datum) => {
        return { name: '合同文件审批表', value: `${datum.value}个` };
      },
    },
    meta: {
      type: { alias: '年月' },
      value: {
        alias: '合同文件审批表',
        formatter: (value: number) => {
          return `${numeral(value).format('0,0')}个`;
        },
      },
    },
  };
  useEffect(() => {
    setTimeout(() => {
      asyncFetch();
    }, 800);
  }, []);
  return <Column {...config} />;
};