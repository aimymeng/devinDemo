import React from 'react';
import { Layout, Row, Col, Divider } from 'antd';
import './Footer.less';

const { Footer: AntFooter } = Layout;

export const Footer = () => {
  return (
    <AntFooter className="footer">
      <div className="footer-content">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="footer-section">
              <h3>关于我们</h3>
              <ul>
                <li>公司简介</li>
                <li>发展历程</li>
                <li>企业文化</li>
                <li>联系我们</li>
              </ul>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="footer-section">
              <h3>专项报名</h3>
              <ul>
                <li>海外人才</li>
                <li>高校毕业生</li>
                <li>创新创业</li>
                <li>技术培训</li>
              </ul>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="footer-section">
              <h3>人才政策</h3>
              <ul>
                <li>人才引进</li>
                <li>政策解读</li>
                <li>补贴申请</li>
                <li>常见问题</li>
              </ul>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="footer-section">
              <h3>联系方式</h3>
              <p>地址：江苏省南京市</p>
              <p>电话：400-6688-789</p>
              <p>邮箱：contact@example.com</p>
              <div className="qr-code">
                {/* 二维码图片 */}
              </div>
            </div>
          </Col>
        </Row>
        <Divider style={{ backgroundColor: '#444' }} />
        <div className="copyright">
          <p>Copyright©2023-2024 江苏省人力资源和社会保障厅 All Rights Reserved</p>
        </div>
      </div>
    </AntFooter>
  );
};
