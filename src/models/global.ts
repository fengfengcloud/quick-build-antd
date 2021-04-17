import { Subscription, Reducer, Effect } from 'umi';

import { NoticeIconData } from '@/components/NoticeIcon';
import { notificationRead, notificationClear, queryNotices } from '@/services/user';
import { ConnectState } from './connect.d';

export interface NoticeItem extends NoticeIconData {
  id: string;
  type: string;
  status: string;
}

export interface GlobalModelState {
  collapsed: boolean;
  notices: NoticeItem[];
}

export interface GlobalModelType {
  namespace: 'global';
  state: GlobalModelState;
  effects: {
    fetchNotices: Effect;
    clearNotices: Effect;
    changeNoticeReadState: Effect;
  };
  reducers: {
    changeLayoutCollapsed: Reducer<GlobalModelState>;
    saveNotices: Reducer<GlobalModelState>;
    saveClearedNotices: Reducer<GlobalModelState>;
  };
  subscriptions: { setup: Subscription };
}

const GlobalModel: GlobalModelType = {
  namespace: 'global',

  state: {
    collapsed: false,
    notices: [],
  },

  effects: {
    *fetchNotices(_, { call, put }) {
      const data = yield call(queryNotices);
      let count = 0;
      let unreadCount: number = 0;
      data.forEach((record: NoticeItem) => {
        const rec = record;
        if (rec.type === 'event') {
          count += rec.count || 0;
          rec.status = 'urgent';
          if (rec.maxhours) {
            if (rec.maxhours >= 48) rec.extra = `最长已等待${Math.floor(rec.maxhours / 24)}天`;
            else rec.extra = `最长已等待${rec.maxhours}小时`;
          }
          if (rec.action === 'approve') {
            rec.description = `有 ${rec.data?.length} 个任务等待审批`;
          } else if (rec.action === 'claim') {
            rec.description = `有 ${rec.data?.length} 个任务等待接受`;
          } else if (rec.action === 'audit') {
            rec.description = `有 ${rec.count} 条记录等待审核`;
          }
        } else if (rec.type === 'notification') {
          // 每一个通知消息，被阅读取就不计数了
          count += !rec.read ? 1 : 0;
          unreadCount += !rec.read ? 1 : 0;
        }
      });
      yield put({
        type: 'saveNotices',
        payload: data,
      });
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: count,
          unreadCount,
        },
      });
    },

    *clearNotices({ payload }, { put, select }) {
      yield put({
        type: 'saveClearedNotices',
        payload,
      });
      let count: number = 0;
      const notices: NoticeItem[] = yield select((state: ConnectState) => state.global.notices);
      notices.forEach((rec) => {
        if (rec.type === 'event') {
          count += rec.count || 0;
        }
      });
      yield notificationClear();
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: count,
          unreadCount: 0,
        },
      });
    },

    *changeNoticeReadState({ payload }, { put, select }) {
      const notices: NoticeItem[] = yield select((state: ConnectState) =>
        state.global.notices.map((item) => {
          const notice = { ...item };
          if (notice.id === payload) {
            notice.read = true;
          }
          return notice;
        }),
      );
      yield put({
        type: 'saveNotices',
        payload: notices,
      });
      let count: number = 0;
      let unreadCount: number = 0;
      notices.forEach((rec) => {
        if (rec.type === 'event') {
          count += rec.count || 0;
        } else if (rec.type === 'notification') {
          count += !rec.read ? 1 : 0;
          unreadCount += !rec.read ? 1 : 0;
        }
      });
      yield notificationRead(payload);
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: count,
          unreadCount,
        },
      });
    },
  },

  reducers: {
    changeLayoutCollapsed(state = { notices: [], collapsed: true }, { payload }): GlobalModelState {
      return {
        ...state,
        collapsed: payload,
      };
    },
    saveNotices(state, { payload }): GlobalModelState {
      return {
        collapsed: false,
        ...state,
        notices: payload,
      };
    },
    saveClearedNotices(state = { notices: [], collapsed: false }, { payload }): GlobalModelState {
      return {
        ...state,
        notices: state.notices.filter((item): boolean => item.type !== payload),
      };
    },
  },

  subscriptions: {
    setup({ history }): void {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      history.listen(({ pathname, search }): void => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
  },
};

export default GlobalModel;
