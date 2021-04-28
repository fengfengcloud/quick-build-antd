import React from 'react';
import { Dispatch } from 'redux';
import { currentUser } from 'umi';
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Popover,
  Space,
  Steps,
  Tooltip,
} from 'antd';
import {
  CheckCircleOutlined,
  CheckOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { deleteSecond, showResultInfo } from '@/utils/utils';
import { isAdmin, isAdministrator } from '@/utils/Authorized';
import request, { API_HEAD } from '@/utils/request';
import { ModuleModal, ModuleState } from '../data';
import { getModuleInfo } from '../modules';

const AUDITINGDATE = 'auditingDate';
const AUDITINGNAME = 'auditingName';
const AUDITINGUSERID = 'auditingUserid';
const AUDITINGREMARK = 'auditingRemark';

interface AuditRenderProps {
  moduleState: ModuleState;
  dispatch: Dispatch<any>;
  value: any;
  record: any;
  _recno: any;
  isLink?: boolean;
  readonly?: boolean;
}

// 是否审核过了
export const isAudited = (record: any) => {
  return !!record[AUDITINGDATE];
};

// 当前用户可以审核
export const canAudited = (record: any) => {
  return !isAudited(record) && record[AUDITINGUSERID] === currentUser.userid;
};

// 当前用户可以取消审核
export const canCancelAudited = (record: any) => {
  return (
    isAudited(record) &&
    (record[AUDITINGUSERID] === currentUser.userid || isAdmin() || isAdministrator())
  );
};

/**
 * 进行审核操作
 * @param moduleState
 * @param record
 * @param dispatch
 */
const executeAudit = (moduleState: ModuleState, record: any, dispatch: Dispatch) => {
  const { moduleName, formState } = moduleState;
  dispatch({
    type: 'modules/formStateChanged',
    payload: {
      moduleName,
      formState: {
        ...formState,
        visible: true,
        formType: 'audit',
        currRecord: record,
      },
    },
  });
};

/**
 * 更改审核人员
 * @param moduleState
 * @param record
 * @param dispatch
 */
const changeAuditUser = (moduleState: ModuleState, record: any, dispatch: Dispatch) => {
  let usercode = '';
  const { moduleName } = moduleState;
  const recordId = record[getModuleInfo(moduleName).primarykey];
  Modal.confirm({
    title: '请输入审核用户代码',
    icon: null,
    content: (
      <Form autoComplete="off">
        <Input
          autoFocus
          name="text"
          defaultValue=""
          maxLength={20}
          onChange={(e) => {
            usercode = e.target.value.trim();
          }}
        />
      </Form>
    ),
    onOk: () => {
      if (usercode) {
        request(`${API_HEAD}/platform/audit/setaudituser.do`, {
          params: {
            moduleName,
            usercode,
            recordId,
          },
        }).then((response: any) => {
          if (response.success) {
            message.warn(`已将记录的审核人员设置为：${response.msg}`);
            dispatch({
              type: 'modules/refreshRecord',
              payload: {
                moduleName,
                recordId,
              },
            });
          } else {
            Modal.warning({
              okText: '知道了',
              title: `设置审核人员失败`,
              /* eslint-disable */
              content: <span dangerouslySetInnerHTML={{ __html: response.msg }} />,
              /* eslint-enable */
            });
          }
        });
      }
    },
  });
};

/**
 * 审核状态   未审核 可审核 已审核 已审核(可取消审核)
 * @param moduleInfo
 * @param record
 */
const getAuditIconClass = (record: any): string => {
  if (!isAudited(record)) {
    if (canAudited(record)) return 'approveaction x-fa fa-pencil fa-fw'; // 可以启动
    return 'actionyellow x-fa fa-exclamation-triangle fa-fw'; // 不能启动
  }
  return 'actionblue x-fa fa-check fa-fw';
};

/**
 * 尚未启动审批流程的，可以启动与不能启动流程的二种情况
 * @param param0
 */
const getCanStartPopover = ({
  moduleState,
  record,
  className,
  dispatch,
}: {
  moduleState: ModuleState;
  record: any;
  className: string;
  dispatch: Dispatch;
}) => {
  const state = '未审核';
  const doAudit = () => executeAudit(moduleState, record, dispatch);
  return canAudited(record) ? (
    <Popover
      content={
        <span>
          {state}
          <span style={{ marginLeft: '12px' }}>
            <a onClick={doAudit}>现在审核</a>
          </span>
        </span>
      }
    >
      <a onClick={doAudit}>
        <span className={className} />
      </a>
    </Popover>
  ) : (
    <Popover
      placement="rightTop"
      trigger="hover"
      content={
        <>
          {state}
          <span style={{ marginLeft: '12px' }}>{`正在等待 ${record[AUDITINGNAME]} 进行审核`}</span>
          {isAdmin() || isAdministrator() ? (
            <span>
              <Button type="link" onClick={() => changeAuditUser(moduleState, record, dispatch)}>
                更换审核人员
              </Button>
            </span>
          ) : null}
        </>
      }
    >
      <span className={className} />
    </Popover>
  );
};

export const auditRecord = (record: any, moduleInfo: ModuleModal, dispatch: Dispatch) => {
  const moduleName = moduleInfo.modulename;
  request(`${API_HEAD}/platform/audit/doaudit.do`, {
    params: {
      moduleName,
      recordId: record[moduleInfo.primarykey],
    },
  }).then((response) => {
    if (response.success) {
      message.success(`${record[moduleInfo.namefield]} 已审核！`);
      showResultInfo(response.resultInfo);
      dispatch({
        type: 'modules/refreshRecord',
        payload: {
          moduleName,
          recordId: record[moduleInfo.primarykey],
        },
      });
    } else {
      Modal.warning({
        okText: '知道了',
        title: `${record[moduleInfo.namefield]} 审核失败`,
        /* eslint-disable */
        content: <span dangerouslySetInnerHTML={{ __html: response.msg }} />,
        /* eslint-enable */
      });
    }
  });
};

export const cancelAudit = (record: any, moduleInfo: ModuleModal, dispatch: Dispatch) => {
  const moduleName = moduleInfo.modulename;
  request(`${API_HEAD}/platform/audit/cancel.do`, {
    params: {
      moduleName,
      recordId: record[moduleInfo.primarykey],
    },
  }).then((response) => {
    if (response.success) {
      message.success(`${record[moduleInfo.namefield]} 的审核已取消！`);
      showResultInfo(response.resultInfo);
      dispatch({
        type: 'modules/refreshRecord',
        payload: {
          moduleName,
          recordId: record[moduleInfo.primarykey],
        },
      });
    } else {
      Modal.warning({
        okText: '知道了',
        title: `${record[moduleInfo.namefield]} 取消审核失败`,
        /* eslint-disable */
        content: <span dangerouslySetInnerHTML={{ __html: response.msg }} />,
        /* eslint-enable */
      });
    }
  });
};

const MAXTITLELENGTH = 30; // 审批内容的最大长度，超出之后显示一个tooltip

/**
 * 审核的字段
 * @param param0
 */
export const auditRenderer: React.FC<AuditRenderProps> = ({ record, moduleState, dispatch }) => {
  if (!record) return null;
  const { moduleName } = moduleState;
  const moduleInfo = getModuleInfo(moduleName);
  const className = getAuditIconClass(record);
  const text = `『${record[moduleInfo.namefield]}』`;
  // 流程还没有启动
  if (!isAudited(record)) {
    return getCanStartPopover({ moduleState, record, className, dispatch });
  }
  const remark = record[AUDITINGREMARK];
  const tips = (
    <Card
      title={
        <>
          <CheckCircleOutlined /> 审核信息
        </>
      }
      extra={
        <Space>
          {canCancelAudited(record) ? (
            <Tooltip title="取消审核" placement="bottom">
              <Popconfirm
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                title={`要取消 ${text} 的审核吗?`}
                onConfirm={() => cancelAudit(record, moduleInfo, dispatch)}
              >
                <UndoOutlined />
              </Popconfirm>
            </Tooltip>
          ) : null}
        </Space>
      }
    >
      <Steps size="small" key="audit_info" direction="vertical">
        <Steps.Step
          title="已审核"
          key="AuditFinished"
          icon={<CheckCircleOutlined />}
          status="finish"
          description={
            <span>
              {`${record[AUDITINGNAME]}(${deleteSecond(record[AUDITINGDATE])})`}
              <br />
              {remark && remark.length > MAXTITLELENGTH ? (
                <Tooltip title={remark}>
                  <span>
                    <InfoCircleOutlined /> 审核意见
                  </span>
                </Tooltip>
              ) : (
                remark
              )}
            </span>
          }
        />
      </Steps>
    </Card>
  );
  return (
    <Popover placement="rightTop" trigger="hover" content={tips}>
      <CheckOutlined style={{ margin: '0px 2px' }} />
    </Popover>
  );
};
