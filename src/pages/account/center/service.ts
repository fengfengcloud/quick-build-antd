import request from '@/utils/request';

/**
 * 取得当前用户的信息
 */
export async function queryCurrent() {
  return request('/api/platform/systemframe/currentuser.do');
}

/**
 * 给当前用户增加一个自定义标签
 * @param params 
 */
export async function addTag(params: { label: string }) {
  return request('/api/platform/userfavourite/addtag.do', {
    params,
  });
}

/**
 * 删除当前用户的一个自定义标签
 * @param params 
 */
export async function removeTag(params: { label: string }) {
  return request('/api/platform/userfavourite/removetag.do', {
    params,
  });
}

/**
 * 更新当前用户的签名
 * @param params 
 */
export async function updateSignature(params: { text: string }) {
  return request('/api/platform/userfavourite/updatesignature.do', {
    params,
  });
}
