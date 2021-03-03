import React from 'react';
import { Tag } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

export const RECNOUNDERLINE = '__recno__';
export const DATA = 'data';
export const NAME = 'name';

export const NOIMAGE_PNG = '/api/resources/images/system/noimage.png';

export const AuditWaititng = (
  <Tag icon={<ExclamationCircleOutlined />} color="warning">
    未审核
  </Tag>
);

export const AuditFinished = (
  <Tag icon={<CheckCircleOutlined />} color="success">
    已审核
  </Tag>
);
