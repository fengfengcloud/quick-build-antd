import request from '@/utils/request';
import { message } from 'antd';
import { ActionParamsModal } from '../systemAction';

/**
 * 更新设备的状态
 *
 * @param params
 */
export const deviceCheckOnline = (params: ActionParamsModal) => {
  const { dispatch } = params;
  request('/api/abcgate/device/checkonline.do', {}).then((response) => {
    if (response.success) {
      dispatch({
        type: 'modules/fetchData',
        payload: {
          moduleName: 'AbcDevice',
          forceUpdate: true,
        },
      });
      message.info(response.msg);
    } else {
      message.error(response.msg);
    }
  });
};
