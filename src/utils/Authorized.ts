import RenderAuthorize from '@/components/Authorized';
import { currentUser } from 'umi';
import { getAuthority } from './authority';
/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable import/no-mutable-exports */
let Authorized = RenderAuthorize(getAuthority());

// Reload the rights component
const reloadAuthorized = (): void => {
  Authorized = RenderAuthorize(getAuthority());
};

/**
 * hard code
 * block need it。
 */
window.reloadAuthorized = reloadAuthorized;

export { reloadAuthorized };
export default Authorized;

export const isAdmin = () => {
  return currentUser.usercode === 'admin';
}

export const isAdministrator = () => {
  return currentUser.usercode === 'administrator';
}