//import { AlipayCircleOutlined, TaobaoCircleOutlined, WeiboCircleOutlined } from '@ant-design/icons';
import { Alert, Checkbox, Row, Col, Button, Popover, Modal, Form } from 'antd';
import React, { useState } from 'react';
import { useIntl } from 'umi';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { StateType } from '@/models/login';
import { LoginParamsType } from '@/services/login';
import { ConnectState } from '@/models/connect';
import { SystemInfo } from '@/models/systeminfo';
import LoginFrom from './components/Login';
import { decryptString } from '@/utils/utils';
import { WarningOutlined } from '@ant-design/icons';
import styles from './style.less';

const { Tab, UserCode, Password, Mobile, Captcha, Submit, IdentifingCode } = LoginFrom;
interface LoginProps {
  dispatch: Dispatch<AnyAction>;
  userLogin: StateType;
  submitting?: boolean;
  systemInfo: SystemInfo;
}

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const renderMessage = (content: string) => (
  <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
);

const Login: React.FC<LoginProps> = props => {
  const { dispatch, userLogin, submitting,
    systemInfo: { systeminfo: { forgetpassword = '' } },
    systemInfo: { loginsettinginfo } } = props;
  const { alwaysneedidentifingcode, needidentifingcode, allowsavepassword } = loginsettinginfo;

  const { status, errorcode, type: loginType } = userLogin;
  const [type, setType] = useState<string>('account');
  const [savePassword, setSavePassword] = useState<boolean>(localStorage.getItem('login-allow-save-pwd') === 'true');
  const [identifingcodeT] = useState<number>(new Date().getTime());
  const loginValidationCodeId = 'login_validation_code';

  const handleSubmit = (values: LoginParamsType) => {
    const { dispatch } = props;
    dispatch({
      type: 'login/login',
      payload: { ...values, type },
    });
  };

  const changeSavePassword = (e: CheckboxChangeEvent) => {
    localStorage.setItem('login-allow-save-pwd', e.target.checked ? 'true' : 'false');
    if (!e.target.checked) localStorage.removeItem('login-user-password');
    setSavePassword(e.target.checked);
  };

  const [form] = Form.useForm();  //form为下面LoginFrom的实例
  const { formatMessage} = useIntl();
  return (
    <div className={styles.main}>
      <LoginFrom activeKey={type} onTabChange={setType} onSubmit={handleSubmit} from={form}
        initialValues={{
          usercode: localStorage.getItem('login-user-code') || undefined,
          password: savePassword ? decryptString(localStorage.getItem('login-user-password') || '')
            : ''
        }}
      >
        <Tab key="account" tab={formatMessage({ id: 'user-login.login.tab-login-credentials' })}>
          {status === 'error' && loginType === 'account' && !submitting && renderMessage(
            formatMessage({ id: `user-login.login.message-invalid-code-${errorcode}` }),
          )}
          <UserCode
            name="usercode"
            //defaultValue={localStorage.getItem('login-user-code') || undefined}   4.x这里无效应该是bug
            placeholder={formatMessage({ id: 'user-login.login.usercode' })}
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'user-login.usercode.required' }),
              },
            ]}
          />
          <Password
            name="password"
            //defaultValue={savePassword ? decryptString(localStorage.getItem('login-user-password') || '')
            //  : ''}  4.x这里无效，应该是bug
            placeholder={formatMessage({ id: 'user-login.login.password' })}
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'user-login.password.required' }),
              },
            ]}
          />

          {alwaysneedidentifingcode || (status === 'error' && loginType === 'account' && needidentifingcode) ?
            <Row>
              <Col span={9}>
                <IdentifingCode
                  name="identifingcode"
                  placeholder={formatMessage({ id: 'user-login.verification-code.placeholder' })}
                  rules={[
                    {
                      required: true,
                      message: formatMessage({ id: 'user-login.verification-code.required' }),
                    },
                    {
                      max: 4,
                      message: formatMessage({ id: 'user-login.verification-code.max4' }),
                    },
                  ]}
                /></Col>
              <Col span={7}><img id={loginValidationCodeId}
                style={{ height: '38px', width: '100px', paddingLeft: 10 }}
                src={`/api/login/validatecode.do?t=${identifingcodeT}`} />
              </Col>
              <Col span={6}>
                <Button type="link"
                  onClick={
                    () => {
                      const node: any = document.getElementById(loginValidationCodeId);
                      node.src = `/api/login/validatecode.do?t=${new Date().getTime()}`
                    }}>
                  换一张
                </Button>
              </Col>
            </Row> : null
          }
          <div>
            <Checkbox checked={savePassword} onChange={changeSavePassword}
              style={{ visibility: allowsavepassword ? 'visible' : 'hidden' }} >
              {formatMessage( {id:"user-login.login.remember-password"})}
            </Checkbox>
            <Popover trigger="click" content={
              <div style={{ padding: 5 }} dangerouslySetInnerHTML={{ __html: forgetpassword }} />}
              title={<div><WarningOutlined style={{ color: 'red' }} />
                {` ${formatMessage({ id: 'user-login.login.forgot-password' })}?`}</div>} >
              <a style={{ float: 'right' }} href="">
              {formatMessage( {id:"user-login.login.forgot-password"})}
              </a>
            </Popover>
          </div>

        </Tab>
        <Tab key="mobile" tab="手机号登录" disabled>
          {status === 'error' && loginType === 'mobile' && !submitting && (
            <LoginMessage content="验证码错误" />
          )}
          <Mobile
            name="mobile"
            placeholder="手机号"
            rules={[
              {
                required: true,
                message: '请输入手机号！',
              },
              {
                pattern: /^1\d{10}$/,
                message: '手机号格式错误！',
              },
            ]}
          />
          <Captcha
            name="captcha"
            placeholder="验证码"
            countDown={120}
            getCaptchaButtonText=""
            getCaptchaSecondText="秒"
            rules={[
              {
                required: true,
                message: '请输入验证码！',
              },
            ]}
          />
        </Tab>
        {/* <div>
          <Checkbox checked={autoLogin} onChange={e => setAutoLogin(e.target.checked)}>
            自动登录
          </Checkbox>
          <a
            style={{
              float: 'right',
            }}
          >
            忘记密码
          </a>
        </div> */}
        <Submit loading={submitting}>登录</Submit>
        {/* <div className={styles.other}>
          其他登录方式
          <AlipayCircleOutlined className={styles.icon} />
          <TaobaoCircleOutlined className={styles.icon} />
          <WeiboCircleOutlined className={styles.icon} />
          <Link className={styles.register} to="/user/register">
            注册账户
          </Link>
        </div> */}
      </LoginFrom>

      <Modal
        title={formatMessage({ id: 'user-login.login.message-invalidate-title' })}
        closable={false}
        visible={status === 'warnning'}
        onOk={() => {
          if (form) {
            const fieldsValue: any = form.getFieldsValue();
            fieldsValue.invalidate = true;
            handleSubmit(fieldsValue);
          }
        }}
        onCancel={() => {
          dispatch({
            type: 'login/loginErrorCode7',
          })
        }}
      >
        {formatMessage( {id:"user-login.login.message-invalidate"})}
      </Modal>

    </div>
  );
};

export default connect(({ login, loading, systemInfo }: ConnectState) => ({
  userLogin: login,
  submitting: loading.effects['login/login'],
  ...systemInfo,
}))(Login);
