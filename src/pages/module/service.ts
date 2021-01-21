import request, { syncRequest } from '@/utils/request';
import { applyIf, apply } from '@/utils/utils';
import { ModuleState } from './data';
import { FetchObjectResponse } from './data';
import { getAllFilterAjaxParam } from './grid/filterUtils';
import { getModuleInfo } from './modules';
import { generateTreeParent } from './moduleUtils';
import { serialize } from 'object-to-formdata';

// 'GET /api/get_module_info?moduleid=personnel'
export async function queryModuleInfo(params: any) {
  return request(`/api/platform/module/getmoduleinfo.do`, {
    method: 'POST',
    body: serialize(params),
  })
}


// 'GET /api/get_module_info?moduleid=personnel'
export function querySyncModuleInfo(moduleName: string): object {
  return syncRequest(`/api/platform/module/getmoduleinfo.do`, {
    type: 'POST',
    params: { moduleName },
  })
}

export async function fetchObjectDataWithState(moduleState: ModuleState) {
  return new Promise(function (resolve, reject) {
    const { moduleName, gridParams, sorts, sortschemeid } = moduleState;
    const moduleInfo = getModuleInfo(moduleName);
    const { istreemodel, primarykey } = moduleInfo;
    const payload: any = { moduleName };
    payload.page = gridParams.curpage;
    payload.limit = gridParams.limit;
    payload.start = gridParams.start;
    if (sortschemeid)
      payload.sortschemeid = sortschemeid;
    apply(payload, getAllFilterAjaxParam(moduleState.filters));

    if (sorts.length) {
      payload.sort = JSON.stringify(sorts);
    }
    if (istreemodel) {
      // 如果是树形的模块
      fetchObjectTreeData(payload).then((response: any) => {
        const { children } = response;
        const result: FetchObjectResponse = {
          start: 0,
          limit: 20,
          total: 0,
          curpage: 1,
          totalpage: 1,
          data: generateTreeParent(children),
          spendtime: 0,
          // 树形数据默认展开第一级
          expandedRowKeys: children && children.length ?
            children.map((record: any): string => record[primarykey]) : [],
        };
        resolve(result);
      })
    } else {
      fetchObjectData(payload).then((response: FetchObjectResponse) => {
        if (!response.data) response.data = [];
        resolve(response);
      })
    };
  })
}

export async function fetchObjectData(params: any) {
  params.start = (params.page - 1) * params.limit;
  return request(`/api/platform/dataobject/fetchdata.do?_dc=` + new Date().getTime(), {
    method: 'POST',
    body: serialize(params),
  })
}

export function fetchObjectDataSync(params: any) {
  params.start = (params.page - 1) * params.limit;
  return syncRequest(`/api/platform/dataobject/fetchdata.do?_dc=` + new Date().getTime(), {
    type: 'POST',
    params,
  })
}

export async function fetchObjectTreeData(params: any) {
  params.start = (params.page - 1) * params.limit;
  return request(`/api/platform/dataobject/fetchtreedata.do?_dc=` + new Date().getTime(), {
    method: 'POST',
    body: serialize(params),
  })
}

/**
 * 同步取得模块的一条记录
 * @param params 
 * objectname:
 * id:
 */
export function fetchObjectRecordSync(params: any) {
  return syncRequest(`/api/platform/dataobject/fetchinfo.do?_dc=` + new Date().getTime(), {
    type: 'POST',
    params: params,
  })
}

/**
 * 异步取得模块的一条记录
 * @param params 
 * objectname:
 * id:
 */
export async function fetchObjectRecord(params: any) {
  return new Promise(function (resolve, reject) {
    request(`/api/platform/dataobject/fetchinfo.do?_dc=` + new Date().getTime(), {
      method: 'POST',
      body: serialize(params),
    }).then(response => {
      resolve(response);
    })
  })
}

//////////////////////////
// 新建或修改一条记录，这个在提交的时候是 request_payload 方式，在windows nginx转发的时候会中文乱码
//////////////////////////
export async function saveOrUpdateRecord_request_payload_(params: any) {
  return new Promise(function (resolve, reject) {
    request('/api/platform/dataobject/saveorupdate.do', {
      params: {
        objectname: params.moduleName,
        opertype: params.opertype === 'insert' ? 'new' : params.opertype,
      },
      data: params.data,
      method: 'POST',
    }).then(response => {
      resolve(response);
    })
  })
}

// 新建一条记录或者修改记录，这个是用的 form data 方式，不会乱码，
// 看这个网址 https://segmentfault.com/a/1190000018774494
// 
export async function saveOrUpdateRecord(params: any) {
  return new Promise(function (resolve, reject) {
    request('/api/platform/dataobject/saveorupdatedata.do', {
      params: {
        objectname: params.moduleName,
        opertype: params.opertype === 'insert' ? 'new' : params.opertype,
      },
      // serialize 生成 formdata
      data: serialize({ data: JSON.stringify(params.data) }),
      method: 'POST',
    }).then(response => {
      resolve(response);
    })
  })
}

// 删除模块的一条记录
export async function deleteModuleRecord(params: any) {
  return request('/api/platform/dataobject/remove.do', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    params: {
      objectname: params.moduleName,
    },
    data: {
      recordId: params.recordId
    },
  });
}

// 删除模块的多条记录
// params : {
//   moduleName : grid.moduleInfo.fDataobject.objectname,
//   ids : grid.getSelectionIds().join(","),
//   titles : grid.getSelectionTitleTpl().join("~~")
// },
export async function deleteModuleRecords(params: any) {
  return request('/api/platform/dataobject/removerecords.do', {
    params
  })
}

/**
 * 获取模块作为combodata的数据
 * @param params 
 * moduleName: moduleName
 */
export function fetchObjectComboData(params: any) {
  return syncRequest(`/api/platform/dataobject/fetchcombodata.do`, {
    params: params,
  })
}


/**
 * 获取模块作为treedata的数据
 * @param params 
 * moduleName: moduleName
 */
export function fetchObjectComboTreeData(params: any) {
  return syncRequest(`/api/platform/dataobject/fetchpickertreedata.do`, {
    params: params,
  })
}

/**
 * 模块字段根据选择路径生成的树，非叶节点全部不可以选择，只能选择叶节点
 * @param params 
 * moduleName: moduleName
 */
export function fetchObjectComboTreePathData(params: any) {
  return syncRequest(`/api/platform/dataobject/fetchtreeselectpathdata.do`, {
    params: params,
  })
}


/**
 * 下载grid表单的excel或pdf文件
 * @param params 
 *          moduleName: moduleName,
            columns: JSON.stringify(getCurrentExportGridColumnDefine(moduleName)),
            page: 1,
            start: 0,
            limit: 1000000,
            conditions: JSON.stringify([]),
            colorless: false,
            usemonetary: false,
            monetaryUnit: 10000,
            monetaryText: '万',
            sumless: false,
            unitalone: false,
            pagesize: 'pageautofit',
            autofitwidth: true,
            scale: 100,
 */
export async function downloadGridExcel(params: any) {
  const children: Node[] = [];
  for (let i in params) {
    const node = window.document.createElement("input");
    node.type = 'hidden';
    node.name = i;
    node.value = typeof params[i] === 'string' ? params[i].replace(new RegExp('"', 'gm'), "'") : params[i];
    children.push(node)
  }
  const form = window.document.createElement("form");
  form.method = 'post';
  form.action = '/api/platform/dataobjectexport/exporttoexcel.do';
  children.forEach(child => form.appendChild(child));
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);

}

/**
 * 下载一个记录的方案导出方案
 * @param params 
 */
export async function downloadRecordExcel(params: any) {
  const children: Node[] = [];
  for (let i in params) {
    let node = window.document.createElement("input");
    node.type = 'hidden';
    node.name = i;
    node.value = typeof params[i] === 'string' ? params[i].replace(new RegExp('"', 'gm'), "'") : params[i];
    children.push(node)
  }
  const form = window.document.createElement("form");
  form.method = 'post';
  form.action = '/api/platform/dataobjectexport/exportexcelscheme.do';
  children.forEach(child => form.appendChild(child));
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

/**
 * 读取一个导航方案中的数据
 */
export async function fetchNavigateTreeData(params: any) {
  applyIf(params, {
    reverseOrder: 0,
    parentFilter: null,
  });
  return request('/api/platform/navigatetree/fetchnavigatedata.do', {
    params,
  });
}

/**
 * 读取一个导航方案中的数据(同步)
 */
export function fetchNavigateTreeDataSync(params: any): any {
  applyIf(params, {
    reverseOrder: 0,
    parentFilter: null,
  });
  return syncRequest('/api/platform/navigatetree/fetchnavigatedata.do', {
    params
  })
}

// 'GET /api/get_module_info?moduleid=personnel'
export async function fetchChildModuleData(params: any) {
  return request(`/api/platform/dataobject/fetchchilddata.do`, {
    method: 'POST',
    body: serialize(params),
  })
}

// 新建记录时取得缺省值
export async function getAjaxNewDefault(params: any) {
  return request(`/api/platform/dataobject/getnewdefault.do`, {
    method: 'POST',
    body: serialize(params),
  })
}

