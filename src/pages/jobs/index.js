import React from 'react';
import ReactDOM from 'react-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import App from './App';
import './index.less';

ReactDOM.render(
  <ConfigProvider locale={zhCN}>
    <App />
  </ConfigProvider>,
  document.getElementById('root')
);
