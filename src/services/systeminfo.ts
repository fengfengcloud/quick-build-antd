import request, { API_HEAD, syncRequest } from '@/utils/request';

/**
 * 取得系统信息
 */
export async function query(): Promise<any> {
  return request(`${API_HEAD}/login/getsysteminfo.do`);
}

/**
 * 取得系统菜单
 */
export function getSystemMenu(): any {
  return syncRequest(`${API_HEAD}/platform/systemframe/getmenutree.do`, {
    type: 'GET',
    params: {},
  });
}
