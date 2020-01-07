import React from 'react';
import { Modal, Form, Input, Row, Col, Radio, message } from 'antd';

import request from 'utils/request'
import config from 'utils/config'


const FormItem = Form.Item;
const { TextArea } = Input;

export default Form.create()(
  class extends React.Component {
    onCreate = async () => {
      console.log('selectedRowKeys', this.props)
      const that = this
      this.props.form.validateFields((error, value) => {
        if (error) {
          return
        }
        const url = `${config.apiUrl}/addFinance`
        const options = {
          method:'POST',
          body: value,
        }
        if (options.body) {
          options.body.id = this.props.selectedRowKeys
        }
        request(url, options).then(res => {
          if (res.code === 0) {
            message.success(res.data.tip);
            that.props.getPageData(that.props.current)
            that.props.onCancel()
            that.props.form.resetFields();
          } else {
            message.error(res.error);
          }
        })
      })
    }

    componentDidMount(){
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
          title="财务备注"
          okText="保存财务备注"
          onCancel={onCancel}
          onOk={this.onCreate}
          width={800}
        >
          <Form className="ant-advanced-search-form">
            <FormItem label="财务备注">
              {getFieldDecorator('financeReamrk', {
                    initialValue: '',
                    rules: [{
                    required: true,
                    whitespace: true,
                    message: '输入财务备注',
                  }],
                  })(
                    <TextArea placeholder="输入财务备注" rows={8} />
                  )}
            </FormItem>
          </Form>
        </Modal>
      );
    }
  }
);
