import React from 'react';
import { Button, message } from 'antd';
import XLSX from 'xlsx'

import request from 'utils/request'
import config from 'utils/config'

export default class UploadExcel extends React.Component {
  state = {
  };

  componentDidMount() {
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
    // console.log('header', header)
    // console.log('results', results)
    results.forEach(item => {
      const data = {}
      Object.keys(item).forEach(val => {
        const oldVal = val
        val = val.replace(/(^\s*)|(\s*$)/g, "")
        switch (val) {
          case 'id':
            data.dataId = item[oldVal]
            break;
          case '公众号名称':
            data.name = item[oldVal]
            break;
          case '粉丝数':
            data.star = item[oldVal]
            break;
          case '头条成本':
            data.topCost = item[oldVal]
            break;
          case '次条刊例':
            data.secondTitle = item[oldVal]
            break;
          case '末条成本':
            data.lastCost = item[oldVal]
            break;
          case '次条成本':
            data.secondCost = item[oldVal]
            break;
          case '头条刊例':
            data.topTitle = item[oldVal]
            break;
          case '女粉比例':
            data.womenRatio = item[oldVal]
            break;
          case '末条刊例':
            data.lastTitle = item[oldVal]
            break;
          case '联系方式':
            data.lastTitle = item[oldVal]
            break;
        }
      })
      const url = `${config.apiUrl}/savePublicNumber`
      const options = {
        method: 'POST',
        body: data
      }
      request(url, options).then(res => {
        console.log('message', res)
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
      var cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })] /* find the cell in the first row */
      var hdr = 'UNKNOWN ' + C // <-- replace with your desired default
      if (cell && cell.t) hdr = XLSX.utils.format_cell(cell)
      headers.push(hdr)
    }
    return headers
  }
  upload = (rawFile) => {
    this.refs.upload.value = null
    console.log('this', this)

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
    document.getElementById('excel-upload-input').click()
  }
  handleClick = (e) => {
    const files = e.target.files
    const rawFile = files[0] // only use files[0]
    if (!rawFile) return
    this.upload(rawFile)
  }
  render() {
    return (
      <div>
        <input id="excel-upload-input" style={{ display: 'none' }} ref="upload" type="file" accept=".xlsx, .xls" onChange={this.handleClick} />
        <Button onClick={this.handleUpload} >上传</Button>
      </div>
    );
  }
}
