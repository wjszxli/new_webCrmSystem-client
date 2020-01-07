import React from 'react';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { Card,  Form, Input, Button, message } from 'antd'
import request from 'utils/request'
import config from 'utils/config'

const FormItem = Form.Item;
export default Form.create()(
 class ModifyPassword extends React.Component {
  modifyPwd = () =>{
    const that = this
    this.props.form.validateFields((error, value) => {
      if (!!error) {
        return
      }
      if (value.newpwd !== value.confirmpwd) {
        message.error("新密码和确认密码不一致");
        return
      }
      const url = `${config.apiUrl}/modifyPwd`
      value.id = localStorage.getItem('id')

      const options = {
        method:'POST',
        body: value
      }
      request(url, options).then(res => {
        console.log('rrr', res)
        if (res.code === "0") {
          message.success(res.data.tip);
          that.props.form.resetFields();
        } else {
          message.error(res.error||res.data.tip);
        }
      })
    })
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return(
      <PageHeaderLayout title="修改密码">
        <Card bordered={false}>
        <Form layout="vertical">
        <FormItem label="原密码">
        {getFieldDecorator('oldpwd', {
                  initialValue: '',
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '请输入原密码',
                  }],
        })(<Input style={{width:'60%'}} placeholder="请输入原密码" type="password" />)}
        </FormItem>
        <FormItem label="新密码">
        {getFieldDecorator('newpwd', {
                  initialValue: '',
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '请输入新密码',
                  }],
        })(<Input style={{width:'60%'}} placeholder="请输入新密码" type="password" />)}
        </FormItem>
        <FormItem label="新密码确认">
        {getFieldDecorator('confirmpwd', {
                  initialValue: '',
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '请输入新密码确认',
                  }],
        })(<Input style={{width:'60%'}} placeholder="请输入新密码确认" type="password" />)}
      </FormItem>
      </Form>
      <Button type="primary" onClick={this.modifyPwd} >确认修改</Button>
        </Card>
      </PageHeaderLayout>
    )
  }
}
)
