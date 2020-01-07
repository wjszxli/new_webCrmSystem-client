import { Upload, Icon, Modal } from 'antd';
import config from 'utils/config'
import request from 'utils/request'

export default class PicturesWall extends React.Component {
  state = {
    fileList: [],
    actionUrl: ''
  };

  componentDidMount(){
    const { editData } = this.props
    if (editData[0].starImage) {
      const starImage = editData[0].starImage.split(',')
      const fileList = []
      for(let i =0;i< starImage.length;i++){
        fileList.push({
          uid: i,
          name: 'xxx.png',
          status: 'done',
          url: `${config.apiUrl}${starImage[i]}`,
        })
      }
      this.setState({
        fileList
      })
    }
    this.setState({
      actionUrl: `${config.apiUrl}/uploadImage?id=${this.props.id}`
    })
  }

  handleChange = ({ fileList }) => this.setState({ fileList })
  onRemove = async () => {
    const { fileList } = this.state
    const { editData } = this.props
    let starImage = ''
    fileList.forEach(item => {
      if (item.status === 'done') {
        if (item.url) {
          starImage += item.url.replace(config.apiUrl,'') + ','
        }
      }
    })
    if (starImage) {
      starImage = starImage.substr(0, starImage.length -1)
    }
    const [{id}] = editData

    const url = `${config.apiUrl}/updateImg`
    const options = {
      body:{
        starImage,
        id
      },
      method:'POST'
    }
    await request(url, options)
  }
  render() {
    const { fileList } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">粉丝属性上传</div>
      </div>
    );
    return (
        <Modal
            title="粉丝属性"
            visible={true}
            confirmLoading={false}
            onCancel = {this.props.onCancel}
            onOk = {this.props.onCancel}
        >
      <div className="clearfix">
        <Upload
          action={this.state.actionUrl}
          accept="image/gif,image/jpg,image/png"
          listType="picture-card"
          fileList={fileList}
          onChange={this.handleChange}
          onRemove = {this.onRemove}
        >
          {fileList.length >= 3 ? null : uploadButton}
        </Upload>
        </div>
    </Modal>
    );
  }
}

