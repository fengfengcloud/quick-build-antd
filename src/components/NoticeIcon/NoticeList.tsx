import { Avatar, List, Spin } from 'antd';

import React from 'react';
import classNames from 'classnames';
import {
  CarryOutFilled,
  CloseCircleFilled,
  InfoCircleFilled,
  QuestionCircleFilled,
  WarningFilled,
} from '@ant-design/icons';
import { NoticeIconData } from './index';
import styles from './NoticeList.less';

export interface NoticeIconTabProps {
  hidden?: boolean;
  loading?: boolean;
  count?: number;
  name?: string;
  showClear?: boolean;
  showViewMore?: boolean;
  showRefresh?: boolean;
  style?: React.CSSProperties;
  title: string;
  tabKey: string;
  data?: NoticeIconData[];
  onClick?: (item: NoticeIconData) => void;
  onClear?: () => void;
  onRefresh?: () => void;
  emptyText?: string;
  clearText?: string;
  refreshText?: string;
  viewMoreText?: string;
  list: NoticeIconData[];
  onViewMore?: (e: any) => void;
}
const NoticeList: React.SFC<NoticeIconTabProps> = ({
  data = [],
  onClick,
  // onClear,
  onRefresh,
  refreshText,
  showRefresh = true,
  title,
  onViewMore,
  emptyText,
  // showClear = true,
  // clearText,
  viewMoreText,
  showViewMore = false,
  loading,
}) => {
  if (!data || data.length === 0) {
    return (
      <Spin spinning={loading}>
        <div className={styles.notFound}>
          <img src="/empty_image.svg" alt="not found" />
          <div>{emptyText}</div>
        </div>
      </Spin>
    );
  }
  return (
    <Spin spinning={loading}>
      <List<NoticeIconData>
        className={styles.list}
        dataSource={data}
        renderItem={(item, i) => {
          const itemCls = classNames(styles.item, {
            [styles.read]: item.read,
          });
          // eslint-disable-next-line no-nested-ternary
          let { avatar } = item;
          if (avatar === 'warning') avatar = <WarningFilled style={{ color: '#fadb14' }} />;
          if (avatar === 'info') avatar = <InfoCircleFilled style={{ color: '#1890ff' }} />;
          if (avatar === 'error') avatar = <CloseCircleFilled style={{ color: '#f5222d' }} />;
          if (avatar === 'question') avatar = <QuestionCircleFilled style={{ color: '#fa8c16' }} />;
          if (['audit', 'approve'].includes(item.action!)) {
            avatar = <CarryOutFilled style={{ color: '#1890ff' }} />;
          } else if (item.action === 'claim') {
            avatar = <InfoCircleFilled style={{ color: '#1890ff' }} />;
          }
          let leftIcon = null;
          if (avatar)
            leftIcon =
              typeof avatar === 'string' ? (
                <Avatar className={styles.avatar} src={avatar} />
              ) : (
                <span className={styles.iconElement}>{avatar}</span>
              );
          return (
            <List.Item
              className={itemCls}
              key={item.key || i}
              onClick={() => onClick && onClick(item)}
            >
              <List.Item.Meta
                className={styles.meta}
                avatar={leftIcon}
                title={
                  <div className={styles.title}>
                    {item.title}
                    <div className={styles.extra}>{item.extra}</div>
                  </div>
                }
                description={
                  <div>
                    <div className={styles.description}>{item.description}</div>
                    <div className={styles.datetime}>{item.datetime}</div>
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
      <div className={styles.bottomBar}>
        {/* {showClear ? (
          <div onClick={onClear}>
            {clearText} {title}
          </div>
        ) : null} */}
        {showRefresh ? (
          <div onClick={onRefresh}>
            {refreshText} {title}
          </div>
        ) : null}
        {showViewMore ? (
          <div
            onClick={(e) => {
              if (onViewMore) {
                onViewMore(e);
              }
            }}
          >
            {viewMoreText}
          </div>
        ) : null}
      </div>
    </Spin>
  );
};

export default NoticeList;
