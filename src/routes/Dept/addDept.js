import React from 'react';
import { Modal, Form, Input, message } from 'antd';
import request from 'utils/request'
import config from 'utils/config'

const FormItem = Form.Item;

export default Form.create()(
  class extends React.Component {
    componentDidMount(){
      if (!this.props.isAdd) {
        this.props.form.setFieldsValue(this.props.editData[0])
      }
    }
    onCreate = () => {
      const that = this
      this.props.form.validateFields((error, value) => {
        if (!!error) {
          return
        }
        const url = `${config.apiUrl}/saveUserInfo`
        const options = {
          method:'POST',
          body: value
        }
        request(url, options).then(res => {
          if (res.code === "0") {
            message.success(res.data.tip);
            that.props.getPageData(1)
            that.props.onCancel()
            that.props.form.resetFields();
          } else {
            message.error(res.error);
          }
        })
       
      })
    }
    render() {
      const { visible, onCancel } = this.props;
      const { getFieldDecorator } = this.props.form;
      const formItemLayout = {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 8 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
      };
      return (
        <Modal
          visible={visible}
          maskClosable={false}
          title="账号信息"
          okText="保存账号信息"
          onCancel={onCancel}
          onOk={this.onCreate}
        >
            <Form >
              <FormItem {...formItemLayout}  label="姓名">
              {getFieldDecorator('name', {
                  initialValue: '',
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '请输入姓名',
                  }],
                })(<Input placeholder="输入姓名" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="手机号">
              {getFieldDecorator('phone', {
                  initialValue: '',
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '请输入手机号',
                  }],
                })(<Input placeholder="输入手机号" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="部门">
              {getFieldDecorator('dept', {
                  initialValue: '',
                })(<Input placeholder="输入部门" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="职位">
              {getFieldDecorator('job', {
                  initialValue: '',
                })(<Input placeholder="输入职位" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="备注">
              {getFieldDecorator('remark', {
                  initialValue: '',
                })(<Input placeholder="备注" />)}
              </FormItem>
            </Form>
        </Modal>
      );
    }
  }
);
