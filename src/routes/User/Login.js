import React, { Component } from 'react';
import { connect } from 'dva';
import { Alert,message } from 'antd';
import Login from 'components/Login';
import styles from './Login.less';
import { getPageQuery } from 'utils/utils';
import { setAuthority } from 'utils/authority';

import request from 'utils/request'
import config from 'utils/config'

const { Tab, UserName, Password, Mobile, Captcha, Submit } = Login;

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
export default class LoginPage extends Component {
  state = {
    type: 'account',
    autoLogin: true,
  };

  onTabChange = type => {
    this.setState({ type });
  };
  toUrl = () =>{
    const urlParams = new URL(window.location.href);
    const params = getPageQuery();
    let { redirect } = params;
    
    if (redirect) {
      const redirectUrlParams = new URL(redirect);
      if (redirectUrlParams.origin === urlParams.origin) {
        redirect = redirect.substr(urlParams.origin.length);
        if (redirect.startsWith('/#')) {
          redirect = redirect.substr(2);
        }
      } else {
        window.location.href = redirect;
        return;
      }
    }
    window.location.href = redirect || '/'
  }
  handleSubmit = (err, values) => {
    if (!err) {
      let url = `${config.apiUrl}/login`
      const options = {
        method:'POST',
        body: values
      }
      request(url,options).then(res => {
        if (res) {
          if (res.code === 0){
            if (res.data.length>0) {
              console.log('wwww', res.data)
              localStorage.setItem('name', res.data[0].name)
              localStorage.setItem('phone', res.data[0].phone)
              localStorage.setItem('dept', res.data[0].dept)
              localStorage.setItem('job', res.data[0].job)
              localStorage.setItem('id', res.data[0].id)
              sessionStorage.setItem('key', res.data[0].openId)
    
              setAuthority('admin')
              message.success('登录成功');
              window.location.href = '/'
            } else {
              message.error('用户名或密码错误，登录失败');
            }
          }else{
            message.error(res.error);
          }
        }
      })
    }
  };

  changeAutoLogin = e => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };

  renderMessage = content => {
    return <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />;
  };

  render() {
    const { login, submitting } = this.props;
    const { type, autoLogin } = this.state;
    return (
      <div className={styles.main}>
        <Login defaultActiveKey={type} onTabChange={this.onTabChange} onSubmit={this.handleSubmit}>
          <Tab key="account" tab="用户登录">
            <UserName name="phone" placeholder="输入手机号" />
            <Password name="password" placeholder="输入密码" />
          </Tab>
          <Submit loading={submitting}>登录</Submit>
        </Login>
      </div>
    );
  }
}
