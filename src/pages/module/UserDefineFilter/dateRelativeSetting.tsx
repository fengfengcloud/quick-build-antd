import React, { useState } from 'react';
import { Popover, Button, Form, InputNumber, Checkbox, Row, Col, Space, Alert } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { TextValue } from '../data';


export const DateRelativeSetting = ({ sectionText, onChange, relativeSetVisible, setRelativeSetVisible }:
    { sectionText: string, onChange: Function, relativeSetVisible: boolean, setRelativeSetVisible: Function }) => {
    const [hasStart, setHasStart] = useState(true);
    const [hasEnd, setHasEnd] = useState(true);
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(0);
    const getSetForm = () => {
        return <Form style={{ padding: 8 }} >
            <Row gutter={16}>
                <Col>
                    <Form.Item  >
                        <Checkbox checked={hasStart} onChange={(e: CheckboxChangeEvent) => {
                            const checked = e.target.checked;
                            setHasStart(checked);
                            if (!checked && !hasEnd)
                                setHasEnd(true);
                        }} />
                    </Form.Item>
                </Col>
                <Col>
                    <Form.Item label={'相对起始' + sectionText}>
                        <InputNumber disabled={!hasStart} value={start}
                            onChange={(v: any) => {
                                setStart(v);
                                if (end < v) setEnd(v);
                            }} />
                    </Form.Item></Col>
            </Row>
            <Row gutter={16}>
                <Col>
                    <Form.Item>
                        <Checkbox checked={hasEnd} onChange={(e: CheckboxChangeEvent) => {
                            const checked = e.target.checked;
                            setHasEnd(checked);
                            if (!checked && !hasStart)
                                setHasStart(true);
                        }} />
                    </Form.Item>
                </Col>
                <Col>
                    <Form.Item label={'相对终止' + sectionText} >
                        <InputNumber disabled={!hasEnd} value={end}
                            onChange={(v: any) => {
                                setEnd(v);
                                if (start > v) setStart(v);
                            }} />
                    </Form.Item>
                </Col>
            </Row>
            <span style={{ display: 'flex', marginBottom: '16px' }} >
                <span style={{ flex: 1 }}></span>
                <Space>
                    {/* <Button onClick={() => {
                        onChange({ text: undefined, value: undefined });
                        setVisible(false);
                    }}>
                        清除
                </Button> */}
                    <Button type="primary" onClick={() => {
                        onChange(getValueText());
                        setRelativeSetVisible(false);
                    }}>
                        确定
                </Button>
                </Space>
            </span>
            <Alert message={getValueText().text} type="success" />
            {/* <div>{getValueText().value}</div> */}
            <div style={{ color: 'green', marginTop: '10px' }} >
                说明：0表示当前{sectionText}，-1表示前一{sectionText}，
                <br />　　　1表示后1{sectionText},依次类推。
                <br />　　　可以只选择起始{sectionText}或者终止{sectionText}。
                <br />例如：相对起始{sectionText}为-3，终止{sectionText}为2，
                <br />　　　表示从前3{sectionText}到后2{sectionText}加上本{sectionText}
                <br />　　　一共6个{sectionText}。
            </div>
        </Form>
    }

    const getValueText = (): TextValue => {
        const result: TextValue = {
            value: undefined,
            text: undefined,
        };
        const title = sectionText;
        if (!hasStart || !hasEnd) {
            if (hasStart) { // end 不可用
                result.value = start + '--';
                result.text = '从' + getRelativeText(start, title) + '起';
            } else {
                result.value = '--' + end;
                result.text = '至' + getRelativeText(end, title) + '止';
            }
        } else {
            if (start == end) {
                result.text = getRelativeText(start, title);
                result.value = start + '--' + end;
            } else {
                result.value = start + '--' + end;
                result.text = '从' + getRelativeText(start, title) + '至' + getRelativeText(end, title);
            }
        }
        return result;
    }

    // const [visible, setVisible] = useState(false);

    return <Popover content={getSetForm()} title='设置相对区间' 
    visible={relativeSetVisible} trigger='click'
    placement="bottomRight"
        onVisibleChange={(visible) => setRelativeSetVisible(visible)}>
        <span style={{visibility:'hidden',height:'16px', width:'0px'}}></span>
    </Popover>


}

const getRelativeText = (number: number, text: string) => {
    if (!number) return '当' + text;
    else if (number > 0) return '后' + number + text;
    else return '前' + Math.abs(number) + text;
}