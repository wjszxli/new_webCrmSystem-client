import React from 'react';
import { Modal, Form, Input, Row, Col, Radio, message } from 'antd';

import request from 'utils/request'
import config from 'utils/config'

import './customer.less';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;

export default Form.create()(
  class extends React.Component {
    onCreate = () => {
      console.log('=========wjs');
      
      const that = this
      const { isAdd } = this.props 
      let id = ''     
      if (!isAdd) {
        id = this.props.editData[0].id
      }
      this.props.form.validateFields((error, value) => {
        if (!!error) {
          return
        }
        const userId = localStorage.getItem('id')
        if (userId) {
          value.userId = userId
        }
        value.isAdd = isAdd
        value.id = id
        const url = `${config.apiUrl}/saveCustomer`
        const options = {
          method:'POST',
          body: value
        }
        request(url, options).then(res => {
          if (res.code === 0) {
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
    componentDidMount(){
      if (!this.props.isAdd) {
        this.props.form.setFieldsValue(this.props.editData[0])
      } else {
        this.props.form.setFieldsValue({
          people:localStorage.getItem('name')
        })
      }
      
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
          title="录入客户"
          okText="保存客户信息"
          onCancel={onCancel}
          onOk={this.onCreate}
          width={800}
        >
            <Form className="ant-advanced-search-form" >
              <Row>
                <Col span={12}>
                  <FormItem {...formItemLayout}  label="公司名称">
                  {getFieldDecorator('companyName', {
                  initialValue: '',
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '输入公司名称',
                  }],
                })(<Input placeholder="输入公司名称" />)}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...formItemLayout} label="客户品牌">
                  {getFieldDecorator('brand', {
                  initialValue: '',
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '输入客户品牌',
                  }],
                })(<Input placeholder="输入客户品牌" />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <FormItem {...formItemLayout} label="联系人">
                  {getFieldDecorator('connect', {
                  initialValue: '',
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '输入联系人',
                  }],
                })(<Input placeholder="输入联系人" />)}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...formItemLayout} label="电话">
                  {getFieldDecorator('phone', {
                  initialValue: '',
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '输入电话',
                  }],
                })(<Input placeholder="输入电话" />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <FormItem {...formItemLayout} label="微信">
                  {getFieldDecorator('webchat', {
                  initialValue: '',
                })(<Input placeholder="输入微信" />)}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...formItemLayout} label="qq">
                  {getFieldDecorator('qq', {
                    initialValue: '',
                  })(<Input placeholder="输入qq" />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <FormItem {...formItemLayout} label="是否合作">
                  {getFieldDecorator('isCollaborate', {
                    initialValue: '1',
                  })(
                    <RadioGroup name="radiogroup">
                      <Radio value={1}>是</Radio>
                      <Radio value={0}>否</Radio>
                  </RadioGroup>
                  )}
                  </FormItem>
                </Col>                
                <Col span={12}>
                  <FormItem {...formItemLayout} label="跟进人">
                  {getFieldDecorator('people', {
                    initialValue: '',
                  })(<Input placeholder="输入跟进人" />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={24} pull={4}>
                  <FormItem {...formItemLayout} label="备注">
                  {getFieldDecorator('remark', {
                    initialValue: '',
                  })(
                    <TextArea placeholder="输入备注" rows={4} />
                  )}
                  </FormItem>
                </Col>                
              </Row>
            </Form>
        </Modal>
      );
    }
  }
);
