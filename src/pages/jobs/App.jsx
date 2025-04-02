import React, { useState } from 'react';
import { Layout, Row, Col, Card, Input, Select, Button, Tag, Pagination } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Navigation } from '../../components/navigation/Navigation';
import { JobTable } from '../../components/jobTable/JobTable';
import { Footer } from '../../components/footer/Footer';
import './index.less';

const { Content } = Layout;
const { Option } = Select;

export const App = () => {
  const [searchText, setSearchText] = useState('');
  const [location, setLocation] = useState('all');
  const [jobType, setJobType] = useState('all');

  return (
    <Layout className="layout">
      <Navigation />
      <Content>
        <div className="page-header">
          <div className="page-title-container">
            <h1 className="page-title">人才需求</h1>
            <div className="page-subtitle">寻找适合您的职位</div>
          </div>
        </div>
        
        <div className="site-content">
          <div className="job-search-panel">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={24} md={8} lg={8}>
                <Input 
                  placeholder="搜索职位、公司或关键词" 
                  prefix={<SearchOutlined />} 
                  onChange={e => setSearchText(e.target.value)}
                  size="large"
                />
              </Col>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Select 
                  placeholder="地点" 
                  style={{ width: '100%' }} 
                  onChange={value => setLocation(value)}
                  size="large"
                >
                  <Option value="all">全部地区</Option>
                  <Option value="nanjing">南京</Option>
                  <Option value="suzhou">苏州</Option>
                  <Option value="wuxi">无锡</Option>
                  <Option value="changzhou">常州</Option>
                  <Option value="yangzhou">扬州</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Select 
                  placeholder="职位类型" 
                  style={{ width: '100%' }} 
                  onChange={value => setJobType(value)}
                  size="large"
                >
                  <Option value="all">全部类型</Option>
                  <Option value="fulltime">全职</Option>
                  <Option value="parttime">兼职</Option>
                  <Option value="intern">实习</Option>
                </Select>
              </Col>
              <Col xs={24} sm={24} md={4} lg={4}>
                <Button type="primary" size="large" block>
                  搜索
                </Button>
              </Col>
            </Row>
          </div>
          
          <div className="job-categories">
            <h2 className="section-title">热门职位分类</h2>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card className="category-card" hoverable>
                  <h3>技术研发</h3>
                  <div className="category-tags">
                    <Tag>软件开发</Tag>
                    <Tag>人工智能</Tag>
                    <Tag>大数据</Tag>
                  </div>
                  <div className="job-count">42个职位</div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card className="category-card" hoverable>
                  <h3>产品设计</h3>
                  <div className="category-tags">
                    <Tag>产品经理</Tag>
                    <Tag>UI设计</Tag>
                    <Tag>用户研究</Tag>
                  </div>
                  <div className="job-count">28个职位</div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card className="category-card" hoverable>
                  <h3>市场营销</h3>
                  <div className="category-tags">
                    <Tag>市场策划</Tag>
                    <Tag>品牌推广</Tag>
                    <Tag>内容运营</Tag>
                  </div>
                  <div className="job-count">35个职位</div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card className="category-card" hoverable>
                  <h3>金融财务</h3>
                  <div className="category-tags">
                    <Tag>财务分析</Tag>
                    <Tag>投资顾问</Tag>
                    <Tag>风险控制</Tag>
                  </div>
                  <div className="job-count">19个职位</div>
                </Card>
              </Col>
            </Row>
          </div>
          
          <div className="job-listings">
            <h2 className="section-title">最新职位</h2>
            <JobTable />
          </div>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default App;
