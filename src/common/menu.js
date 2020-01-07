import { isUrl } from '../utils/utils';

const menuData = [
  {
    name: '公众号资源库',
    icon: 'dashboard',
    path: 'resource',
    children: [
      {
        name: '公众号资源库',
        path: 'resource',
      },
      {
        name: '公众号排期列表',
        path: 'havaplan',
      },
      {
        name: '已作废排期限',
        path: 'removeplan',
      },
    ],
  },
  {
    name: '客户资源',
    icon: 'form',
    path: 'customer',
    children: [
      {
        name: '客户录入',
        path: 'customer',
      },
      {
        name: '公共资源库',
        path: 'publicresource',
      },
    ],
  },
  {
    name: '系统设置',
    icon: 'table',
    path: 'system',
    children: [
      {
        name: '修改密码',
        path: 'modifypassword',
      },
      {
        name: '部门管理',
        path: 'dept',
      },
      {
        name: '账号管理',
        path: 'account',
      },
      {
        name: '管理权限',
        path: '/author',
      },
    ],
  },
];

function formatter(data, parentPath = '/', parentAuthority) {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
