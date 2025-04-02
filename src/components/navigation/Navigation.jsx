import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.less';

const { Header } = Layout;

export const Navigation = () => {
  const location = useLocation();
  const [current, setCurrent] = useState(() => {
    const pathname = location.pathname;
    if (pathname === '/') return 'home';
    if (pathname === '/about') return 'about';
    if (pathname === '/recruitment') return 'recruitment';
    if (pathname === '/jobs') return 'jobs';
    return 'home';
  });

  const handleClick = e => {
    setCurrent(e.key);
  };

  return (
    <Header className="header">
      <div className="logo">
        <Link to="/">
          <img src="/src/public/images/logo.png" alt="企业Logo" />
        </Link>
      </div>
      <Menu 
        theme="light" 
        mode="horizontal" 
        selectedKeys={[current]}
        onClick={handleClick}
        className="menu"
      >
        <Menu.Item key="home"><Link to="/">首页</Link></Menu.Item>
        <Menu.Item key="about"><Link to="/about">专项报名</Link></Menu.Item>
        <Menu.Item key="recruitment"><Link to="/recruitment">招聘公告</Link></Menu.Item>
        <Menu.Item key="jobs"><Link to="/jobs">人才需求</Link></Menu.Item>
      </Menu>
    </Header>
  );
};
