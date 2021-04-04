import React, { Component } from 'react';
import { connect, ConnectProps, history } from 'umi';
import { Tag, message } from 'antd';
import groupBy from 'lodash/groupBy';
import moment from 'moment';
import { NoticeItem } from '@/models/global';
import { currentUser as currUser, CurrentUser } from '@/models/user';
import { ConnectState } from '@/models/connect';
import { ParentFilterModal } from '@/pages/module/data';
import { getModuleUrlFormSysMenu } from '@/layouts/BasicLayout';
import NoticeIcon from '../NoticeIcon';
import styles from './index.less';

export interface GlobalHeaderRightProps extends Partial<ConnectProps> {
  notices?: NoticeItem[];
  currentUser?: CurrentUser;
  disableActiviti?: boolean;
  fetchingNotices?: boolean;
  onNoticeVisibleChange?: (visible: boolean) => void;
  onNoticeClear?: (tabName?: string) => void;
}

let noticeDispatch: any = null;
export const refreshNotices = () => {
  noticeDispatch({
    type: 'global/fetchNotices',
  });
};

class GlobalHeaderRight extends Component<GlobalHeaderRightProps> {
  componentDidMount() {
    const { dispatch } = this.props;
    if (dispatch) {
      noticeDispatch = dispatch;
      dispatch({
        type: 'global/fetchNotices',
      });
    }
  }

  changeReadState = (clickedItem: NoticeItem): void => {
    const { id } = clickedItem;
    const { dispatch } = this.props;

    if (dispatch) {
      dispatch({
        type: 'global/changeNoticeReadState',
        payload: id,
      });
    }
  };

  handleNoticeClear = (title: string, key: string) => {
    const { dispatch } = this.props;
    message.success(`${'清空了'} ${title}`);

    if (dispatch) {
      dispatch({
        type: 'global/clearNotices',
        payload: key,
      });
    }
  };

  getNoticeData = (): {
    [key: string]: NoticeItem[];
  } => {
    const { notices = [] } = this.props;

    if (!notices || notices.length === 0 || !Array.isArray(notices)) {
      return {};
    }

    const newNotices = notices.map((notice) => {
      const newNotice = { ...notice };

      if (newNotice.datetime) {
        newNotice.datetime = moment(notice.datetime as string).fromNow();
      }

      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }

      if (newNotice.extra && newNotice.status) {
        const color = {
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        }[newNotice.status];
        newNotice.extra = (
          <Tag
            color={color}
            style={{
              marginRight: 0,
            }}
          >
            {newNotice.extra}
          </Tag>
        );
      }

      return newNotice;
    });
    return groupBy(newNotices, 'type');
  };

  getUnreadData = (noticeData: { [key: string]: NoticeItem[] }) => {
    const unreadMsg: {
      [key: string]: number;
    } = {};
    Object.keys(noticeData).forEach((key) => {
      const value = noticeData[key];

      if (!unreadMsg[key]) {
        unreadMsg[key] = 0;
      }

      if (Array.isArray(value)) {
        unreadMsg[key] = value.filter((item) => !item.read).length;
      }
    });
    return unreadMsg;
  };

  // 打开我可以审批的模块，加入条件限定
  pushApprove = (item: NoticeItem) => {
    const { moduleName = '' } = item;
    const parentFilter: ParentFilterModal = {
      moduleName,
      fieldahead: null,
      fieldName: 'actAssignee',
      fieldtitle: '我可以审批的记录',
      operator: '=',
      fieldvalue: currUser.userid || '',
      text: '',
    };
    this.pushModuleWithParentFilter(moduleName, parentFilter);
  };

  //  // 打开我可以接受的模块，加入条件限定
  pushClaim = (item: NoticeItem) => {
    const { moduleName = '' } = item;
    const parentFilter: ParentFilterModal = {
      moduleName,
      fieldahead: null,
      fieldName: 'actCandidate',
      fieldtitle: '我可以接受任务的记录',
      operator: 'like',
      fieldvalue: currUser.userid || '',
      text: '',
    };
    this.pushModuleWithParentFilter(moduleName, parentFilter);
  };

  // 打开我可以审核的模块，加入条件限定
  pushAudit = (item: NoticeItem) => {
    const { moduleName = '' } = item;
    const parentFilter: ParentFilterModal = {
      moduleName,
      fieldahead: null,
      fieldName: 'canAuditingUserid',
      fieldtitle: '我可以审核的记录',
      operator: '=',
      fieldvalue: currUser.userid || '',
      text: '',
    };
    this.pushModuleWithParentFilter(moduleName, parentFilter);
  };

  pushQuestionModule = (item: NoticeItem) => {
    const { moduleName = '' } = item;
    const parentFilter: ParentFilterModal = {
      moduleName,
      fieldahead: null,
      fieldName: item.filterFieldName || '',
      fieldtitle: item.filterText || '',
      operator: item.filterFieldOperator || '',
      fieldvalue: item.filterFieldValue || '',
      text: '',
    };
    this.pushModuleWithParentFilter(moduleName, parentFilter);
  };

  // 打开一个模块加上限定条件
  pushModuleWithParentFilter = (moduleName: string, pf: ParentFilterModal) => {
    const parentFilterParam = encodeURIComponent(JSON.stringify(pf));
    const pathname = getModuleUrlFormSysMenu(moduleName);
    history.push({
      pathname,
      state: {
        parentFilter: parentFilterParam,
      },
    });
  };

  render() {
    const {
      currentUser: user,
      fetchingNotices,
      onNoticeVisibleChange,
      disableActiviti,
    } = this.props;
    const noticeData = this.getNoticeData();
    const unreadMsg = this.getUnreadData(noticeData);
    return (
      <NoticeIcon
        className={styles.action}
        count={user && user.unreadCount}
        onItemClick={(item_) => {
          const item = item_ as NoticeItem;
          if (item.type === 'event') {
            if (item.action === 'approve') this.pushApprove(item);
            else if (item.action === 'claim') this.pushClaim(item);
            else if (item.action === 'audit') this.pushAudit(item);
          } else if (item.type === 'question') {
            this.pushQuestionModule(item);
          }
          // this.changeReadState(item);
        }}
        loading={fetchingNotices}
        clearText="清空"
        refreshText="刷新"
        onRefresh={refreshNotices}
        viewMoreText="查看更多"
        onClear={this.handleNoticeClear}
        onPopupVisibleChange={onNoticeVisibleChange}
        onViewMore={(props) => {
          message.info(`没有更多的${props.title}事项了！`);
        }}
        clearClose
      >
        <NoticeIcon.Tab
          hidden={!!disableActiviti}
          tabKey="event"
          title="待审"
          emptyText="您已完成所有审核审批事项"
          list={noticeData.event}
          showViewMore
        />
        <NoticeIcon.Tab
          tabKey="question"
          list={noticeData.question}
          title="待办"
          emptyText="您已处理所有待办事项"
          showViewMore
        />
        <NoticeIcon.Tab
          tabKey="message"
          count={unreadMsg.message}
          list={noticeData.message}
          title="通知"
          emptyText="您已读完所有通知消息"
          showViewMore
        />
      </NoticeIcon>
    );
  }
}

export default connect(({ user, global, loading, systemInfo }: ConnectState) => ({
  currentUser: user.currentUser,
  collapsed: global.collapsed,
  disableActiviti: systemInfo.systemInfo?.systeminfo.disableActiviti,
  fetchingMoreNotices: loading.effects['global/fetchMoreNotices'],
  fetchingNotices: loading.effects['global/fetchNotices'],
  notices: global.notices,
}))(GlobalHeaderRight);
