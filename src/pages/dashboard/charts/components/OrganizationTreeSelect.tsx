import React from 'react';
import { Form, TreeSelect } from 'antd';
import { TextValue } from '@/pages/module/data';
import { getModulTreeDataSource } from '@/pages/module/modules';

interface FOrganizationTreeSelect {
    title?: string;
    callback?: Function;
}

const { SHOW_PARENT } = TreeSelect;
/**
 * 组织机构或部门的树形选择，选择单个部门，使用startwith来做为判断条件
 * @param param0 
 */
const FOrganizationTreeSelect: React.FC<FOrganizationTreeSelect> = ({ title, callback }): any => {
    const dictData: TextValue[] = getModulTreeDataSource('FOrganization', true, false);
    const arrageTreeNode = (array: any): TextValue[] => {
        return array.map((rec: TextValue) => ({
            value: rec.value || '',
            label: rec.text,
            key: rec.value,
            children: rec.children && rec.children.length > 0 ? arrageTreeNode(rec.children) : null
        }));
    };

    const options = arrageTreeNode(dictData);
    return <Form.Item label={title || '部门'} name="orgid" >
        <TreeSelect style={{ flex: 1 }} allowClear
            //showCheckedStrategy={SHOW_PARENT} 
            showSearch
            treeNodeFilterProp="label"
            treeData={options}
            //treeCheckable={true} 
            treeDefaultExpandAll={true}
            onChange={(value) => callback && callback(value)}
        >
        </TreeSelect>
    </Form.Item>
}

export default FOrganizationTreeSelect;