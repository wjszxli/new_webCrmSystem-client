import React, { Fragment } from 'react';
import { Card, message, Button, Radio, Table, Divider,Pagination } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import style from './author.less';

import request from 'utils/request'
import config from 'utils/config'

import AddAuthor from './addAuthor';

export default class Customer extends React.Component {
  state = {
    visible: false,
    listData:[],
    current:1,
    pageSize: 10,
    dataCount: 0,
    editData: {},
    isAdd: false,
    id:'',
    isAuth:false
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
  isAuthor(){
    const url = `${config.apiUrl}/isAuthor?author=master&user`
    request(url).then(res => {
      if (res) {
        if (res.code === 0){
          console.log('res', res)
          this.setState({
            listData:res.data
          })
        }else{
          message.error(res.error);
        }
      }
    })
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
  toAuthor = (id) => {
    this.setState({
      visible: true,
      isAdd: false,
      id
    })
  }
  getPageData = (pageIndex) => {
    // 获取分页的数据
    let url = `${config.apiUrl}/getAuthor?pageSize=10&pageIndex=${pageIndex}`
    request(url).then(res => {
      if (res) {
        if (res.code === 0){
          console.log('res', res)
          this.setState({
            listData:res.data
          })
        }else{
          message.error(res.error);
        }
      }
    })
    // 获取数据条数
    url = `${config.apiUrl}/getAuthorCount`
    request(url).then(res => {
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
        title: '权限ID',
        dataIndex: 'author',
        key: 'author',
      },
      {
        title: '说明',
        dataIndex: 'remark',
        key: 'remark',
      },
      {
        title: '操作',
        render: (text, record) => (
          <Fragment>
            <a onClick={() => { this.toAuthor(record.id)}} >授权</a>
          </Fragment>
        ),
      },
    ];

    const data = this.state.listData
    return (
      <PageHeaderLayout title="权限管理">
        <Card bordered={false}>
          <div className={style.tableList}>
          {
            this.state.visible && <AddAuthor
            visible={this.state.visible}
            editData={this.state.editData}
            isAdd={this.state.isAdd}
            onCancel={this.handleCancel}
            getPageData={this.getPageData}
            id={this.state.id}
          />
          }
            <div className={style.tableListOperator}>
              <Table columns={columns} rowKey="id" dataSource={data} pagination={false} />
              <Pagination style={{marginTop:"10px"}} current={this.state.current} onChange={this.onChange} pageSize={10} total={this.state.dataCount} />
            </div>
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
