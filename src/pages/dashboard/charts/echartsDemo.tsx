import React, { useEffect } from 'react';
import * as echarts from 'echarts';
import { message } from 'antd';

export const EchartsDemo = ({ id }: { id: string }) => {
    message.warn("drow");

    let option: any;
    let myChart: any;

    option = {
        width: '100%',
        tooltip: {
            trigger: 'item'
        },
        legend: {
            top: '0',
            left: 'center'
        },

        series: [
            {
                name: '访问来源',
                type: 'pie',
                radius: ['40%', '70%'],
                top: '15%',
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 5,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    alignTo: 'edge',
                    formatter: '{name|{b}}\n{time|{c} 小时 {d}%}',
                    minMargin: 5,
                    edgeDistance: 10,
                    lineHeight: 15,
                    rich: {
                        time: {
                            fontSize: 10,
                            color: '#999'
                        }
                    }
                },
                labelLine: {
                    length: 15,
                    length2: 0,
                    maxSurfaceAngle: 80
                },
                labelLayout: (params: any) => {
                    let isLeft = params.labelRect.x < myChart.getWidth() / 2;
                    let points = params.labelLinePoints;
                    // Update the end point.
                    points[2][0] = isLeft
                        ? params.labelRect.x
                        : params.labelRect.x + params.labelRect.width;
                    return {
                        labelLinePoints: points
                    };
                },
                data: [
                    { value: 150, name: '搜索引擎' },
                    { value: 50, name: '直接访问' },
                    { value: 60, name: '邮件营销' },
                    { value: 70, name: '联盟广告' },
                    { value: 300, name: '视频广告' },
                    { value: 1048, name: '搜索引擎11' },
                    { value: 735, name: '直接访问22' },
                    { value: 580, name: '邮件营销33' },
                    { value: 484, name: '联盟广告44' },
                    { value: 300, name: '视频广告55' }
                ]
            }
        ]
    };

    useEffect(() => {
        window.addEventListener("resize", () => {
            myChart.resize();
        });
        let chartDom: any = document.getElementById(id);
        myChart = echarts.init(chartDom);
        option && myChart.setOption(option);
        return () => {
            window.removeEventListener("resize", myChart.resize());
        }
    }, [])


    return <div id={id} style={{ height: '430px' }}></div>
}