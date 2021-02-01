import React from 'react';
import { Tag } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';



export const Audit_Waititng = <Tag icon={<ExclamationCircleOutlined />} color="warning">未审核</Tag>;

export const Audit_Finished = <Tag icon={<CheckCircleOutlined />} color="success">已审核</Tag>;