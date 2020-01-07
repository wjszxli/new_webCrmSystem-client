import React from 'react';
import { Modal, Form, Input, Row, Col, Radio, message,Select, DatePicker} from 'antd';

import request from 'utils/request'
import config from 'utils/config'
import moment from 'moment'

import './addPlan.less';

const { TextArea } = Input;

const FormItem = Form.Item;
const Option = Select.Option;

export default Form.create()(
  class extends React.Component {
    state = {
      customer:[],
      customerName:'',
    }

    onCreate = () => {
      const that = this
      
      this.props.form.validateFields((error, value) => {
        if (error) {
          return
        }
        const url = `${config.apiUrl}/updatePublicNumber`
        const updateRouter = localStorage.getItem('name')
        if (updateRouter) {
          value.updateRouter = updateRouter
        }
        const options = {
          method:'POST',
          body: value,
        }
        if (this.props.id) {
          value.id = this.props.id
        }
        request(url, options).then(res => {
          if (res) {
            console.log('res', res)
            if (res.code === 0) {
              message.success(res.data.tip);
              that.props.getPageData(this.props.current)
              that.props.onCancel()
              that.props.form.resetFields();
            } else {
              message.error(res.error);
            }
          }
        })
      })
    }

    componentDidMount(){
      if (!this.props.isAdd) {
        this.props.form.setFieldsValue(this.props.editData[0])
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
          title="资源更新"
          okText="保存资源信息"
          onCancel={onCancel}
          onOk={this.onCreate}
          width={800}
        >
          <Form className="ant-advanced-search-form">
            <Row>
                <Col span={12}>
                  <FormItem {...formItemLayout} label="公众号名称">
                    {getFieldDecorator('name', {
                  initialValue: '',
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '输入公众号名称',
                  }],
                })(<Input placeholder="输入公众号名称" disabled={this.props.isAdd} />)}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...formItemLayout} label="id">
                    {getFieldDecorator('dataId', {
                  initialValue: '',
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '输入id',
                  }],
                })(<Input placeholder="输入id" disabled={this.props.isAdd} />)}
                  </FormItem>
                </Col>
              </Row>
            <Row>
                <Col span={12}>
                  <FormItem {...formItemLayout} label="粉丝数">
                  {getFieldDecorator('star', {
                  initialValue: '',
                })(
                  <Input placeholder="输入粉丝数" disabled={this.props.isAdd} />
                )}
                </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...formItemLayout} label="头条刊例">
                    {getFieldDecorator('topTitle', {
                  initialValue: '',
                })(
                  <Input placeholder="输入头条刊例" disabled={this.props.isAdd} />
                )}
                  </FormItem>
                </Col>
              </Row>
            <Row>
                <Col span={12}>
                  <FormItem {...formItemLayout} label="头条成本">
                  {getFieldDecorator('topCost', {
                  initialValue: '',
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '输入报价',
                  }],
                })(
                  <Input placeholder="输入头条成本" disabled={this.props.isAdd} />
                )}
                </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...formItemLayout} label="次条刊例">
                    {getFieldDecorator('secondTitle', {
                  initialValue: '',
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '输入成本价',
                  }],
                })(<Input placeholder="输入次条刊例" disabled={this.props.isAdd} />)}
                  </FormItem>
                </Col>
              </Row>
            <Row>
                <Col span={12}>
                  <FormItem {...formItemLayout} label="次条成本">
                    {getFieldDecorator('secondCost', {
                    initialValue: '',
                  })(
                    <Input placeholder="输入次条成本" disabled={this.props.isAdd} />
                  )}
                  </FormItem>
                </Col>                
                <Col span={12}>
                  <FormItem {...formItemLayout} label="末条刊例">
                    {getFieldDecorator('lastTitle', {
                    initialValue: '',
                  })(
                    <Input placeholder="输入末条刊例" disabled={this.props.isAdd} />
                  )}
                  </FormItem>
                </Col>
              </Row>
            <Row>
                <Col span={12}>
                  <FormItem {...formItemLayout} label="末条成本">
                    {getFieldDecorator('lastCost', {
                    initialValue: '',
                  })(
                    <Input placeholder="输入末条成本" disabled={this.props.isAdd} />
                  )}
                  </FormItem>
                </Col>                
                <Col span={12}>
                  <FormItem {...formItemLayout} label="女粉比例">
                    {getFieldDecorator('womenRatio', {
                    initialValue: '',
                  })(
                    <Input placeholder="输入女粉比例" disabled={this.props.isAdd} />
                  )}
                  </FormItem>
                </Col>
              </Row>
            <Row>
                <Col span={12}>
                  <FormItem {...formItemLayout} label="是否刷号">
                    {getFieldDecorator('brush', {
                    initialValue: '',
                  })(
                    <Select style={{ width: '90%' }}>
                      <Option value="不刷">不刷</Option>
                      <Option value="全刷">全刷</Option>
                      <Option value="半刷">半刷</Option>
                    </Select>
                  )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...formItemLayout} label="类型">
                    {getFieldDecorator('type', {
                    initialValue: '',
                  })(
                    <Select style={{ width: '90%' }}>
                      <Option value="教育亲子">教育亲子</Option>
                      <Option value="初高中">初高中</Option>
                      <Option value="时尚美妆">时尚美妆</Option>
                      <Option value="金融">金融</Option>
                      <Option value="kol">kol</Option>
                      <Option value="服务号">服务号</Option>
                      <Option value="幼儿">幼儿</Option>
                      <Option value="其他">其他</Option>
                    </Select>
                  )}
                  </FormItem>
                </Col>             
              </Row>
            <Row>
                <Col span={12}>
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
