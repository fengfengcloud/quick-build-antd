import React, { useEffect, useMemo, useState } from 'react';
import { Pie, Bar, Column, Rose } from '@ant-design/charts';
import { PieConfig } from '@ant-design/charts/es/pie';
import request from '@/utils/request';
import { ColumnConfig } from '@ant-design/charts/es/column';
import { RoseConfig } from '@ant-design/charts/es/rose';
import { Card, Col, Radio, Row } from 'antd';
import { CardProps } from 'antd/lib/card';
import { BarConfig } from '@ant-design/charts/es/bar';
import { serialize } from 'object-to-formdata';
import { stringifyObjectField } from '@/utils/utils';
import DataTable from './components/DataTable';
import ToggleTableChartButton from './components/ToggleTableChartButton';

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
        <OrgYearPmAgreementApproveColumn {...cardParams} />
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
    request('/api/platform/datamining/fetchdata.do', {
      method: 'POST',
      data: serialize(
        stringifyObjectField({
          moduleName: 'PmApproveProject2',
          fields: ['count.approveId'],
          groupfieldid: {
            fieldahead: 'pmProject.pmGlobal.FOrganization',
            codelevel: '2',
          },
        }),
      ),
    }).then((response: any[]) => {
      setData(
        response
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
    request('/api/platform/datamining/fetchdata.do', {
      method: 'POST',
      data: serialize(
        stringifyObjectField({
          moduleName: 'PmApproveProject2',
          fields: ['count.approveId'],
          groupfieldid: {
            fieldname: 'actEndTime',
            function: 'yyyy年',
          },
        }),
      ),
    }).then((response: any[]) => {
      setData(
        response
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

const OrgYearPmAgreementApproveColumn: React.FC = (params) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);
  const [orgyear, setOrgyear] = useState<boolean>(true);
  const asyncFetch = () => {
    setLoading(true);
    request('/api/platform/datamining/fetchdata.do', {
      method: 'POST',
      data: serialize(
        stringifyObjectField({
          moduleName: 'PmApproveProject2',
          fields: ['count.approveId'],
          [orgyear ? 'groupfieldid' : 'groupfieldid2']: {
            fieldahead: 'pmProject.pmGlobal.FOrganization',
          },
          [orgyear ? 'groupfieldid2' : 'groupfieldid']: {
            fieldname: 'actEndTime',
            function: 'yyyy年',
          },
        }),
      ),
    }).then((response) => {
      const datum: any[] = [];
      (response as any[]).forEach((org: any) => {
        org.children.forEach((rec: any) => {
          datum.push({
            type: rec.text === '空' ? '尚未审批' : rec.text,
            org: org.text === '空' ? '尚未审批' : org.text,
            value: rec.jf01d8858185234f0c8140e3d973d,
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
  const config: BarConfig = useMemo(
    () => ({
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
    }),
    [orgyear, loading, data],
  );
  useEffect(() => {
    asyncFetch();
  }, [orgyear]);
  return (
    <Card
      title={
        <>
          <span>合同文件审批表</span>
          <Radio.Group
            value={orgyear ? 'orgyear' : 'yearorg'}
            size="small"
            style={{ margin: '0px 8px' }}
            onChange={(e) => {
              setOrgyear(e.target.value === 'orgyear');
            }}
          >
            <Radio.Button value="orgyear">部门年度</Radio.Button>
            <Radio.Button value="yearorg">年度部门</Radio.Button>
          </Radio.Group>
          <span>审批</span>
        </>
      }
      {...params}
    >
      <Bar {...config} />
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

// 月度审批个数
export const PmAgreementApproveYearMonthColumn: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);
  const asyncFetch = () => {
    request('/api/platform/datamining/fetchdata.do', {
      method: 'POST',
      data: serialize(
        stringifyObjectField({
          moduleName: 'PmApproveProject2',
          fields: ['count.approveId'],
          groupfieldid: {
            fieldname: 'actEndTime',
            function: 'yyyy年mm月',
          },
        }),
      ),
    }).then((response) => {
      setData(
        (response as any[])
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
