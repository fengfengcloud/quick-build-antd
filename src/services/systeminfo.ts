import request, { syncRequest } from '@/utils/request';

/**
 * 取得系统信息
 */
export async function query(): Promise<any> {
  return request('/api/login/getsysteminfo.do');
}

/**
 * 取得系统菜单
 */
export function getSystemMenu(): any {
  return syncRequest(`/api/platform/systemframe/getmenutree.do`,{type:'GET',params :{}});
}