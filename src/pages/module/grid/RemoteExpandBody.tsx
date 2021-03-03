import React, { useEffect, useState } from 'react';
import request from '@/utils/request';
import { Card } from 'antd';
import marked from 'marked';
import { ModuleModal } from '../data';
import styles from './RemoteExpandBody.less';

interface ExpandBodyParams {
  moduleInfo: ModuleModal;
  record: any;
}

export const RemoteExpandBody: React.FC<ExpandBodyParams> = ({ moduleInfo, record }) => {
  const { modulename: moduleName, primarykey } = moduleInfo;
  const [data, setData] = useState<string>('loading');
  useEffect(() => {
    request('/api/platform/dataobject/getexpandbody.do', {
      params: {
        moduleName,
        recordId: record[primarykey],
      },
    }).then((result) => {
      setData(result.msg || '暂无内容');
    });
  }, []);
  /* eslint-disable */
  // 使用markdown语法来显示
  return (
    <Card bodyStyle={{ padding: 0, margin: 0 }}>
      <span className={styles._} dangerouslySetInnerHTML={{ __html: marked(data) }} />
    </Card>
  );
  /* eslint-enable */
};
