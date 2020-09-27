import React, { Fragment } from 'react';
import { Card, Form, Row, Col, Input, Button, Select, Radio, Table, Divider, Pagination, message } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import style from './publicResource.less';

import request from 'utils/request'
import config from 'utils/config'

import AddCustomer from '../Customer/addCustomer';


const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;

export default Form.create()(
  class Customer extends React.Component {
    state = {
      listData: [],
      current: 1,
      pageSize: 10,
      dataCount: 0,
      editData: {},
      visible: false,
    };

    componentDidMount() {
      this.getPageData(1)
    }
    onChange = (page) => {
      this.setState({
        current: page,
      });
      this.getPageData(page)
    }
    handleFormReset = () => {
      const { form } = this.props;
      form.resetFields()
      this.getPageData(1)
    }
    deleteData = (record) => {
      const url = `${config.apiUrl}/deleteCustomer`
      const options = {
        method: 'POST',
        body: {
          id: record.id,
          isDelete: 0
        }
      }
      request(url, options).then(res => {
        if (res) {
          if (res.code === 0) {
            message.success(res.data.tip);
            this.getPageData(1)
          } else {
            message.error(res.error);
          }
        }
      })
      console.log('record', record)
    }

    getPageData = (pageIndex, searchData) => {
      let searchItem = ""
      if (searchData) {
        const keys = Object.keys(searchData)
        keys.forEach(item => {
          const val = this.Trim(searchData[item])
          searchItem += `&${item}=${val}`
        })
      }
      // 获取分页的数据
      let url = `${config.apiUrl}/getCustomer?isDelete=1&pageSize=10&pageIndex=${pageIndex}${searchItem}`
      request(url).then(res => {
        if (res) {
          if (res.code === 0) {
            this.setState({
              listData: res.data
            })
          } else {
            message.error(res.error);
          }
        }
      })
      // 获取数据条数
      url = `${config.apiUrl}/getCustomerCount?isDelete=1${searchItem}`
      request(url).then(res => {
        if (res) {
          if (res.code === 0) {
            this.setState({
              dataCount: res.data[0].count
            })
          } else {
            message.error(res.error);
          }
        }
      })
    }
    Trim = (str) => {
      return str.replace(/(^\s*)|(\s*$)/g, "");
    }
    searchData = () => {
      const that = this
      this.props.form.validateFields((error, value) => {
        if (!!error) {
          return
        }
        this.getPageData(1, value)
      })
    }
    getOneCustomer = (id) => {
      let url = `${config.apiUrl}/getOneCustomer?id=${id}`
      request(url).then(res => {
        if (res) {
          if (res.code === 0) {
            this.setState({
              editData: res.data,
              visible: true,
              isAdd: false
            })
          } else {
            message.error(res.error);
          }
        }
      })
    }
    searchArea() {
      const { getFieldDecorator } = this.props.form;
      return (
        <Form>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={8} sm={24}>
              <FormItem label="客户搜索">
                {getFieldDecorator('customer', {
                  initialValue: '',
                })(<Input placeholder="可搜索公司/品牌名称" />)}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="跟进人">
                {getFieldDecorator('people', {
                  initialValue: '',
                })(
                  <Select style={{ width: 150 }} placeholder="选择跟进人搜索">
                    <Option value="jack">Jack</Option>
                    <Option value="lucy">Lucy</Option>
                    <Option value="Yiminghe">yiminghe</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="是否合作">
                {getFieldDecorator('isCollaborate', {
                  initialValue: '',
                })(
                  <RadioGroup name="radiogroup">
                    <Radio value={1}>是</Radio>
                    <Radio value={0}>否</Radio>
                  </RadioGroup>
                )}
              </FormItem>
            </Col>
          </Row>
          <div style={{ overflow: 'hidden' }}>
            <span style={{ float: 'right', marginBottom: 24 }}>
              <Button type="primary" htmlType="submit" onClick={this.searchData} >
                查询
          </Button>
              <Button type="primary" style={{ marginLeft: 8 }} onClick={this.handleFormReset} >
                重置
          </Button>
            </span>
          </div>
        </Form>
      );
    }
    handleCancel = () => {
      this.setState({ visible: false });
    };
    render() {

      const columns = [
        {
          title: '公司名称',
          dataIndex: 'companyName',
          key: 'companyName',
        },
        {
          title: '客户品牌',
          dataIndex: 'brand',
          key: 'brand',
        },
        {
          title: '联系人',
          dataIndex: 'connect',
          key: 'connect',
        },
        {
          title: '电话',
          dataIndex: 'phone',
          key: 'phone',
        },
        {
          title: '微信',
          dataIndex: 'webchat',
          key: 'webchat',
        },
        {
          title: 'qq',
          dataIndex: 'qq',
          key: 'qq',
        },
        {
          title: '是否合作',
          dataIndex: 'isCollaborate',
          key: 'isCollaborate',
          render: (record) => (
            <span>{record === '1' ? '已合作' : '未合作'}</span>
          ),
        },
        {
          title: '跟进人',
          dataIndex: 'people',
          key: 'people',
        },
        {
          title: '操作',
          render: (record) => (
            <Fragment>
              <Divider type="vertical" />
              <a onClick={() => { this.deleteData(record) }} >捡起</a>
              <Divider type="vertical" />
              <a onClick={() => { this.getOneCustomer(record.id) }} >查看详情</a>
            </Fragment>
          ),
        },
      ];

      return (
        <PageHeaderLayout title="公共资源库">
          {
            this.state.visible && <AddCustomer
              visible={this.state.visible}
              onCancel={this.handleCancel}
              getPageData={this.getPageData}
              editData={this.state.editData}
              isAdd={this.state.isAdd}
            />
          }
          <Card bordered={false}>
            <div className={style.tableList}>
              <div className={style.tableListForm}>{this.searchArea()}</div>
              <div className={style.tableListOperator}>
                <Table columns={columns} rowKey="id" dataSource={this.state.listData} pagination={false} />
                <Pagination style={{ marginTop: "10px" }} current={this.state.current} onChange={this.onChange} pageSize={10} total={this.state.dataCount} />
              </div>
            </div>
          </Card>
        </PageHeaderLayout>
      );
    }
  })
