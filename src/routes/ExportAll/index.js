import React from 'react';
import { Form, message, Popover, Table, Button } from 'antd';
import math  from 'mathjs';
import moment from 'moment'
import { export_table_to_excel } from 'utils/ExportExcel'

import request from 'utils/request'
import config from 'utils/config'

export default Form.create()(
  class extends React.Component {

    state = {
      listData:[],
      loading:true,
    }

    componentDidMount() {
      const url = `${config.apiUrl}/getPlanAll`
      request(url).then(res => {
        if (res) {
          if (res.code === 0){
            this.setState({
              listData:res.data,
              loading:false,
            })          
          }else{
            message.error(res.error);
          }
        }
      })
    }

    exportExcel = () => {
      export_table_to_excel('tables')
    }

    render() {
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
          render:location =>{
            let tip = '其他'
            switch (location) {
              case 'top':
                tip='头条'
              break;
              case 'second':
                tip='次条'
              break;
              case 'other':
                tip='其他条'
              break;
              case 'last':
                tip='末条'
              break;
              default:
              tip='末条'
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
          render:time => {
            const showTime = moment.unix(time).format('YYYY-MM-DD')
            return(
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
          render:(text, cord) => {
            const profit = math.round(math.eval(cord.price-cord.cost-cord.impost + cord.channelImpost - cord.rebate),2)
            return(
              <div>{profit}</div>
            )
          },
        },
        {
          title: '利润率',
          dataIndex: 'profitmargin',
          key: 'profitmargin',
          render:(text, cord) => {
            const profit = math.round(math.eval(cord.price-cord.cost-cord.impost + cord.channelImpost - cord.rebate),2)
            const profitmargin = math.round(math.eval(profit/cord.price),2)
            return(
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
              <Popover content={val}>{str.length > 10 ? `${str.substr(0, 10)}...`:str}</Popover>
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
          render: val => <span>{val===0?'否':'是'}</span>,
        },
        {
          title: '是否支付',
          dataIndex: 'isPay',
          key: 'isPay',
          render: val => <span>{val===0?'否':'是'}</span>,
        },
        {
          title: '排期人',
          dataIndex: 'planPeople',
          key: 'planPeople',
        },
      ];

      return (
        <div>
          <Button type="primary" onClick={this.exportExcel}>
            导出EXCEL
          </Button>
          <Table 
            id="tables" 
            rowKey="id" 
            columns={columns} 
            dataSource={this.state.listData}
            loading={this.state.loading}
            pagination={false}
          />
        </div>
      );
    }
  }
);
