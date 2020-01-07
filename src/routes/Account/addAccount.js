import React, { Children } from 'react';
import { Modal, Form, Input, message, Radio, TreeSelect } from 'antd';
import request from 'utils/request'
import config from 'utils/config'

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const TreeNode = TreeSelect.TreeNode;

export default Form.create()(
  class extends React.Component {
    state = {
      value: ''
    }
    componentDidMount(){
      if (!this.props.isAdd) {
        this.props.form.setFieldsValue(this.props.editData[0])
        if (this.props.editData[0].dept) {
          this.setState({
            value:this.props.editData[0].dept
          })
        }
      }
    }
    onChangeDept = (data) => {
      console.log('onChangeDept', data)
    }
    onCreate = () => {
      const that = this
      this.props.form.validateFields((error, value) => {
        if (!!error) {
          return
        }
        if (this.state.value) {
          value.dept = this.state.value
        }
        const url = `${config.apiUrl}/saveUserInfo`
        const options = {
          method:'POST',
          body: value
        }
        request(url, options).then(res => {
          if (res.code === "0") {
            message.success(res.data.tip);
            that.props.getPageData(1)
            that.props.onCancel()
            that.props.form.resetFields();
          } else {
            message.error(res.error);
          }
        })
       
      })
    }
    onChange = (value) => {
      console.log(value);
      this.setState({ value });
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
      return (
        <Modal
          visible={visible}
          maskClosable={false}
          title="账号信息"
          okText="保存账号信息"
          onCancel={onCancel}
          onOk={this.onCreate}
        >
            <Form >
              <FormItem {...formItemLayout}  label="姓名">
              {getFieldDecorator('name', {
                  initialValue: '',
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '请输入姓名',
                  }],
                })(<Input placeholder="输入姓名" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="手机号">
              {getFieldDecorator('phone', {
                  initialValue: '',
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '请输入手机号',
                  }],
                })(<Input placeholder="输入手机号" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="部门">
        <TreeSelect
          style={{ width: 300 }}
          value={this.state.value}
        placeholder="请选择部门"
        treeDefaultExpandAll
        onChange={this.onChange}
      >
        <TreeNode value="boss" title="总经理" key="boss">
            <TreeNode value="sale" title="销售部" key="sale" />
            <TreeNode value="media" title="媒介部" key="media" />
            <TreeNode value="finace" title="财务部" key="finace" />
        </TreeNode>
      </TreeSelect>
              </FormItem>
              <FormItem {...formItemLayout} label="是否部门主管">
              {getFieldDecorator('isDeptAdmin', {
                  initialValue: 0,
                })(
                  <RadioGroup>
                    <Radio value={0}>否</Radio>
                    <Radio value={1}>是</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="职位">
              {getFieldDecorator('job', {
                  initialValue: '',
                })(<Input placeholder="输入职位" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="备注">
              {getFieldDecorator('remark', {
                  initialValue: '',
                })(<TextArea placeholder="备注" rows={4} />)}
              </FormItem>
            </Form>
        </Modal>
      );
    }
  }
);
