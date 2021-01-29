import React, { useEffect, useState } from 'react';
import { Column, DualAxes, Pie } from '@ant-design/charts';
import request from '@/utils/request';
import { DualAxesConfig } from '@ant-design/charts/es/dualAxes';
import { ColumnConfig } from '@ant-design/charts/es/column';
import { Card, Col, Form, Row, Select, Switch } from 'antd';
import { CardProps } from 'antd/lib/card';
import { serialize } from 'object-to-formdata';
import FOrganizationTreeSelect from './components/OrganizationTreeSelect';
import { PieConfig } from '@ant-design/charts/es/pie';
import DataTable from './components/DataTable';
import ToggleTableChartButton from './components/ToggleTableChartButton';
import { EchartsDemo } from './echartsDemo';

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
    size: 'default',
    bodyStyle: { height: '360px', paddingTop: 12, paddingBottom: 12 }
}

export default () => {
    const result = <Row gutter={[12, 12]} style={{ margin: 6 }}>
        <Col md={24} lg={12}>
            <PmAgreementGlobal />
        </Col>
        <Col md={24} lg={12}>
            <PmAgreementCountPie />
        </Col>
        <Col span={24}>
            <Card title='项目合同一年内签订个数、签订金额分析图' {...cardParams}>
                <PmAgreementSignYearMonthColumn />
            </Card>
        </Col>
        <Col xs={24} sm={24} md={24} lg={12}>
            <Card title='echarts图表' bodyStyle={{ paddingTop: 12, paddingBottom: 12 }}>
                <EchartsDemo id="echarts1" />
            </Card>
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} >
            <Card title='echarts图表' bodyStyle={{ paddingTop: 12, paddingBottom: 12 }}>
                <EchartsDemo id="echarts2"/>
            </Card>
        </Col>
    </Row >
    return result;
}


// 合同结算金额、可支付计划金额、已支付金额、
const PmAgreementGlobal: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(true);
    const [data, setData] = useState<any[]>([]);
    const [count, setCount] = useState<number>(0);
    const [unitText, setUnitText] = useState<'万' | '亿'>('万');
    const [payoutPercent, setPayoutPercent] = useState<number>(0);
    const [amount, setAmount] = useState<number>(0);
    const [showGrid, setShowGrid] = useState<boolean>(false);
    useEffect(() => {
        setTimeout(() => {
            asyncFetch(null, false);
        }, 0);
    }, []);
    const asyncFetch = (orgid: string | null, containFinished: boolean) => {
        const fields = JSON.stringify([
            'count.agreementId', 'sum.amount', 'sum.planCanpaymentAmount', 'sum.paymentDetailAmount',
            'sum.paymentAllowAmount', 'sum.paymentAllowAmountAll', 'wavg.paymentDetailPercent']);
        // 已完成和已存在档的合同90,99
        const filters: any[] = [];
        if (!containFinished)
            filters.push({
                property_: 'pmAgreementState|ff80808174ec813b0174fb8fcd2a016d',
                operator: '<',
                value: '90'
            });
        if (orgid)
            filters.push({
                property_: "pmProject.pmGlobal.FOrganization|8a53b78262ea6e6d0162ea6e9ce30224",
                operator: "startwith",
                value: orgid,
            });
        const navigatefilters = filters.length ?
            JSON.stringify(
                filters
            ) : null;
        request('/api/platform/datamining/fetchdata.do',
            {
                method: 'POST',
                data: serialize({
                    moduleName: 'PmAgreement',
                    fields,
                    navigatefilters,
                })
            }).then((response) => {
                if (response[0]) {
                    const obj = response[0];
                    let unitdiv = 10000;
                    // 大于10亿，改用亿为单位
                    if (obj.jf750aa8475c524777c79f8579aac > 10000 * 10000 * 10) {
                        setUnitText('亿');
                        unitdiv = 10000 * 10000;
                    } else {
                        setUnitText('万');
                        unitdiv = 10000;
                    }
                    setCount(obj.jfcb62ecbda87a63b4bb09ffbfbfc || 0);
                    setPayoutPercent(obj.jfb56cdd7d42efdee19db4f70622a || 0);
                    setAmount((obj.jf750aa8475c524777c79f8579aac || 0) / unitdiv);
                    setData([
                        { 'type': '合同结算金额', value: obj.jf750aa8475c524777c79f8579aac || 0, group: '1' },
                        {
                            'type': '不可请款金额', value: (obj.jf750aa8475c524777c79f8579aac -
                                obj.jf95904a67172a099458c6d3e8bc5) || 0, group: '2'
                        },
                        {
                            'type': '可请款金额', value: (obj.jf95904a67172a099458c6d3e8bc5 -
                                obj.jf87b6ad783767a80662a998f7a9b) || 0, group: '2'
                        },
                        { 'type': '已支付金额', value: obj.jf87b6ad783767a80662a998f7a9b || 0, group: '2' },
                        { 'type': '可支付计划', value: obj.jf95904a67172a099458c6d3e8bc5 || 0, group: '3' },
                    ].map(rec => ({
                        ...rec,
                        value: parseFloat(numeral(rec.value / unitdiv).format('0.00')),
                    })));
                }
                setLoading(false);
            })
    };
    const refreshData = () => {
        const values = form.getFieldsValue();
        asyncFetch(values.orgid, values.containerFinished);
    }
    const config: ColumnConfig = {
        data,
        loading,
        columnWidthRatio: 0.7,
        isStack: true,
        xField: 'group',
        yField: 'value',
        seriesField: 'type',
        columnStyle,
        meta: {
            group: {
                alias: '类别',
                formatter: () => null
            },
            value: {
                alias: '金额',
                formatter: (value: number) => {
                    return numeral(value).format('0,0') + unitText;
                },
            },
        },
        tooltip: {
            title: '项目合同: ' + count + ' 个',
            formatter: (datum) => {
                return { name: datum.type, value: numeral(datum.value).format('0,0.00') + unitText };
            },
        },
        label: {
            position: 'middle',
            layout: [{ type: 'interval-adjust-position' }, { type: 'adjust-color' }],
            formatter: (data) => {
                if (!amount || !data.value || data.value <= 0 || data.value / amount < 0.08)
                    return '';
                const result = data.type + '\n' + numeral(data.value).format('0,0.00') + unitText;
                if (data.type === '已支付金额')
                    return result + '\n( ' + numeral(payoutPercent).format('0.00%') + ' )';
                return result;
            },
        },
    };
    return <Card title={<React.Fragment>项目合同金额分析图
        <ToggleTableChartButton showGrid={showGrid} setShowGrid={setShowGrid} />
    </React.Fragment>} {...cardParams}
        extra={<Form form={form} layout="inline" style={{ width: '400px', display: 'flex' }} >
            <span style={{ flex: 1 }}><FOrganizationTreeSelect callback={(value: string) => {
                refreshData();
            }} /></span>
            <Form.Item name="containerFinished" valuePropName="checked">
                <Switch checkedChildren='含已完成合同'
                    unCheckedChildren='不含已完成合同' defaultChecked={false}
                    onChange={(checked) => {
                        refreshData();
                    }}
                />
            </Form.Item>
        </Form>}>
        {showGrid ? <DataTable data={data} unitText={unitText} /> : <Column {...config} />}
    </Card>;
}

const PmAgreementCountPie: React.FC = () => {
    const [form] = Form.useForm();
    const [data, setData] = useState<any[]>([]);
    const [unitText, setUnitText] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [showGrid, setShowGrid] = useState<boolean>(false);
    const [selectTarget, setselectTarget] = useState<any>({});

    const indextypes = [{
        label: '合同个数',
        value: 'count',
        fieldname: 'jfcb62ecbda87a63b4bb09ffbfbfc',
        unitText: '个',
        unit: 1,
    }, {
        label: '合同结算金额',
        value: 'amount',
        fieldname: 'jf750aa8475c524777c79f8579aac',
        unitText: '万元',
        unit: 10000,
    }, {
        label: '合同签订金额',
        value: 'signAmount',
        fieldname: 'jf96e38d8f41fa6602a6ac0bf4777',
        unitText: '万元',
        unit: 10000,
    },]

    const grouptypes = [{
        label: '合同签订年度',
        value: 'signyear',
        groupfieldid: 'ff8080817517d40c017517d53df1009b-8a53b78262ea6e6d0162ea6e89810000',
        sortby: 'label',
    }, {
        label: '合同签订金额',
        value: 'singAmount',
        groupfieldid: 'ff8080817517d40c017517d53d83005e-8a53b78262ea6e6d0162ea6e8afc0064',
        sortby: 'label',
    }, {
        label: '管理部门',
        value: 'FOrganization',
        groupfieldid: 'pmProject.pmGlobal.FOrganization|8a53b78262ea6e6d0162ea6e9ce30224',
        sortby: 'value',
    }, {
        label: '支付平台',
        value: 'pmPayorg',
        groupfieldid: 'pmPayorg|ff80808174ec813b0174fb8f4ab800dc',
        sortby: 'value',
    }, {
        label: '成本类型',
        value: 'pmAgreementCostType',
        groupfieldid: 'pmAgreementCostType|ff80808174ec813b0174fb8fb0d00133',
        sortby: 'value',
    }, {
        label: '预算类型',
        value: 'pmagreementbudgettype',
        groupfieldid: 'pmagreementbudgettype|ff80808174ec813b0174fb8f944200f9',
        sortby: 'value',
    }, {
        label: '工程类型',
        value: 'pmAgreementClassType',
        groupfieldid: 'pmAgreementClassType|ff80808174ec813b0174fb8fa3f20116',
        sortby: 'value',
    }, {
        label: '合同状态',
        value: 'pmAgreementState',
        groupfieldid: 'pmAgreementState|ff80808174ec813b0174fb8fcd2a016d',
        sortby: 'value',
    }];
    const asyncFetch = () => {
        const fieldsValue = form.getFieldsValue();
        const grouptype: any = grouptypes.find(rec => rec.value === (fieldsValue.grouptype || grouptypes[0].value));
        const indextype: any = indextypes.find(rec => rec.value === (fieldsValue.indextype || indextypes[0].value));
        setselectTarget({
            indextype,
            grouptype,
        })
        setUnitText(indextype.unitText);
        request('/api/platform/datamining/fetchdata.do',
            {
                method: 'POST',
                data: serialize({
                    moduleName: 'PmAgreement',
                    fields: JSON.stringify(["count.agreementId", "sum.singAmount", "sum.amount"]),
                    groupfieldid: grouptype?.groupfieldid
                })
            }).then((response) => {
                const datas = (response as any[]).map(rec => ({
                    type: rec.text,
                    value: rec[indextype.fieldname] / indextype.unit,
                })).sort((a, b) => grouptype?.sortby === 'label' ?
                    (a.type > b.type ? -1 : 1) : (b.value - a.value));
                // 第10个后面全部加在一起
                if (datas.length > 10) {
                    let othersum = 0;
                    datas.forEach((rec, index) => othersum = othersum + (index >= 9 ? rec.value : 0));
                    datas.splice(9, 10000, { type: '其他小计', value: othersum });
                }
                setData(datas);
                setLoading(false);
            })
    }
    useEffect(() => {
        setTimeout(() => {
            asyncFetch();
        }, 200);
    }, []);
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
                return numeral(data.value).format('0,0') + unitText + '('
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
                    return numeral(sum).format('0,0') + unitText;
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
                return { name: data.type, value: numeral(data.value).format('0,0') + unitText }
            },
        },
    };
    return <Card title={<React.Fragment>项目合同分类分析图
        <ToggleTableChartButton showGrid={showGrid} setShowGrid={setShowGrid} />
    </React.Fragment>} {...cardParams}
        extra={<Form form={form} layout="inline" style={{ width: '400px', }}
            initialValues={{
                indextype: 'count',
                grouptype: 'signyear'
            }} >
            <Form.Item label="指标" name="indextype" style={{ flex: 1 }}>
                <Select options={indextypes}
                    onChange={asyncFetch} />
            </Form.Item>
            <Form.Item label="分组" name="grouptype" style={{ flex: 1 }}>
                <Select options={grouptypes}
                    onChange={asyncFetch} />
            </Form.Item>
        </Form>}>
        {showGrid ? <DataTable data={data}
            unitText={unitText} typeTitle={selectTarget.grouptype.label}
            valueTitle={selectTarget.indextype.label}
        /> : <Pie {...config} />}
    </Card>;
};


const PmAgreementSignYearMonthColumn: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [data, setData] = useState<any[]>([]);
    useEffect(() => {
        setTimeout(() => {
            asyncFetch();
        }, 400);
    }, []);
    const asyncFetch = () => {
        request('/api/platform/datamining/fetchdataminingdata.do',
            {
                params: {
                    schemeid: 'ff8080817586cb9101758d1387f1005c',
                    treemodel: true,
                }
            }).then((response) => {
                if (response[0] && response[0].children)
                    setData((response[0].children as any[]).map(rec => ({
                        type: rec.text ? rec.text.substr(2) : rec.text,
                        value: parseInt(numeral(rec.jf96e38d8f41fa6602a6ac0bf4777 / 10000).format('0')),
                        count: rec.jfcb62ecbda87a63b4bb09ffbfbfc
                    })).sort((a, b) => a.type > b.type ? 1 : -1).
                        filter((_, index, array) => array.length - index <= 12));           // 一年内，取最后12个
                setLoading(false);
            })
    };
    const config: DualAxesConfig = {
        loading,
        data: [data, data],
        xField: 'type',
        yField: ['value', 'count'],
        xAxis: { label: { autoRotate: false } },
        slider: {
            start: data.length > 13 ? 1 - 12 / data.length : 0,
            end: 1,
        },
        label: {
            position: 'top',
            formatter: (data) => {
                return numeral(data.value).format('0,0') + '万元';
            },
        },
        meta: {
            count: {
                alias: '合同个数',
                formatter: (value: number) => {
                    return value + '个';
                },
            },
            value: {
                alias: '合同签订金额',
                formatter: (value: number) => {
                    return numeral(value).format('0,0') + '万元';
                },
            },
        },
        geometryOptions: [
            {
                geometry: 'column',
                columnStyle,
                label: {
                    position: 'top',
                    formatter: (data) => {
                        return numeral(data.value).format('0,0') + '万元';
                    },
                },
            },
            {
                geometry: 'line',
                lineStyle: {
                    lineWidth: 2,
                },
            },
        ],
    };
    return <DualAxes {...config} />;
};
