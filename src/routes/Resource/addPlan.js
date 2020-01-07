import React from 'react';
import { Modal, Form, Input, Row, Col, Radio, message,Select, DatePicker} from 'antd';

import request from 'utils/request'
import config from 'utils/config'
import moment from 'moment'
import math  from 'mathjs';
import './addPlan.less';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const Option = Select.Option;

export default Form.create()(
  class extends React.Component {
    state = {
      customer:[],
      customerName:'',
      defaultValue:'',
    }

    async componentDidMount(){
      const url = `${config.apiUrl}/getAllCustomer`
      const options = {
        method:'get',
      }
      const res = await request(url, options)
      if (res) {
        if (res.code === 0) {          
          this.setState({
            customer: res.data,
          })
        } else {
          message.error(res.error);
        }
      }

      if (!this.props.isAdd) {
        const data = this.props.editData[0]
        if (data) {
          data.customer ={key: Number(data.customer)}
        }         
        this.props.form.setFieldsValue(data)
      }
      if (this.props.isAdd) {
        this.props.form.setFieldsValue({
          publicNumber: this.props.listData[this.props.selectedRowKeys].name,
        })
      }
    }

    onCreate = () => {
      const that = this
      // this.props.isAdd
      const { isAdd } = this.props
      this.props.form.validateFields((error, value) => {
        if (error) {
          return
        }
        if (this.props.selectedRowKeys) {
          value.publicNumberId = this.props.listData[this.props.selectedRowKeys].id
        }
        if (value.inTime) {
         value.inTime =  moment(value.inTime).unix()
        }
        if (value.customer) {
          value.customer = value.customer.key
        }
        if (this.state.customerName) {
          value.customerName = this.state.customerName
        }
        const name = localStorage.getItem('name')
        if (name) {
          value.planPeople = name
        }
        const userId = localStorage.getItem('id')
        if (userId) {
          value.userId = userId
        }
        let method = 'savePlan'
        if (!isAdd) {          
          const { id } = this.props.editData[0]
          method = 'updatePlan'
          value.id = id
        }
        const url = `${config.apiUrl}/${method}`
        const options = {
          method:'POST',
          body: value,
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

    handleChange = (value) => {
      this.setState({
        customerName: value.label,
      })
    }

    handleImpost = (e) => {      
      let { isInvoiceClient, price } = this.props.form.getFieldsValue()      
      const taxClient = Number(e)/100
      price = Number(price)
      isInvoiceClient = Number(isInvoiceClient)
      if (isInvoiceClient === 1) {
        let impost = math.eval(`(${price} / (1+${taxClient})) * ${taxClient}`)
        impost = math.round(impost, 2)
        this.props.form.setFieldsValue({
          impost,
        })
      }
    }

    handleChannelImpost = (e) => {
      let {  isInvoiceRouter, cost } = this.props.form.getFieldsValue()
      const taxRouter = Number(e)/100
      cost = Number(cost)
      isInvoiceRouter = Number(isInvoiceRouter)
      if (isInvoiceRouter === 1) {
        let channelImpost = math.eval(`(${cost} / (1+ ${taxRouter})) * ${taxRouter}`)
        channelImpost = math.round(channelImpost, 2)
        this.props.form.setFieldsValue({
          channelImpost,
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
      const options = this.state.customer.map(d => <Option value={d.id}>{d.companyName}</Option>);
      return (
        <Modal
          visible={visible}
          maskClosable={false}
          title="录入排期信息"
          okText="保存排期信息"
          onCancel={onCancel}
          onOk={this.onCreate}
          width={800}
        >
          <Form className="ant-advanced-search-form">
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="公众号名称">
                  {getFieldDecorator('publicNumber', {
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
                <FormItem {...formItemLayout} label="投放位置">
                  {getFieldDecorator('location', {
                  initialValue: '',
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '输入客户品牌',
                  }],
                })(
                  <Select style={{ width: '90%' }} placeholder="选择类型搜索">
                    <Option value="top">头条</Option>
                    <Option value="second">次条</Option>
                    <Option value="other">其他条</Option>
                    <Option value="last">末条</Option>
                  </Select>)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="客户名称">
                  {getFieldDecorator('customer', {
                  initialValue:"",
                })(
                  <Select
                    style={{ width: '90%' }}
                    placeholder="Select a person"
                    labelInValue
                    onChange={this.handleChange}
                  >
                    {options}
                  </Select>
                )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="投放时间">
                  {getFieldDecorator('inTime', {
                  initialValue: '',
                })(
                  <DatePicker
                    format="YYYY-MM-DD"
                  />
                )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="报价">
                  {getFieldDecorator('price', {
                  initialValue: '',
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '输入报价',
                  }],
                })(<Input type="number" placeholder="输入报价" />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="成本价">
                  {getFieldDecorator('cost', {
                  initialValue: '',
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '输入成本价',
                  }],
                })(<Input type="number" placeholder="输入成本价" />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="客户是否需要发票">
                  {getFieldDecorator('isInvoiceClient', {
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
                <FormItem {...formItemLayout} label="税点">
                  {getFieldDecorator('taxClient', {
                    initialValue: '',
                  })(
                    <Select style={{ width: '90%' }} onChange={this.handleImpost} placeholder="选择税点">
                      <Option value="3">3%</Option>
                      <Option value="6">6%</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="渠道方是否有发票">
                  {getFieldDecorator('isInvoiceRouter', {
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
                <FormItem {...formItemLayout} label="税点">
                  {getFieldDecorator('taxRouter', {
                    initialValue: '',
                  })(
                    <Select style={{ width: '90%' }} onChange={this.handleChannelImpost} placeholder="选择税点">
                      <Option value="3">3%</Option>
                      <Option value="6">6%</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="税款">
                  {getFieldDecorator('impost', {
                  initialValue: '',
                })(<Input type="number" placeholder="税款" />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="渠道税款">
                  {getFieldDecorator('channelImpost', {
                  initialValue: '',
                })(<Input type="number" placeholder="渠道税款" />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24} pull={4}>
                <FormItem {...formItemLayout} label="返点">
                  {getFieldDecorator('rebate', {
                  initialValue: '',
                })(<Input type="number" placeholder="输入返点" />)}
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
