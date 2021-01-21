import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import querystring from 'querystring';
import { request } from 'umi';
import { FormFieldProps } from '../formFactory';

const { Option } = Select;
/**
 * manytoone的remote方式加载数据，
 * 用到此功能的模块必须在路由中单独写此模块的路由，不然在加载了其他模块，再加载本模块会出现hooks的错误，
 *      因为其他模块的form里没有用到这个useState
 * @param params 
 */
export const ManyToOneRemote: React.FC<FormFieldProps> = (params) => {
    const { fieldDefine, fieldProps, currRecord } = params;
    const [data, setData] = useState<any[]>([]);
    // 记录改变了，就把下拉框里的文本加进去，这样显示就会正确，然后再清除下拉框，值也能正确显示
    // 在新建记录的时候，需要把manytoone的namefield也写进去
    useEffect(() => {
        //console.log('-----------------       加入到下拉框')
        const val = currRecord[fieldDefine.manyToOneInfo.keyField];
        const tex = currRecord[fieldDefine.manyToOneInfo.nameField];
        if (val && tex) {
            if (!data.find((v) => v.value == val)) {
                setData([{ value: val, text: tex }]);
                setTimeout(() => {
                    setData([]);
                }, 0);
            }
        }
    }, [currRecord]);

    let currentValue: string | undefined;
    let timeout: any;

    const fetch = (value: string | undefined, callback: Function) => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        currentValue = value;
        function fake() {
            const str = querystring.encode({
                moduleName: fieldDefine.fieldtype,
                mainlinkage: true,
                query: value,
            });
            request(`/api/platform/dataobject/fetchcombodata.do?${str}`)
                .then((data: any) => {
                    if (currentValue === value) {
                        callback(data);
                    }
                });
        }
        timeout = setTimeout(fake, 300);
    }

    const handleSearch = (value: string) => {
        if (value && value.length >= 2) {
            fetch(value, (data: any[]) => setData(data));
        } else {
            setData([]);
        }
    };

    const options = data.map(d => <Option key={d.value} value={d.value}>{d.text}</Option>);

    return <Select {...fieldProps}
        showSearch
        allowClear
        defaultActiveFirstOption={false}
        showArrow={true}
        filterOption={false}
        onSearch={handleSearch}
        notFoundContent={null}
        getPopupContainer={triggerNode => triggerNode.parentNode}
        >
        {options}
    </Select>
}
