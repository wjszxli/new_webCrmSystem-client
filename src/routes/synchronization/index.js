import React from 'react';
import { Card, message, Select, Button, Modal } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import style from './index.less';

import request from 'utils/request'
import config from 'utils/config'

const { Option } = Select;
const { confirm } = Modal;

export default class Customer extends React.Component {
    state = {
        visible: false,
        listData: [],
        current: 1,
        pageSize: 10,
        dataCount: 0,
        editData: {},
        isAdd: false,
        isAuth: false,
        fromId: '',
        toId: ''
    };

    async componentDidMount() {
        await this.isAuth()
        const { isAuth } = this.state
        const phone = window.localStorage.getItem('phone')
        const isBoss = phone === '15168248050'

        if (!isBoss) {
            window.location.href = '/#/exception/403'
        }

        if (!isAuth) {
            window.location.href = '/#/exception/403'
        } else {
            this.getPageData()
        }
    }

    async isAuth() {
        const id = localStorage.getItem('id')
        if (!id) {
            window.location.href = '/#/login/logout'
            return
        }
        const url = `${config.apiUrl}/isAuthor?user=${id}&author=master`
        const res = await request(url)
        if (res) {
            if (res.code === 0) {
                console.log('res.data.tip', res.data.tip)
                if (res.data.tip) {
                    this.setState({ isAuth: true })
                }
            } else {
                message.error(res.error);
            }
        }
    }

    getPageData = () => {
        // 获取分页的数据
        let url = `${config.apiUrl}/getUserInfo?pageSize=1000&pageIndex=1`
        request(url).then(res => {
            if (res) {
                if (res.code === '0') {
                    this.setState({
                        listData: res.data
                    })
                } else {
                    message.error(res.error);
                }
            }
        })
    }

    onChange = () => {
        confirm({
            title: '确定要转移?',
            content: '转移后数据将不可恢复，确认要转移吗？',
            onOk: () => {
                const { fromId, toId } = this.state
                if (fromId === '' || toId === '') {
                    message.error('请选择账号')
                    return false
                }
                const url = `${config.apiUrl}/change`
                const options = {
                    method: 'POST',
                    body: { fromId, toId }
                }
                request(url, options).then(res => {
                    console.log('res', res)
                    if (Number(res.code) === 0) {
                        message.success(res.data.tip);
                    } else {
                        message.error(res.error);
                    }
                })
            },
            cancelText: '取消',
            okText: '确认',
            onCancel: () => {
                console.log('Cancel');
            },
        });
    }

    render() {
        const { listData } = this.state

        return (
            <PageHeaderLayout title="资源转移">
                <Card bordered={false}>
                    <div className={style.tableList}>
                        <div>被转移账号：</div>
                        <Select style={{ width: 180 }} placeholder="请选择账号" onChange={(fromId) => this.setState({ fromId })} >
                            {
                                listData.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>)
                            }
                        </Select>
                        <div>数据转移账号：</div>
                        <Select style={{ width: 180 }} placeholder="请选择账号" onChange={(toId) => this.setState({ toId })}>
                            {
                                listData.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>)
                            }
                        </Select>
                        <Button type="primary" onClick={this.onChange} >转移</Button>
                    </div>
                </Card>
            </PageHeaderLayout>
        );
    }
}
