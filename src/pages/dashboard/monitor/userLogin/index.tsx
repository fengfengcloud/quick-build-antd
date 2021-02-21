import React, { useEffect } from 'react';
import { Card } from 'antd';
import request from '@/utils/request';
import { serialize } from 'object-to-formdata';

const stringify = (param: any) => {
  const result = { ...param };
  Object.keys(param).forEach((key) => {
    if (typeof param[key] === 'object') result[key] = JSON.stringify(param[key]);
  });
  return result;
};

export const UserLogin: React.FC<any> = () => {
  useEffect(() => {
    request('/api/platform/datamining/fetchdata.do', {
      method: 'POST',
      data: serialize(
        stringify({
          moduleName: 'FUserloginlog',
          conditions: [],

          groupfieldid: 'FUser.FPersonnel.FOrganization|8a53b78262ea6e6d0162ea6e9ce30224-all',
          groupfieldid1: {
            // fieldahead: 'FUser.FPersonnel.FOrganization',
            // fieldahead: 'FUser',
            fieldahead: 'FUser.FPersonnel.FOrganization',
            codelevel: '2',
            // fieldname: 'birthday',
            // function: 'yyyy年mm月',
            // fieldname: 'usertype',
            // fieldname: 'personnelid'
            // fieldname: 'userid',                 // fieldname
            // function: 'yyyy年mm月',               // id or title
          },
          fields: ['count.logid', 'sum.udfloginminute', 'avg.udfloginminute'],
          parentconditions: [],
          navigatefilters: [],
          userfilters: [],
          sqlparamstr: null,
        }),
      ),
    });
  }, []);

  return (
    <Card title="用户登录图表分析">
      <span>113344</span>
    </Card>
  );
};
