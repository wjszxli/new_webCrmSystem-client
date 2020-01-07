import React from 'react';
import { Modal, Form, Input, Row, Col, Radio, message } from 'antd';

import request from 'utils/request'
import config from 'utils/config'

import './customer.less';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;

export default Form.create()(
  class extends React.Component {
    onCreate = async () => {
      const that = this
      this.props.form.validateFields((error, value) => {
        if (!!error) {
          return
        }
        const url = `${config.apiUrl}/follow`
        const options = {
          method:'POST',
          body: value
        }
        const { editData } = this.props
        if (editData[0]) {
            options.body.id = editData[0].id
        }
        request(url, options).then(res => {
          if (res.code === 0) {
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
    componentDidMount(){
        console.log('this.props.isAdd', this.props.isAdd)
      if (!this.props.isAdd) {
        this.props.form.setFieldsValue(this.props.editData[0])
      }
    }
    render() {
      const { visibleRemark, onCancel } = this.props;
      const { getFieldDecorator } = this.props.form;

      return (
        <Modal
          visible={visibleRemark}
          maskClosable={false}
          title="跟进客户信息"
          okText="保存跟进信息"
          onCancel={onCancel}
          onOk={this.onCreate}
          width={800}
        >
            <Form className="ant-advanced-search-form" >
                  <FormItem label="备注">
                  {getFieldDecorator('remark', {
                    initialValue: '',
                    rules: [{
                    required: true,
                    whitespace: true,
                    message: '输入跟进信息',
                  }],
                  })(
                    <TextArea placeholder="输入备注" rows={8} />
                  )}
                  </FormItem>
            </Form>
        </Modal>
      );
    }
  }
);
