import React, { useEffect, useState } from 'react';
import { Pie, Column } from '@ant-design/charts';
import { PieConfig } from '@ant-design/charts/es/pie';
import request from '@/utils/request';
import { ColumnConfig } from '@ant-design/charts/es/column';
import { Card, Col, Row } from 'antd';
import { CardProps } from 'antd/lib/card';
import ToggleTableChartButton from './components/ToggleTableChartButton';
import DataTable from './components/DataTable';

//  http://localhost:8080/platform/datamining/fetchdataminingdata.do?schemeid=ff8080817577544601757dc2f86b0030

const numeral = require('numeral');

const columnStyle = {
    fillOpacity: 0.5,
    strokeOpacity: 0.7,
    shadowColor: 'black',
    shadowBlur: 10,
    shadowOffsetX: 5,
    shadowOffsetY: 5,
    cursor: 'pointer'
}

const cardParams: CardProps = {
    size: "default",
    bodyStyle: { height: '360px', paddingTop: 12, paddingBottom: 12 }
}

export default () => {
    return <Row gutter={[12, 12]} style={{ margin: 6 }}>
        <Col md={24} lg={12}>
            <OrganizationPmAgreementPayoutPie />
        </Col>
        <Col md={24} lg={12}>
            <PlatformPmAgreementPayoutPie />
        </Col>

        <Col span={24}>
            <Card title="项目合同月度已付金额柱状图" {...cardParams}>
                <PmAgreementPayoutYearMonthColumn />
            </Card>
        </Col>
    </Row>
}

const OrganizationPmAgreementPayoutPie: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showGrid, setShowGrid] = useState<boolean>(false);
    useEffect(() => {
        setTimeout(() => {
            asyncFetch();
        }, 200);
    }, [])
    const asyncFetch = () => {
        request('/api/platform/datamining/fetchdataminingdata.do',
            {
                params: {
                    schemeid: 'ff8080817586cb9101758e7aabfc007f',
                    treemodel: true,
                }
            }).then((response) => {
                if (response[0] && response[0].children)
                    setData((response[0].children as any[]).map(rec => ({
                        type: rec.text,
                        value: parseInt(numeral(rec.jf3d68fe59d40e7f86fc73fc79218 / 10000).format('0')),
                    })).sort((a, b) => b.value - a.value));
                setLoading(false);
            })
    }
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
            formatter: (data) => {
                return numeral(data.value).format('0,0') + '万元('
                    + numeral(data.percent).format('0.00%') + ')'
            },
        },
        statistic: {
            title: {
                formatter: () => '总计',
                offsetY: -15
            },
            content: {
                formatter: (value, data) => {
                    let sum = 0;
                    data?.forEach(rec => {
                        sum += rec.value;
                    })
                    return numeral(sum).format('0,0') + '万元';
                },
                offsetY: 15
            },
        },
        interactions: [{ type: 'element-active' }],
        legend: {
            layout: 'vertical',
            position: 'right',
            animate: true,
        },
        tooltip: {
            formatter: (data) => {
                return { name: data.type, value: numeral(data.value).format('0,0') + '万元' }
            },
        },
    };
    return <Card title={<React.Fragment>部门累计支付总额
        <ToggleTableChartButton showGrid={showGrid} setShowGrid={setShowGrid} />
    </React.Fragment>} {...cardParams}>
        {showGrid ? <DataTable data={data} unitText="万元"
            typeTitle="管理部门" valueTitle="累计支付金额" /> :
            <Pie{...config} />}
    </Card>;
};

const PlatformPmAgreementPayoutPie: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showGrid, setShowGrid] = useState<boolean>(false);
    useEffect(() => {
        setTimeout(() => {
            asyncFetch();
        }, 400);
    }, [])
    const asyncFetch = () => {
        request('/api/platform/datamining/fetchdataminingdata.do',
            {
                params: {
                    schemeid: 'ff8080817577544601757dc2f86b0030',
                    treemodel: true,
                }
            }).then((response) => {
                if (response[0] && response[0].children)
                    setData((response[0].children as any[]).map(rec => ({
                        type: rec.text,
                        value: parseInt(numeral(rec.jf3d68fe59d40e7f86fc73fc79218 / 10000).format('0')),
                    })).sort((a, b) => b.value - a.value));
                setLoading(false);
            })
    }
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
            formatter: (data) => {
                return numeral(data.value).format('0,0') + '万元(' + numeral(data.percent).format('0.00%') + ')'
            },
        },
        statistic: {
            title: {
                formatter: () => '总计',
                offsetY: -15
            },
            content: {
                formatter: (value, data) => {
                    let sum = 0;
                    data?.forEach(rec => {
                        sum += rec.value;
                    })
                    return numeral(sum).format('0,0') + '万元';
                }, offsetY: 15,
            }
        },
        interactions: [{ type: 'element-active' }],
        legend: {
            layout: 'vertical',
            position: 'right',
            animate: true,
        },
        tooltip: {
            formatter: (data) => {
                return { name: data.type, value: numeral(data.value).format('0,0') + '万元' }
            },
        },
    };
    return <Card title={<React.Fragment>支付平台累计支付总额
        <ToggleTableChartButton showGrid={showGrid} setShowGrid={setShowGrid} />
    </React.Fragment>} {...cardParams}>
        {showGrid ? <DataTable data={data} unitText="万元"
            typeTitle="支付平台" valueTitle="累计支付金额" /> :
            <Pie{...config} />}
    </Card>;
};


const PmAgreementPayoutYearMonthColumn: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [data, setData] = useState<any[]>([]);
    useEffect(() => {
        setTimeout(() => {
            asyncFetch();
        }, 600);
    }, []);
    const asyncFetch = () => {
        request('/api/platform/datamining/fetchdataminingdata.do',
            {
                params: {
                    schemeid: 'ff8080817586cb9101758c33a3760032',
                    treemodel: true,
                }
            }).then((response) => {
                if (response[0] && response[0].children)
                    setData((response[0].children as any[]).map(rec => ({
                        type: rec.text,
                        value: parseInt(numeral(rec.jf3d68fe59d40e7f86fc73fc79218 / 10000).format('0')),
                    })).sort((a, b) => a.type > b.type ? 1 : -1));
                setLoading(false);
            })
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
            formatter: (data) => {
                return numeral(data.value).format('0,0') + '万元';
            },
        },
        tooltip: {
            formatter: (datum) => {
                return { name: '支付金额', value: numeral(datum.value).format('0,0') + '万元' };
            },
        },
        meta: {
            type: { alias: '年月' },
            value: {
                alias: '支付金额',
                formatter: (value: number) => {
                    return numeral(value).format('0,0') + '万元';
                },
            },
        },
    };
    return <Column {...config} />;
};
