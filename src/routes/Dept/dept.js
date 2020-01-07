import React, { Fragment } from 'react';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import { Tree, Card, Icon } from 'antd';

const TreeNode = Tree.TreeNode;

export  default class Demo extends React.Component {
  state = {
    dept:[
      {
        deptId:'boss',
        text:'总经理',
        children:[
          {
            deptId:'boss',
            text:'销售部',
          },
          {
            deptId:'boss',
            text:'媒介部',
          },
          {
            deptId:'boss',
            text:'财务部',
          }
        ]
      }
    ],
  }
  onSelect = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);
  }
  render() {
    return (
      <PageHeaderLayout title="部门管理">
        <Card bordered={false}>
          <Tree
            showLine
            onSelect={this.onSelect}
          >
            <TreeNode title="总经理" key="boss">
              <TreeNode title="销售部" key="0-0-0">
              </TreeNode>
              <TreeNode title="媒介部" key="0-0-1">
              </TreeNode>
              <TreeNode title="财务部" key="0-0-2">
              </TreeNode>
            </TreeNode>
          </Tree>
        </Card>
      </PageHeaderLayout>
    );
  }
}
