import React from 'react';
import {
  LockTwoTone,
  MailTwoTone,
  MobileTwoTone,
  UserOutlined,
  NumberOutlined,
} from '@ant-design/icons';
import styles from './index.less';

export default {
  UserCode: {
    props: {
      size: 'large',
      name: 'usercode',
      // defaultValue: localStorage.getItem('login-user-code') || undefined,
      prefix: (
        <UserOutlined
          style={{
            color: '#1890ff',
          }}
          className={styles.prefixIcon}
        />
      ),
    },
    rules: [
      {
        required: true,
        message: 'Please enter username!',
      },
    ],
  },
  Password: {
    props: {
      size: 'large',
      prefix: <LockTwoTone className={styles.prefixIcon} />,
      type: 'password',
      name: 'password',
      // defaultValue : decryptString(localStorage.getItem('login-user-password') || ''),
    },
    rules: [
      {
        required: true,
        message: 'Please enter password!',
      },
    ],
  },
  IdentifingCode: {
    props: {
      size: 'large',
      id: 'identifingcode',
      icon: <NumberOutlined />,
      placeholder: 'identifingcode',
    },
    rules: [
      {
        required: true,
        message: 'Please enter username!',
      },
      {
        max: 4,
        message: 'maxlength is 4!',
      },
    ],
  },
  Mobile: {
    props: {
      size: 'large',
      prefix: <MobileTwoTone className={styles.prefixIcon} />,
      placeholder: 'mobile number',
    },
    rules: [
      {
        required: true,
        message: 'Please enter mobile number!',
      },
      {
        pattern: /^1\d{10}$/,
        message: 'Wrong mobile number format!',
      },
    ],
  },
  Captcha: {
    props: {
      size: 'large',
      prefix: <MailTwoTone className={styles.prefixIcon} />,
      placeholder: 'captcha',
    },
    rules: [
      {
        required: true,
        message: 'Please enter Captcha!',
      },
    ],
  },
};
