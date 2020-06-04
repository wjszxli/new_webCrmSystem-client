import React from 'react';
import {
  Table, Badge, Menu, Dropdown, Icon, Card, Form, Row, Col, Input, Button,
  Select, message, Pagination, Upload, Popover,
} from 'antd';
import { export_table_to_excel } from 'utils/ExportExcel'
import XLSX from 'xlsx'
import moment from 'moment';
import request from 'utils/request'
import config from 'utils/config'
import AddPlan from './addPlan'
import AddStart from './addStart'
import AddDetail from './addDetail'
import Modify from './modify'


import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import style from './resource.less';

const menu = (
  <Menu>
    <Menu.Item>
      Action 1
    </Menu.Item>
    <Menu.Item>
      Action 2
    </Menu.Item>
  </Menu>
);

const FormItem = Form.Item;
const Option = Select.Option;
const InputGroup = Input.Group;

export default Form.create()(
  class Resource extends React.Component {
    state = {
      operation: 'add',
      listData: [],
      current: 1,
      pageSize: 10,
      dataCount: 0,
      visible: false,
      editData: {},
      isAdd: 'add',
      selectedRowKeys: [],
      selectId: '',
      visibleRemark: false,
      actionUrl: '',
      isShowStart: false,
      isShowModify: false,
      id: '',
      isMaster: false,
      isMedium: false,
      isCharge: false,
      isSell: false,
      user: [],
    }

    async componentDidMount() {
      // 管理员权限
      await this.getAuth('master', 'isMaster')
      // 媒介权限
      await this.getAuth('medium', 'isMedium')
      // 主管权限
      await this.getAuth('charge', 'isCharge')
      // 销售权限
      await this.getAuth('sell', 'isSell')
      this.props.form.validateFields((error, value) => {
        this.getPageData(1, value)
      })
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

    handleFormReset = () => {
      const { form } = this.props;
      form.resetFields()
      this.getPageData(1)
    }

    closeModel = () => {
      this.setState({ visibleRemark: false });
    }

    getPageData = (pageIndex, searchData) => {
      const { isSell, isCharge, isMaster, isMedium } = this.state

      let searchItem = ""
      if (searchData) {
        const keys = Object.keys(searchData)
        keys.forEach(item => {
          searchItem += `&${item}=${searchData[item]}`
        })
      }
      const userId = localStorage.getItem('id')
      if (userId) {
        searchItem += `&userId=${userId}`
      }
      let tag = ''
      if (isMaster || isCharge || isSell) {
        tag = 'all'
        // tag = 'dept'
      } else if (isMedium) {
        // tag = 'self'
        tag = 'all'
      }
      searchItem += `&tag=${tag}`
      console.log('=========searchItem', searchItem);

      // 获取分页的数据
      let url = `${config.apiUrl}/getPublicNumber?pageSize=10&pageIndex=${pageIndex}${searchItem}`
      request(url).then(res => {
        if (res) {
          console.log('res', res)
          if (res.code === 0) {
            this.setState({
              listData: res.data,
            })
          } else {
            message.error(res.error);
          }
        }
      })
      // 获取数据条数
      url = `${config.apiUrl}/getPublicNumberCount?${searchItem}`
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
    }

    getOnePublicNumber = async () => {
      const { selectedRowKeys } = this.state
      if (selectedRowKeys.length === 0) {
        message.error('请选中数据进行操作')
        return
      }
      if (selectedRowKeys.length !== 1) {
        message.error('只允许一次修改一条数据')
        return
      }
      const url = `${config.apiUrl}/getOnePublicNumber?id=${this.state.listData[selectedRowKeys[0]].id}`
      const res = await request(url)
      if (res) {
        if (res.code === 0) {
          console.log('res', res)
          this.setState({
            editData: res.data,
            isAdd: false,
          })
        } else {
          message.error(res.error);
        }
      }
    }

    fixdata = (data) => {
      let o = ''
      let l = 0
      const w = 10240
      for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)))
      o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)))
      return o
    }

    generateDate = ({ header, results }) => {
      header.map(val => {
        val = val.replace(/(^\s*)|(\s*$)/g, "")
      })
      results.forEach(item => {
        const data = {
          operation: this.state.operation,
        }
        Object.keys(item).forEach(val => {
          const oldVal = val
          val = val.replace(/(^\s*)|(\s*$)/g, "")
          switch (val) {
            case 'id':
              data.dataId = item[oldVal].replace(/\s+/g, "")
              break;
            case '公众号名称':
              data.name = item[oldVal].replace(/\s+/g, "")
              break;
            case '粉丝数':
              data.star = item[oldVal].replace(/\s+/g, "")
              break;
            case '头条成本':
              data.topCost = item[oldVal].replace(/\s+/g, "")
              break;
            case '次条刊例':
              data.secondTitle = item[oldVal].replace(/\s+/g, "")
              break;
            case '末条成本':
              data.lastCost = item[oldVal].replace(/\s+/g, "")
              break;
            case '次条成本':
              data.secondCost = item[oldVal].replace(/\s+/g, "")
              break;
            case '头条刊例':
              data.topTitle = item[oldVal].replace(/\s+/g, "")
              break;
            case '女粉比例':
              data.womenRatio = item[oldVal].replace(/\s+/g, "")
              break;
            case '末条刊例':
              data.lastTitle = item[oldVal].replace(/\s+/g, "")
              break;
            case '是否刷号':
              data.brush = item[oldVal].replace(/\s+/g, "")
              break;
            case '类型':
              data.type = item[oldVal].replace(/\s+/g, "")
              break;
            case '备注':
              data.remark = item[oldVal].replace(/\s+/g, "")
              break;
            case '联系方式':
              data.phone = item[oldVal].replace(/\s+/g, "")
              break;
            default:
          }
        })
        const url = `${config.apiUrl}/savePublicNumber`
        const updateRouter = localStorage.getItem('name')
        const userId = localStorage.getItem('id')
        if (updateRouter) {
          data.updateRouter = updateRouter
        }
        if (userId) {
          data.userId = userId
        }
        const options = {
          method: 'POST',
          body: data,
        }
        request(url, options).then(res => {
          if (res) {
            if (res.code === 0) {
              message.success(res.data.tip);
            } else {
              message.error(res.error);
            }
          }
        })
      })
    }

    get_header_row = (sheet) => {
      const headers = []
      const range = XLSX.utils.decode_range(sheet['!ref'])
      let C
      const R = range.s.r /* start in the first row */
      for (C = range.s.c; C <= range.e.c; ++C) { /* walk every column in the range */
        const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })] /* find the cell in the first row */
        let hdr = `UNKNOWN ${C}` // <-- replace with your desired default
        if (cell && cell.t) hdr = XLSX.utils.format_cell(cell)
        headers.push(hdr)
      }
      return headers
    }

    addDetail = async () => {
      await this.getOnePublicNumber()
      this.setState({
        visibleRemark: true,
      })
    }

    upload = (rawFile) => {
      this.refs.upload.value = null

      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => {
          const data = e.target.result
          const fixedData = this.fixdata(data)
          const workbook = XLSX.read(btoa(fixedData), { type: 'base64' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const header = this.get_header_row(worksheet)
          const results = XLSX.utils.sheet_to_json(worksheet)
          this.generateDate({ header, results })
          resolve()
        }
        reader.readAsArrayBuffer(rawFile)
      })
    }

    handleUpload = () => {
      this.setState({
        operation: 'add',
      })
      document.getElementById('excel-upload-input').click()
    }

    searchData = () => {
      this.props.form.validateFields((error, value) => {
        if (error) {
          return
        }
        this.getPageData(1, value)
        this.setState({
          current: 1,
          selectedRowKeys: [],
        });
      })
    }

    handleUploadUpdate = () => {
      this.setState({
        operation: 'update',
      })
      document.getElementById('excel-upload-input').click()
    }

    handleClick = (e) => {
      const files = e.target.files
      const rawFile = files[0] // only use files[0]
      if (!rawFile) return
      this.upload(rawFile)
    }

    searchArea() {
      const { getFieldDecorator } = this.props.form;
      const options = this.state.user.map(d => <Option value={d.name}>{d.name}</Option>);

      return (
        <Form>
          <Row>
            <Col md={8} sm={24}>
              <FormItem label="公众号">
                {getFieldDecorator('publicNumber', {
                  initialValue: '',
                })(<Input placeholder="输入公众号搜索" style={{ width: '90%' }} />)}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="类型">
                {getFieldDecorator('type', {
                  initialValue: '',
                })(
                  <Select style={{ width: '90%' }} placeholder="选择类型搜索">
                    <Option value="情感">情感</Option>
                    <Option value="资讯">资讯</Option>
                    <Option value="职场管理">职场管理</Option>
                    <Option value="财经">财经</Option>
                    <Option value="教育">教育</Option>
                    <Option value="时尚">时尚</Option>
                    <Option value="生活">生活</Option>
                    <Option value="文摘">文摘</Option>
                    <Option value="科技">科技</Option>
                    <Option value="体育">体育</Option>
                    <Option value="娱乐">娱乐</Option>
                    <Option value="搞笑趣闻">搞笑趣闻</Option>
                    <Option value="文化">文化</Option>
                    <Option value="招聘">招聘</Option>
                    <Option value="电影">电影</Option>
                    <Option value="三农">三农</Option>
                    <Option value="星座运势">星座运势</Option>
                    <Option value="摄影">摄影</Option>
                    <Option value="宗教">宗教</Option>
                    <Option value="收藏">收藏</Option>
                    <Option value="汽车">汽车</Option>
                    <Option value="美食">美食</Option>
                    <Option value="游戏动漫">游戏动漫</Option>
                    <Option value="萌宠">萌宠</Option>
                    <Option value="数码">数码</Option>
                    <Option value="军事">军事</Option>
                    <Option value="收藏">收藏</Option>
                    <Option value="健康">健康</Option>
                    <Option value="房产">房产</Option>
                    <Option value="旅游">旅游</Option>
                    <Option value="地方">地方</Option>
                    <Option value="其他">其他</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="粉丝区间">
                <InputGroup compact>
                  {getFieldDecorator('starS', {
                    initialValue: '',
                  })(
                    <Input style={{ width: 80, textAlign: 'center' }} placeholder="" />
                  )}
                  <Input style={{ width: 30, borderLeft: 0, pointerEvents: 'none', backgroundColor: '#fff' }} placeholder="~" disabled />
                  {getFieldDecorator('starE', {
                    initialValue: '',
                  })(
                    <Input style={{ width: 80, textAlign: 'center', borderLeft: 0 }} placeholder="" />
                  )}
                </InputGroup>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={8} sm={24}>
              <FormItem label="价格区间">
                <InputGroup compact>
                  {getFieldDecorator('priceS', {
                    initialValue: '',
                  })(
                    <Input style={{ width: 80, textAlign: 'center' }} placeholder="最低价" />
                  )}
                  <Input style={{ width: 30, borderLeft: 0, pointerEvents: 'none', backgroundColor: '#fff' }} placeholder="~" disabled />
                  {getFieldDecorator('priceE', {
                    initialValue: '',
                  })(
                    <Input style={{ width: 80, textAlign: 'center', borderLeft: 0 }} placeholder="最高价" />
                  )}
                </InputGroup>
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="刷号">
                {getFieldDecorator('brush', {
                  initialValue: '',
                })(
                  <Select style={{ width: '90%' }} placeholder="选择刷号搜索">
                    <Option value="全刷">全刷</Option>
                    <Option value="半刷">半刷</Option>
                    <Option value="不刷">不刷</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="女粉比例">
                <InputGroup compact>
                  {getFieldDecorator('womenRatioS', {
                    initialValue: '',
                  })(
                    <Input style={{ width: 80, textAlign: 'center' }} />
                  )}
                  <Input style={{ width: 30, borderLeft: 0, pointerEvents: 'none', backgroundColor: '#fff' }} placeholder="~" disabled />
                  {getFieldDecorator('womenRatioE', {
                    initialValue: '',
                  })(
                    <Input style={{ width: 80, textAlign: 'center', borderLeft: 0 }} />
                  )}
                </InputGroup>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={8} sm={24}>
              <FormItem label="排序">
                {getFieldDecorator('order', {
                  initialValue: '',
                })(
                  <Select style={{ width: '90%' }} placeholder="选择刷号搜索">
                    <Option value="star">粉丝数排序</Option>
                    <Option value="topCost">头条成本排序</Option>
                    <Option value="planCount">排期次数排序</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="更新渠道">
                {getFieldDecorator('updateRouter', {
                  initialValue: '',
                })(
                  <Select style={{ width: '90%' }} placeholder="选择更新渠道">
                    {options}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem label="备注">
                {getFieldDecorator('remark', {
                  initialValue: '',
                })(<Input placeholder="输入备注搜索" />)}
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

    excelTable = () => {
      export_table_to_excel('tables')
    }

    addData = () => {
      const { selectedRowKeys, listData } = this.state
      if (!selectedRowKeys.length) {
        message.error('请选择对应的公众号添加排期')
        return
      }
      if (selectedRowKeys.length > 1) {
        message.error('一次只允许对一个公众号添加排期')
        return
      }
      this.setState({
        visible: true,
        isAdd: true,
        selectId: listData[selectedRowKeys].id,
      });
    }

    imageUpdate = async () => {
      const { selectedRowKeys } = this.state
      if (!selectedRowKeys.length) {
        message.error('请选择对应的公众号')
        return
      }
      if (selectedRowKeys.length > 1) {
        message.error('一次只允许对一个公众号操作')
        return
      }
      await this.getOnePublicNumber()
      // document.getElementById('imageUpdate').click()
      const id = this.state.listData[this.state.selectedRowKeys[0]].id
      this.setState({
        isShowStart: true,
        id,
      })
    }

    showModify = async () => {
      const { selectedRowKeys } = this.state
      if (!selectedRowKeys.length) {
        message.error('请选择对应的公众号')
        return
      }
      if (selectedRowKeys.length > 1) {
        message.error('一次只允许对一个公众号操作')
        return
      }
      await this.getOnePublicNumber()
      const id = this.state.listData[this.state.selectedRowKeys[0]].id

      this.setState({
        isShowModify: true,
        id,
      })
    }

    deletePublicNumber = async () => {
      const { selectedRowKeys } = this.state
      if (!selectedRowKeys.length) {
        message.error('请选择对应的公众号')
        return
      }
      if (selectedRowKeys.length > 1) {
        message.error('一次只允许对一个公众号操作')
        return
      }
      const url = `${config.apiUrl}/deletePublicNumber?id=${this.state.listData[selectedRowKeys[0]].id}`
      const options = {
        method: 'POST',
      }
      const res = await request(url, options)
      if (res) {
        if (res.code === 0) {
          if (res.data.tip) {
            message.success(res.data.tip);
            this.getPageData(1)
            this.setState({
              selectedRowKeys: [],
            })
          }
        }
      }

    }

    deletePublicNumberMore = async () => {
      const { selectedRowKeys, listData } = this.state
      if (!selectedRowKeys.length) {
        message.error('请选择对应的公众号')
        return
      }

      let ids = ''
      selectedRowKeys.forEach(item => {
        ids += `${listData[item].id},`
      })
      ids = ids.substring(0, ids.length - 1)

      const url = `${config.apiUrl}/deletePublicNumberMore?ids=${ids}`
      const options = {
        method: 'POST',
      }
      const res = await request(url, options)
      if (res) {
        if (res.code === 0) {
          if (res.data.tip) {
            message.success(res.data.tip);
            this.getPageData(1)
            this.setState({
              selectedRowKeys: [],
            })
          }
        }
      }

    }

    closeModify = () => {
      this.setState({
        isShowModify: false,
      })
    }

    buttonArea() {
      const props = {
        name: 'file',
        action: this.state.actionUrl,
        headers: {
          authorization: 'authorization-text',
        },
        onChange(info) {
          if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
          }
          if (info.file.status === 'done') {
            message.success('粉丝属性上传成功');
          } else if (info.file.status === 'error') {
            message.error('粉丝属性上传失败');
          }
        },
      };
      return (
        <div style={{ marginBottom: '10px' }}>
          {
            (this.state.isMaster || this.state.isCharge || this.state.isSell) && (
              <span>
                <Button type="primary" onClick={this.addData}>
                  添加排期
                </Button>
                <Button type="primary" onClick={this.excelTable}>
                  导出EXCEL
                </Button>
              </span>
            )}
          {
            (this.state.isMaster || this.state.isCharge || this.state.isMedium) && (
              <span>
                <Button type="primary" onClick={this.imageUpdate}>
                  粉丝属性
                </Button>
                <Button type="primary" onClick={this.addDetail}>
                  投放详情
                </Button>
                <Button type="primary" onClick={this.handleUpload}>
                  上传新资源
                </Button>
                <Button type="primary" onClick={this.showModify}>
                  更新资源
                </Button>
                <Button type="primary" onClick={this.deletePublicNumber}>
                  删除
                </Button>
              </span>
            )}
          {
            this.state.isMaster && <span><Button type="primary" onClick={this.deletePublicNumberMore}>批量删除</Button></span>
          }
          <div style={{ display: 'none' }}>
            <Upload {...props}>
              <Button id="imageUpdate">上传</Button>
            </Upload>
          </div>
        </div>
      )
    }

    handleCancel = () => {
      this.setState({ visible: false });
    }

    onSelectChange = (selectedRowKeys) => {
      this.setState({ selectedRowKeys });
    }

    changePageData = (page) => {
      this.setState({
        current: page,
      });
      this.props.form.validateFields((error, value) => {
        this.getPageData(page, value)
      })
    }

    startClose = () => {
      this.setState({
        isShowStart: false,
      })
    }

    render() {
      const expandedRowRender = record => {
        const columns = [
          { title: 'Date', dataIndex: 'date', key: 'date' },
          { title: 'Name', dataIndex: 'name', key: 'name' },
          { title: 'Status', key: 'state', render: () => <span><Badge status="success" />Finished</span> },
          { title: 'Upgrade Status', dataIndex: 'upgradeNum', key: 'upgradeNum' },
          {
            title: 'Action',
            dataIndex: 'operation',
            key: 'operation',
            render: () => (
              <span className="table-operation">
                <a href="javascript:;">Pause</a>
                <a href="javascript:;">Stop</a>
                <Dropdown overlay={menu}>
                  <a href="javascript:;">
                    More <Icon type="down" />
                  </a>
                </Dropdown>
              </span>
            ),
          },
        ];

        const data = [];
        data.push({
          key: 11,
          date: record.name,
          name: 'This is production name',
          upgradeNum: 'Upgraded: 56',
        });

        return (
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
          />
        );
      };
      const { selectedRowKeys } = this.state;

      const rowSelection = {
        selectedRowKeys,
        onChange: this.onSelectChange,
      };

      const columns = [
        { title: '公众号名称', dataIndex: 'name', key: 'name' },
        { title: 'id', dataIndex: 'dataId', key: 'dataId' },
        { title: '粉丝数', dataIndex: 'star', key: 'star' },
        { title: '头条刊例', dataIndex: 'topTitle', key: 'topTitle' },
        { title: '头条成本', dataIndex: 'topCost', key: 'topCost' },
        { title: '次条刊例', dataIndex: 'secondTitle', key: 'secondTitle' },
        { title: '次条成本', dataIndex: 'secondCost', key: 'secondCost' },
        { title: '末条刊例', dataIndex: 'lastTitle', key: 'lastTitle' },
        { title: '末条成本', dataIndex: 'lastCost', key: 'lastCost' },
        { title: '排期次数', dataIndex: 'planCount', key: 'planCount' },
        { title: '女粉比例', dataIndex: 'womenRatio', key: 'womenRatio' },
        { title: '是否刷号', dataIndex: 'brush', key: 'brush' },
        { title: '类型', dataIndex: 'type', key: 'type' },
        { title: '联系方式', dataIndex: 'phone', key: 'phone' },
        {
          title: '更新时间', dataIndex: 'updateTime', key: 'updateTime',
          render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
        },
        { title: '更新渠道', dataIndex: 'updateRouter', key: 'updateRouter' },
        {
          title: '备注', dataIndex: 'remark', key: 'remark',
          render: val => {
            const str = val || ''
            return (
              <Popover content={val}>{str.length > 20 ? `${str.substr(0, 20)}...` : str}</Popover>
            )
          },
        },
      ];



      return (
        <PageHeaderLayout title="公众号资源库">
          {
            this.state.visible && (
              <AddPlan
                visible={this.state.visible}
                editData={this.state.editData}
                isAdd={this.state.isAdd}
                onCancel={this.handleCancel}
                getPageData={this.getPageData}
                // selectId={this.state.selectId}
                selectedRowKeys={this.state.selectedRowKeys}
                listData={this.state.listData}
                current={this.state.current}
              />
            )
          }
          {
            this.state.visibleRemark && (
              <AddDetail
                visibleRemark={this.state.visibleRemark}
                onCancel={this.closeModel}
                getPageData={this.getPageData}
                editData={this.state.editData}
                isAdd={this.state.isAdd}
              />
            )}
          {
            this.state.isShowStart && (
              <AddStart
                id={this.state.id}
                editData={this.state.editData}
                onCancel={this.startClose}
                isShowStart={this.state.isShowStart}
              />
            )
          }
          {
            this.state.isShowModify && (
              <Modify
                visible={this.state.isShowModify}
                editData={this.state.editData}
                isAdd={this.state.isAdd}
                onCancel={this.closeModify}
                current={this.state.current}
                getPageData={this.getPageData}
                isMaster={this.state.isMaster}
                id={this.state.id}
              />
            )
          }

          <Card bordered={false}>
            <div className={style.tableList}>
              <div className={style.tableListForm}>{this.searchArea()}</div>
              <div className={style.tableListOperator}>
                <input id="excel-upload-input" style={{ display: 'none' }} ref="upload" type="file" accept=".xlsx, .xls" onChange={this.handleClick} />
                {this.buttonArea()}
                <Table
                  id='tables'
                  rowSelection={rowSelection}
                  className="components-table-demo-nested"
                  columns={columns}
                  pagination={false}
                  // expandedRowRender={expandedRowRender}
                  dataSource={this.state.listData}
                />
                <Pagination style={{ marginTop: "10px" }} current={this.state.current} onChange={this.changePageData} pageSize={10} total={this.state.dataCount} />
              </div>
            </div>
          </Card>
        </PageHeaderLayout>
      );
    }
  })