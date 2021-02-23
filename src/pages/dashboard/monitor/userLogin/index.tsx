import React, { useEffect } from 'react';
import { Card } from 'antd';
import request from '@/utils/request';
import { serialize } from 'object-to-formdata';
import { stringifyObjectField } from '@/utils/utils';

export const UserLogin: React.FC<any> = () => {
  useEffect(() => {
    request('/api/platform/datamining/fetchdata.do', {
      method: 'POST',
      data: serialize(
        stringifyObjectField({
          moduleName: 'PmApproveProject2',
          conditions: [],

          // groupfieldid: 'pmProject.pmGlobal.FOrganization|8a53b78262ea6e6d0162ea6e9ce30224',
          // groupfieldid2: 'ff80808175697ed501756a000a0100c3-8a53b78262ea6e6d0162ea6e89810000',

          groupfieldid: {
            fieldahead: 'pmProject.pmGlobal.FOrganization',
          },
          groupfieldid2: {
            fieldname: 'actEndTime',
            function: 'yyyy年mm月',
          }, // 'ff80808175697ed501756a000a0100c3-8a53b78262ea6e6d0162ea6e89810000',

          groupfieldid3: {
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
          fields: ['count.*'],
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
