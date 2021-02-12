import request from '@/utils/request';
import { serialize } from 'object-to-formdata';
/**
 * 根据传入的人员id,生成该人员的用户
 * @param params
 */
export async function queryCreatePersonnelUser(params: any) {
  return request(`/api/platform/systemframe/createpersonnaluser.do`, {
    method: 'POST',
    params,
  });
}

/**
 * 重置用户密码
 * @param params
 */
export async function queryResetUserPassword(params: any) {
  return request(`/api/platform/systemframe/resetpassword.do`, {
    method: 'POST',
    params,
  });
}

/**
 * 读取用户的所有操作权限,是所有权限和角色的并集
 * @param params
 */
export async function queryUserAllLimits({ userid }: { userid: string }) {
  return request('/api/platform/userrole/getuseralllimit.do', {
    params: {
      userid,
    },
  });
}

/**
 * 读取用户的所有操作权限，按照树形结构，选中的都有checked的标记
 * @param param0
 */
export async function queryUserLimits({ userid }: { userid: string }) {
  return request('/api/platform/userrole/getuserlimit.do', {
    params: {
      userid,
      addall: true,
    },
  });
}

/**
 * 保存用户所有选中的操作权限
 * @param param0
 */
export async function saveUserLimits(params: any) {
  return request('/api/platform/userrole/saveuserlimit.do', {
    method: 'POST',
    body: serialize(params),
  });
}

/**
 * 读取系统操作角色的所有操作权限，按照树形结构，选中的都有checked的标记
 * @param param0
 */
export async function queryRoleLimits({ roleid }: { roleid: string }) {
  return request('/api/platform/userrole/getrolelimit.do', {
    params: {
      roleid,
    },
  });
}

/**
 * 保存系统操作角色所有选中的操作权限
 * @param param0
 */
export async function saveRoleLimits(params: any) {
  return request('/api/platform/userrole/saverolelimit.do', {
    method: 'POST',
    body: serialize(params),
  });
}
