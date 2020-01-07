import React from 'react';
import { Modal, Form, Input, message, TreeSelect } from 'antd';
import request from 'utils/request'
import config from 'utils/config'

const SHOW_PARENT = TreeSelect.SHOW_PARENT;

export default Form.create()(
  class extends React.Component {
    constructor(props){
      super(props)
      console.log('props', props)
      this.state = {
        treeData:[],
        selectData: [],
      }
    }
    async componentDidMount(){
      const { id } = this.props
      let url = `${config.apiUrl}/getAllUserInfo`
      let options = {
        method:'get'   
      }
      let res = await request(url, options)

      if (res.code === 0) {
        const data = []
        res.data.forEach(item => {
          data.push({
            title: item.name,
            key:item.id,
            value: item.id
          })
        })
        this.setState({
          treeData: data
        })
      } else {
        message.error(res.error);
      }

      url = `${config.apiUrl}/getDataById?id=${id}`
      options = {
        method:'get'   
      }
      res = await request(url, options)

      if (res.code === 0) {
        if (res.data.length > 0){
          const selectData = []
          if (res.data[0].user) {
            res.data[0].user.split(',').forEach(item => {
              selectData.push(Number(item))
            })
          }
          this.setState({
            selectData
          })
        }
      } else {
        message.error(res.error);
      }

    }
    onCreate = () => {
      const params = {
        id: this.props.id,
        user: this.state.selectData.join(',')
      } 
        const url = `${config.apiUrl}/updateAuthor`
        const options = {
          method:'POST',
          body: params
        }
        const that = this
        request(url, options).then(res => {
          if (res.code === 0) {
            message.success(res.data.tip)
            that.props.onCancel()
          } else {
            message.error(res.error);
          }
        })
    }

    onChange = (selectData) => {
        this.setState({ selectData });
    }
    
    render() {
      const { visible, onCancel } = this.props;
      const tProps = {
        treeData: this.state.treeData,
        value: this.state.selectData,
        onChange: this.onChange,
        treeCheckable: true,
        showCheckedStrategy: SHOW_PARENT,
        searchPlaceholder: '请选择权限',
        style: {
          width: 300,
        },
      };
      return (
        <Modal
          visible={visible}
          maskClosable={false}
          title="用户授权"
          okText="保存授权信息"
          onCancel={onCancel}
          onOk={this.onCreate}
        >
        用户授权：
        <TreeSelect {...tProps} />
        </Modal>
      );
    }
  }
);
