import React, { Fragment } from 'react';
import { Card, Form, Row, Col, Input, Button, Select, Radio, Table, Divider, Pagination, message } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import style from './customer.less';

import AddCustomer from './addCustomer';
import AddRemark from './addRemark'

import request from 'utils/request'
import config from 'utils/config'

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;

export default Form.create()(
class Customer extends React.Component {
  state = {
    visible: false,
    isAdd: false,
    listData:[],
    current:1,
    pageSize: 10,
    dataCount: 0,
    editData:{},
    visibleRemark: false,
    isSell: false,
    isCharge: false,
    isMaster: false
  };

  async componentDidMount() {
    const sell = await this.isAuth('sell')
    if (sell) {
      if (sell.code === 0) {
        if (sell.data.tip) {
          this.setState({isSell:true})
        }
      }
    }
    const charge = await this.isAuth('charge')
    if (charge) {
      if (charge.code === 0) {
        if (charge.data.tip) {
          this.setState({isCharge:true})
        }
      }
    }
    const master = await this.isAuth('master')
    if (master) {
      if (master.code === 0) {
        if (master.data.tip) {
          this.setState({isMaster:true})
        }
      }
    }
    const { isSell, isCharge, isMaster } = this.state
    if (!isSell && !isCharge && !isMaster) {
      window.location.href = '/#/exception/403'
      return
    }
    this.getPageData(1)
  }
  async isAuth(author){
    const id = localStorage.getItem('id')
    if (!id) {
      window.location.href = '/#/login/logout'
      return
    }
    const url = `${config.apiUrl}/isAuthor?user=${id}&author=${author}`
    const res = await request(url)
    return res
    // if (res) {
    //   if (res.code === 0){
    //     console.log('res.data.tip', res.data.tip)
    //     if (res.data.tip) {
    //       this.setState({isAuth:true})
    //     }
    //   }else{
    //     message.error(res.error);
    //   }
    // }
  }
  onChange = (page) => {
    this.setState({
      current: page,
    });
    this.getPageData(page)
  }
  deleteData = (record) =>{
    const url = `${config.apiUrl}/deleteCustomer`
    const options = {
      method:'POST',
      body: {
        id: record.id,
        isDelete: 1
      }
    }
    request(url, options).then(res => {
      if (res) {
        if (res.code === 0){
          message.success(res.data.tip);
          this.getPageData(1)
        }else{
          message.error(res.error);
        }
      }
    })
  }
  getPageData = (pageIndex, searchData) => {
    const { isSell, isCharge, isMaster } = this.state

    let searchItem = ""
    if (searchData) {
      const keys = Object.keys(searchData)
      keys.forEach(item => {
        searchItem += `&${item}=${searchData[item]}`
      })
    }
    const userId =localStorage.getItem('id')
    if (userId) {
      searchItem += `&userId=${userId}`
    }
    let tag = ''
    if (isMaster) {
      tag = 'all'
    } else if (isCharge) {
      tag = 'dept'
    } else if (isSell) {
      tag = 'self'
    }
    searchItem += `&tag=${tag}`
    // 获取分页的数据
    let url = `${config.apiUrl}/getCustomer?isDelete=0&pageSize=10&pageIndex=${pageIndex}${searchItem}`
    request(url).then(res => {
      if (res) {
        if (res.code === 0){
          this.setState({
            listData:res.data
          })
        }else{
          message.error(res.error);
        }
      }
    })
    // 获取数据条数
    url = `${config.apiUrl}/getCustomerCount?isDelete=0${searchItem}`
    request(url).then(res => {
      console.log('res', res)
      if (res) {
        if (res.code === 0){
          this.setState({
            dataCount: res.data[0].count
          })
        }else{
          message.error(res.error);
        }
      }
    })
  }
  getOneCustomer = async (id) => {
    let url = `${config.apiUrl}/getOneCustomer?id=${id}`
    const res = await request(url)
    if (res) {
      if (res.code === 0){
        this.setState({
          editData:res.data,
          isAdd: false
        })
      }else{
        message.error(res.error);
      }
    }
  }
  lookDetail= async (id)=> {
    await this.getOneCustomer(id)
    this.setState({visible: true})
  }
  handleCancel = () => {
    this.setState({ visible: false });
  };
  closeModel = () => {
    this.setState({ visibleRemark: false });
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
  handleFormReset = () => {
    const { form } = this.props;
    form.resetFields()
    this.getPageData(1)
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
                <RadioGroup  name="radiogroup">
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

  addData = () => {
    this.setState({ visible: true,isAdd: true });
  };

  follow = async (id) => {
   await this.getOneCustomer(id,{visibleRemark: true})
   this.setState({
    visibleRemark: true
   })
  }
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
          <span>{ Number(record) === 1 ?'已合作':'未合作' }</span>
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
            <a onClick={() => { this.follow(record.id)}}>跟进</a>
            <Divider type="vertical" />
            <a onClick={() => { this.deleteData(record) }} >删除</a>
            <Divider type="vertical" />
            <a onClick={() => { this.lookDetail(record.id) }} >查看详情</a>
          </Fragment>
        ),
      },
    ];

    return (
      <PageHeaderLayout title="客户录入">
        <Card bordered={false}>
        {
          this.state.visible && <AddCustomer
          visible={this.state.visible}
          onCancel={this.handleCancel}
          getPageData={this.getPageData}
          editData={this.state.editData}
          isAdd={this.state.isAdd}
        />
        }
        {
          this.state.visibleRemark && <AddRemark
          visibleRemark={this.state.visibleRemark}
          onCancel={this.closeModel}
          getPageData={this.getPageData}
          editData={this.state.editData}
          isAdd={this.state.isAdd}
        />
        }
          <div className={style.tableList}>
            <div className={style.tableListForm}>{this.searchArea()}</div>
            <div className={style.tableListOperator}>
              <Button icon="plus" type="primary" onClick={this.addData}>
                录入客户
              </Button>
              <Table columns={columns} rowKey="id" dataSource={this.state.listData} pagination={false} />
              <Pagination style={{marginTop:"10px"}} current={this.state.current} onChange={this.onChange} pageSize={10} total={this.state.dataCount} />
            </div>
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
})
