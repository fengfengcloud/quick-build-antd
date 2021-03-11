import React from 'react';
import { Card, Form, Radio, Switch } from 'antd';
import { DefaultSettings as SettingModelState } from '../../../../../config/defaultSettings';

interface FavoriteViewProps {
  dispatch: Function;
  settings: SettingModelState;
}

const FavoriteView: React.FC<FavoriteViewProps> = ({ dispatch, settings }) => {
  const [form] = Form.useForm();
  const dispatchChange = (key: string, value: string) => {
    localStorage.setItem(`settings-${key}`, value);
    dispatch({
      type: 'settings/changeSetting',
      payload: {
        [key]: value,
      },
    });
  };
  return (
    <Card title="偏好设置" bordered={false}>
      <Form form={form} labelCol={{ flex: '0 0 120px' }}>
        <Form.Item label="整体风格设置">
          <Radio.Group
            value={settings.navTheme}
            onChange={(e) => {
              dispatchChange('navTheme', e.target.value);
            }}
          >
            <Radio value="light">亮色菜单</Radio>
            <Radio value="dark">暗色菜单</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="导航模式">
          <Radio.Group
            value={settings.layout}
            onChange={(e) => {
              dispatchChange('layout', e.target.value);
            }}
          >
            <Radio value="side">侧边菜单</Radio>
            <Radio value="top">顶部菜单</Radio>
            <Radio value="mix">混合菜单</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="内容区域宽度">
          <Radio.Group
            value={settings.contentWidth}
            onChange={(e) => {
              dispatchChange('contentWidth', e.target.value);
            }}
          >
            <Radio value="Fluid">流式</Radio>
            <Radio value="Fixed">定宽</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="固定 Header">
          <Switch
            checked={settings.fixedHeader}
            onChange={(value) => {
              dispatchChange('fixedHeader', value ? 'true' : 'false');
            }}
          />
        </Form.Item>
        <Form.Item label="固定侧边菜单">
          <Switch
            checked={settings.fixSiderbar}
            onChange={(value) => {
              dispatchChange('fixSiderbar', value ? 'true' : 'false');
            }}
          />
        </Form.Item>
      </Form>
    </Card>
  );
};

export default FavoriteView;
