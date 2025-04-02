import React from 'react';
import { Carousel } from 'antd';
import './Banner.less';

export const Banner = () => {
  return (
    <div className="banner-container">
      <Carousel autoplay effect="fade">
        <div className="banner-slide">
          <div className="banner-content">
            <h1>携手天下英才 创向2024江苏未来</h1>
            <p>百名海外博士江苏行</p>
          </div>
        </div>
        <div className="banner-slide banner-slide-2">
          <div className="banner-content">
            <h1>创新引领未来</h1>
            <p>江苏省高层次人才引进计划</p>
          </div>
        </div>
      </Carousel>
    </div>
  );
};
