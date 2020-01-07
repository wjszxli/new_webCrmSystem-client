import React, { Fragment } from 'react';
import { Card, message, Button, Radio, Table, Divider,Pagination } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import style from './Account.less';

import request from 'utils/request'
import config from 'utils/config'

import AddAccount from './addAccount';

export default class Customer extends React.Component {
  state = {
    visible: false,
    listData:[],
    current:1,
    pageSize: 10,
    dataCount: 0,
    editData: {},
    isAdd: false,
    isAuth: false
  };

  async componentDidMount() {
    await this.isAuth()
    const { isAuth } = this.state
    if (!isAuth) {
      window.location.href = '/#/exception/403'
    } else {
      this.getPageData(1)
    }
  }
  async isAuth(){
    const id = localStorage.getItem('id')
    if (!id) {
      window.location.href = '/#/login/logout'
      return
    }
    const url = `${config.apiUrl}/isAuthor?user=${id}&author=master`
    const res = await request(url)
    if (res) {
      if (res.code === 0){
        console.log('res.data.tip', res.data.tip)
        if (res.data.tip) {
          this.setState({isAuth:true})
        }
      }else{
        message.error(res.error);
      }
    }
  }
  getOneUser = (id) => {
    let url = `${config.apiUrl}/getOneUser?id=${id}`
    request(url).then(res => {
      if (res) {
        if (res.code === 0){
          this.setState({
            editData:res.data,
            visible: true,
            isAdd: false
          })
        }else{
          message.error(res.error);
        }
      }
    })
  }
  getPageData = (pageIndex) => {
    // 获取分页的数据
    let url = `${config.apiUrl}/getUserInfo?pageSize=10&pageIndex=${pageIndex}`
    request(url).then(res => {
      if (res) {
        if (res.code === '0'){
          this.setState({
            listData:res.data
          })
        }else{
          message.error(res.error);
        }
      }
    })
    // 获取数据条数
    url = `${config.apiUrl}/getUserCount`
    request(url).then(res => {
      if (res) {
        if (res.code === '0'){
          this.setState({
            dataCount: res.data[0].count
          })
        }else{
          message.error(res.error);
        }
      }
    })
  }
  onChange = (page) => {
    this.setState({
      current: page,
    });
    this.getPageData(page)
  }
  handleCancel = () => {
    this.setState({ visible: false });
  };
  deleteData = (record) =>{
    const url = `${config.apiUrl}/deleteUser`
    const options = {
      method:'POST',
      body: {
        id: record.id,
        isDelete: 1
      }
    }
    request(url, options).then(res => {
      if (res) {
        if (res.code === '0'){
          message.success(res.data.tip);
          this.getPageData(1)
        }else{
          message.error(res.error);
        }
      }
    })
  }
  addData = () => {
    this.setState({ visible: true,isAdd: true });
  };
  render() {
    const columns = [
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '手机号',
        dataIndex: 'phone',
        key: 'phone',
      },
      {
        title: '部门',
        dataIndex: 'dept',
        key: 'dept',
      },
      {
        title: '职位',
        dataIndex: 'job',
        key: 'job',
      },
      {
        title: '操作',
        render: (text, record) => (
          <Fragment>
            <a onClick={() => { this.getOneUser(record.id)}} >编辑</a>
            <Divider type="vertical" />
            <a onClick={() => { this.deleteData(record) }} >删除</a>
          </Fragment>
        ),
      },
    ];

    const data = this.state.listData
    return (
      <PageHeaderLayout title="账号管理">
        <Card bordered={false}>
          <div className={style.tableList}>
          {
            this.state.visible && <AddAccount
            visible={this.state.visible}
            editData={this.state.editData}
            isAdd={this.state.isAdd}
            onCancel={this.handleCancel}
            getPageData={this.getPageData}
          />
          }
            <div className={style.tableListOperator}>
              <Button icon="plus" type="primary" onClick={this.addData}>
                新增账号
              </Button>
              <Table columns={columns} rowKey="id" dataSource={data} pagination={false} />
              <Pagination style={{marginTop:"10px"}} current={this.state.current} onChange={this.onChange} pageSize={10} total={this.state.dataCount} />
            </div>
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
