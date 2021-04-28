import request, { API_HEAD } from '@/utils/request';
import { serialize } from 'object-to-formdata';

export interface LoginParamsType {
  usercode: string; // 用户名
  password: string; // 登录密码
  identifingcode: string; // 验证码
  invalidate?: boolean; // 是否强制登录
  mobile: string; // 手机号
  captcha: string; // 短信验证码
  type?: string; // 登录方式:account,mobile
}

/**
 *
 * 去后台验证用户名和密码是否正确
 *
 * @param params 登录参数
 */
export async function fakeAccountLogin(params: LoginParamsType) {
  return request(`${API_HEAD}/login/validate.do`, {
    method: 'POST',
    body: serialize(params),
  });
}

/**
 * 用户登出
 */
export async function fakeAccountLogout() {
  return request(`${API_HEAD}/login/logout.do`, {
    method: 'POST',
  });
}

/**
 *
 * 获取手机验证码
 *
 * @param mobile 手机号码
 */
export async function getFakeCaptcha(mobile: string) {
  return request(`${API_HEAD}/login/captcha?mobile=${mobile}`);
}
