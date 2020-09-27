import React from 'react';
import { Table, Card, Form, Row, Col, Input, Button, Select, message, DatePicker, Pagination, Popover } from 'antd';
import { export_table_to_excel } from 'utils/ExportExcel'
import math from 'mathjs';

import moment from 'moment'

import request from 'utils/request'
import config from 'utils/config'
import AddPlan from '../Resource/addPlan'
import AddFinance from './addFinance'
import style from './havaPlan.less';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

const mathConfig = {
  number: 'BigNumber',
  precision: 20,
}
math.create(mathConfig, math.all)

export default Form.create()(
  class Customer extends React.Component {
    state = {
      visible: false,
      listData: [],
      current: 1,
      pageSize: 10,
      dataCount: 0,
      selectedRowKeys: [],
      editData: {},
      isAdd: false,
      isPay: 0,
      isBack: 0,
      visibleRemark: false,
      isMaster: false,
      isFinance: false, // 财务权限  财务和管理员有
      isMedium: false,
      isCharge: false,
      isSell: false,
      user: [],
      totalData: [],
    };

    async componentDidMount() {
      // 管理员权限
      await this.getAuth('master', 'isMaster')
      // 财务权限
      await this.getAuth('finance', 'isFinance')

      // 媒介权限
      await this.getAuth('medium', 'isMedium')
      // 主管权限
      await this.getAuth('charge', 'isCharge')
      // 销售权限
      await this.getAuth('sell', 'isSell')
      const { isMaster, isFinance, isMedium, isCharge, isSell } = this.state
      console.log(isMaster, isFinance, isMedium, isCharge, isSell)
      this.getPageData(this.state.current)

      const url = `${config.apiUrl}/getAllUserInfo`
      const options = {
        method: 'get',
      }
      const res = await request(url, options)
      if (res) {
        if (res.code === 0) {
          this.setState({
            user: res.data,
          })
        } else {
          message.error(res.error);
        }
      }
    }

    async getAuth(auth, data) {
      const res = await this.isAuth(auth)
      if (res) {
        if (res.code === 0) {
          if (res.data.tip) {
            this.setState({ [data]: true })
          }
        } else {
          message.error(res.error);
        }
      }
    }

    async isAuth(auth) {
      const id = localStorage.getItem('id')
      if (!id) {
        window.location.href = '/#/login/logout'
        return
      }
      const url = `${config.apiUrl}/isAuthor?user=${id}&author=${auth}`
      const res = await request(url)
      return res
    }

    onSelectChange = (selectedRowKeys) => {
      this.setState({
        selectedRowKeys: [],
      })
      this.setState({ selectedRowKeys });
      this.handleSelectPay(selectedRowKeys)
    }

    handleSelectPay(selectedRowKeys) {
      const { listData } = this.state
      const index = listData.findIndex(val => val.id === selectedRowKeys[0])
      if (index !== -1) {
        const item = listData[index]
        this.setState({
          isPay: item.isPay,
        })
        this.setState({
          isBack: item.isBack,
        })
      }
    }

    handleCancel = () => {
      this.setState({ visible: false });
    };

    getPageData = (pageIndex) => {
      let searchData = localStorage.getItem('value')
      try {
        searchData = JSON.parse(searchData)
      } catch (error) {
        console.log('error', error)
      }

      let searchItem = ""
      if (searchData) {
        const keys = Object.keys(searchData)
        keys.forEach(item => {
          const val = this.Trim(searchData[item])
          searchItem += `&${item}=${val}`
        })
      }
      if (searchData && searchData.createTime) {
        searchItem += `&startTime=${moment(searchData.createTime[0]).format('YYYY-MM-DD')}`
        searchItem += `&endTime=${moment(searchData.createTime[1]).format('YYYY-MM-DD')}`
      }
      if (searchData && searchData.backTime.length) {
        console.log('searchData.backTime', searchData.backTime)
        searchItem += `&backTimeStartTime=${moment(searchData.backTime[0]).format('YYYY-MM-DD')}`
        searchItem += `&backTimeEndTime=${moment(searchData.backTime[1]).format('YYYY-MM-DD')}`
      }
      if (searchData && searchData.inTime.length) {
        console.log('searchData.inTime', searchData.inTime)

        searchItem += `&inTimeStartTime=${moment(searchData.inTime[0]).format('YYYY-MM-DD')}`
        searchItem += `&inTimeEndTime=${moment(searchData.inTime[1]).format('YYYY-MM-DD')}`
      }
      const userId = localStorage.getItem('id')
      if (userId) {
        searchItem += `&userId=${userId}`
      }
      const { isSell, isCharge, isMaster, isMedium } = this.state

      let tag = ''
      if (isMaster) {
        tag = 'all'
      } else if (isCharge) {
        tag = 'dept'
      } else if (isSell) {
        tag = 'self'
      } else if (isMedium) {
        tag = 'medium'
      }
      searchItem += `&tag=${tag}`
      // 获取分页的数据
      let url = `${config.apiUrl}/getPlan?pageSize=10&isDelete=0&pageIndex=${pageIndex}${searchItem}`
      request(url).then(res => {
        if (res) {
          if (res.code === 0) {
            this.setState({
              listData: res.data,
            })
            this.handleSelectPay(this.state.selectedRowKeys)
          } else {
            message.error(res.error);
          }
        }
      })

      // 获取数据条数
      url = `${config.apiUrl}/getPlanCount?isDelete=0${searchItem}`
      request(url).then(res => {
        if (res) {
          if (res.code === 0) {
            this.setState({
              dataCount: res.data[0].count,
            })
          } else {
            message.error(res.error);
          }
        }
      })

      // 获取总统计数据
      url = `${config.apiUrl}/getPlanAllSum?${searchItem}`
      request(url).then(res => {
        if (res) {
          if (res.code === 0) {
            this.setState({
              totalData: res.data,
            })
          } else {
            message.error(res.error);
          }
        }
      })
    }

    searchData = () => {
      this.props.form.validateFields((error, value) => {
        if (error) {
          return
        }
        const valueString = JSON.stringify(value)
        window.localStorage.setItem('value', valueString)
        this.getPageData(this.state.current)
        this.setState({
          current: 1,
          selectedRowKeys: [],
        });
      })
    }

    handleFormReset = () => {
      const { form } = this.props;
      form.resetFields()
      window.localStorage.setItem('value', "")
      this.getPageData(this.state.current)
    }

    searchArea() {
      const { getFieldDecorator } = this.props.form;
      const options = this.state.user.map(d => <Option value={d.id}>{d.name}</Option>);

      return (
        <Form>
          <Row>
            <Col md={8} sm={24}>
              <FormItem label="排期搜索">
                {getFieldDecorator('publicNumber', {
                  initialValue: '',
                })(<Input placeholder="可搜索id、客户、公众号" style={{ width: '90%' }} />)}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="选择排期人">
                {getFieldDecorator('planPeople', {
                  initialValue: '',
                })(
                  <Select style={{ width: '90%' }} placeholder="选择类型搜索">
                    {options}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="回款状态">
                {getFieldDecorator('isBack', {
                  initialValue: '',
                })(
                  <Select style={{ width: '90%' }} placeholder="选择类型搜索">
                    <Option value="0">未回款</Option>
                    <Option value="1">已回款</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={8} sm={24}>
              <FormItem label="支付状态">
                {getFieldDecorator('isPay', {
                  initialValue: '',
                })(
                  <Select style={{ width: '90%' }} placeholder="选择类型搜索">
                    <Option value="0">未支付</Option>
                    <Option value="1">已支付</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="创建时间">
                {getFieldDecorator('createTime', {
                  initialValue: '',
                })(
                  <RangePicker style={{ width: '90%' }} />
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="备注">
                {getFieldDecorator('remark', {
                  initialValue: '',
                })(
                  <Input placeholder="输入备注搜索" style={{ width: '90%' }} />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={8} sm={24}>
              <FormItem label="财务备注">
                {getFieldDecorator('financeReamrk', {
                  initialValue: '',
                })(
                  <Input placeholder="输入财务备注搜索" style={{ width: '90%' }} />
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="回款时间">
                {getFieldDecorator('backTime', {
                  initialValue: '',
                })(
                  <RangePicker style={{ width: '90%' }} />
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="投放时间">
                {getFieldDecorator('inTime', {
                  initialValue: '',
                })(
                  <RangePicker style={{ width: '90%' }} />
                )}
              </FormItem>
            </Col>
          </Row>
          <div style={{ overflow: 'hidden' }}>
            <span style={{ float: 'right', marginBottom: 24 }}>
              <Button type="primary" htmlType="submit" onClick={this.searchData}>
                查询
            </Button>
              <Button type="primary" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
            </Button>
            </span>
          </div>
        </Form>
      );
    }

    deleteData = () => {
      const { selectedRowKeys } = this.state
      if (selectedRowKeys.length > 0) {
        const url = `${config.apiUrl}/deletePlan`
        const options = {
          method: 'POST',
          body: {
            ids: selectedRowKeys,
            isDelete: 1,
          },
        }
        request(url, options).then(res => {
          if (res) {
            if (res.code === 0) {
              message.success(res.data.tip);
              this.getPageData(this.state.current)
            } else {
              message.error(res.error);
            }
          }
        })
      } else {
        message.error('请选中相应的数据进行操作')
      }
    }

    updatePlan = (type) => {
      const { selectedRowKeys, listData } = this.state
      let title = ''
      for (let i = 0; i < selectedRowKeys.length; i++) {
        for (let j = 0; j < listData.length; j++) {
          if (selectedRowKeys[i] === listData[j].id) {
            if (title) {
              if (title !== listData[j].customerName) {
                message.error("请选择同一客户操作");
                return
              }
            } else {
              title = listData[j].customerName
            }
          }
        }
      }
      let url = ''
      const body = { ids: selectedRowKeys }
      if (type === 'pay') {
        url = `${config.apiUrl}/updatePlanPay`
        body.type = this.state.isPay
      }
      if (type === 'back') {
        url = `${config.apiUrl}/updatePlanBack`
        body.type = this.state.isBack
      }
      const options = {
        method: 'POST',
        body,
      }
      request(url, options).then(res => {
        if (res) {
          if (res.code === 0) {
            message.success(res.data.tip);
            this.getPageData(this.state.current)
          } else {
            message.error(res.error);
          }
        }
      })
    }

    updatePlanBack = () => {
      this.updatePlan('back')
    }

    updatePlanPay = () => {
      this.updatePlan('pay')
    }

    getOneUser = async () => {
      const { selectedRowKeys, isMedium, listData } = this.state
      if (selectedRowKeys.length === 0) {
        message.error('请选中数据进行操作')
        return
      }
      if (selectedRowKeys.length !== 1) {
        message.error('只允许一次修改一条数据')
        return
      }
      const id = selectedRowKeys[0]
      const dataUserId = listData.filter(item => item.id === id)[0].userId
      const userId = window.localStorage.getItem('id')
      if (userId !== dataUserId && isMedium) {
        message.error("只允许修改自己的数据哦")
        return false
      }
      const url = `${config.apiUrl}/getOnePlan?id=${selectedRowKeys[0]}`
      const res = await request(url)
      if (res) {
        if (res.code === 0) {
          if (res.data[0].inTime) {
            res.data[0].inTime = moment.unix(res.data[0].inTime)
          }
          this.setState({
            editData: res.data,
            // visible: true,
            isAdd: false,
          })
        } else {
          message.error(res.error);
        }
      }
    }

    changePageData = (page) => {
      this.setState({
        current: page,
        selectedRowKeys: [],
      });
      this.props.form.validateFields((error, value) => {
        this.getPageData(page, value)
      })
    }

    addFinanceFunction = async () => {
      await this.getOneUser()
      this.setState({
        visibleRemark: true,
      })
    }

    modify = async () => {
      await this.getOneUser()
      this.setState({
        visible: true,
      })
    }

    Trim = (str) => {
      return str.replace(/(^\s*)|(\s*$)/g, "");
    }

    toExport = () => {
      this.props.history.push('/exportAll')
    }

    buttonArea() {
      const phone = window.localStorage.getItem('phone')
      const isBoss = phone === '15168248050'

      return (
        <div style={{ marginBottom: '10px' }}>
          {
            (this.state.isMaster || this.state.isCharge || this.state.isSell) && (
              <span>
                <Button type="primary" onClick={this.modify}>
                  修改
                </Button>
              </span>
            )}
          {
            isBoss && <Button type="primary" onClick={this.deleteData}>删除</Button>
          }
          <Button type="primary" onClick={this.exportExcel}>
            导出EXCEL
        </Button>
          {
            (this.state.isMaster || this.state.isFinance) && (
              <span>
                <Button type="primary" onClick={this.updatePlanBack}>
                  {this.state.isBack === 1 ? '撤销回款' : '勾选回款'}
                </Button>
                <Button type="primary" onClick={this.updatePlanPay}>
                  {this.state.isPay === 1 ? '撤销支付' : '勾选支付'}
                </Button>
                <Button type="primary" onClick={this.addFinanceFunction}>
                  财务备注
                </Button>
                <Button type="primary" onClick={this.toExport}>
                  导出所有排期
                </Button>
              </span>
            )}

        </div>
      )
    }

    showModal = () => {
      this.setState({ visible: true });
    };

    exportExcel = () => {
      export_table_to_excel('tables')
    }

    closeModel = () => {
      this.setState({ visibleRemark: false });
    }

    render() {
      const { selectedRowKeys, totalData } = this.state;
      const { price, cost, profit } = totalData

      const rowSelection = {
        selectedRowKeys,
        onChange: this.onSelectChange,
      };

      const columns = [
        {
          title: '排期ID',
          dataIndex: 'id',
          key: 'id',
        },
        {
          title: '客户名称',
          dataIndex: 'customerName',
          key: 'customerName',
        },
        {
          title: '投放公众号',
          dataIndex: 'publicNumber',
          key: 'publicNumber',
        },
        {
          title: '位置',
          dataIndex: 'location',
          key: 'location',
          render: location => {
            let tip = '其他'
            switch (location) {
              case 'top':
                tip = '头条'
                break;
              case 'second':
                tip = '次条'
                break;
              case 'other':
                tip = '其他条'
                break;
              case 'last':
                tip = '末条'
                break;
              default:
                tip = '末条'
            }
            return (
              <div>{tip}</div>
            )
          },
        },
        {
          title: '投放时间',
          dataIndex: 'inTime',
          key: 'inTime',
          render: time => {
            const showTime = moment.unix(time).format('YYYY-MM-DD')
            return (
              <div>{showTime}</div>
            )
          },
        },
        {
          title: '报价',
          dataIndex: 'price',
          key: 'price',
        },
        {
          title: '成本价',
          dataIndex: 'cost',
          key: 'cost',
        },
        {
          title: '税款',
          dataIndex: 'impost',
          key: 'impost',
        },
        {
          title: '渠道税款',
          dataIndex: 'channelImpost',
          key: 'channelImpost',
        },
        {
          title: '返点',
          dataIndex: 'rebate',
          key: 'rebate',
        },
        {
          title: '利润',
          dataIndex: 'profit',
          key: 'profit',
          render: (text, cord) => {
            const profit = math.round(math.eval(cord.price - cord.cost - cord.impost + cord.channelImpost - cord.rebate), 2)
            return (
              <div>{profit}</div>
            )
          },
        },
        {
          title: '利润率',
          dataIndex: 'profitmargin',
          key: 'profitmargin',
          render: (text, cord) => {
            const profit = math.round(math.eval(cord.price - cord.cost - cord.impost + cord.channelImpost - cord.rebate), 2)
            const profitmargin = math.round(math.eval(profit / cord.price), 2)
            return (
              <div>{profitmargin}</div>
            )
          },
        },
        {
          title: '备注',
          dataIndex: 'remark',
          key: 'remark',
        },
        {
          title: '财务备注',
          dataIndex: 'financeReamrk',
          key: 'financeReamrk',
          render: val => {
            const str = val || ''
            return (
              <Popover content={val}>{str.length > 10 ? `${str.substr(0, 10)}...` : str}</Popover>
            )
          },
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          key: 'createTime',
          render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
        },
        {
          title: '是否回款',
          dataIndex: 'isBack',
          key: 'isBack',
          render: val => <span>{val === 0 ? '否' : '是'}</span>,
        },
        {
          title: '是否支付',
          dataIndex: 'isPay',
          key: 'isPay',
          render: val => <span>{val === 0 ? '否' : '是'}</span>,
        },
        {
          title: '排期人',
          dataIndex: 'planPeople',
          key: 'planPeople',
        },
        // {
        //   title: '跟进渠道',
        //   dataIndex: 'status',
        //   key: 'status',
        // },
      ];

      return (
        <PageHeaderLayout title="公众号排期">
          <Card bordered={false}>
            <div className={style.tableList}>
              <div className={style.tableListForm}>{this.searchArea()}</div>
              {
                this.state.visible && (
                  <AddPlan
                    visible={this.state.visible}
                    editData={this.state.editData}
                    isAdd={this.state.isAdd}
                    onCancel={this.handleCancel}
                    getPageData={this.getPageData}
                  />
                )
              }
              {
                this.state.visibleRemark && (
                  <AddFinance
                    visibleRemark={this.state.visibleRemark}
                    onCancel={this.closeModel}
                    getPageData={this.getPageData}
                    editData={this.state.editData}
                    isAdd={this.state.isAdd}
                    current={this.state.current}
                    selectedRowKeys={this.state.selectedRowKeys[0]}
                  />
                )
              }
              <div className={style.tableListOperator}>
                {this.buttonArea()}
                <div style={{ margin: "10px", color: 'red' }}>总报价:{price}    总成本:{cost}     总利润:{profit}</div>
                <Table id="tables" rowSelection={rowSelection} rowKey="id" columns={columns} dataSource={this.state.listData} pagination={false} />
                <Pagination style={{ marginTop: "10px" }} current={this.state.current} onChange={this.changePageData} pageSize={10} total={this.state.dataCount} />
              </div>
            </div>
          </Card>
        </PageHeaderLayout>
      );
    }
  })
