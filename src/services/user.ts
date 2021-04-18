import request from '@/utils/request';

/**
 * 取得当前登录的用户信息和系统信息
 */
export async function queryCurrent(): Promise<any> {
  return request('/api/login/getuserbean.do');
}

export async function queryNotices(): Promise<any> {
  // return request('/api/notices');
  return request('/api/platform/systemframe/getapprovequestioninfo.do');
}

export async function notificationRead(notificationId: string): Promise<any> {
  return request('/api/platform/systemframe/notificationread.do', {
    params: {
      notificationId,
    },
  });
}

export async function notificationRemove(notificationId: string): Promise<any> {
  return request('/api/platform/systemframe/notificationremove.do', {
    params: {
      notificationId,
    },
  });
}

export async function notificationClear(): Promise<any> {
  return request('/api/platform/systemframe/notificationclear.do');
}
