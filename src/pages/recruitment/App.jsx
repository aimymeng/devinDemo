import React from 'react';
import { Layout, List, Card, Tag, Button, Divider } from 'antd';
import { Navigation } from '../../components/navigation/Navigation';
import { Footer } from '../../components/footer/Footer';
import './index.less';

const { Content } = Layout;

export const App = () => {
  const announcements = [
    {
      id: 1,
      title: '2024年江苏省高层次人才引进计划',
      date: '2024-03-15',
      department: '人力资源部',
      tags: ['人才引进', '高层次人才'],
      content: '为加快推进江苏省高质量发展，充分发挥人才第一资源作用，现面向海内外招聘高层次人才。本次招聘计划引进博士及以上学历人才100名，硕士学历人才200名，涵盖人工智能、生物医药、新材料、新能源等战略性新兴产业领域。',
    },
    {
      id: 2,
      title: '百名海外博士江苏行活动公告',
      date: '2024-03-20',
      department: '对外合作部',
      tags: ['海外人才', '博士'],
      content: '"百名海外博士江苏行"活动将于2024年5月举行，为期7天。活动期间，将组织海外博士参观江苏省重点企业、高校和科研院所，了解江苏省经济社会发展情况和人才政策，促进海外高层次人才与江苏企业的对接与合作。',
    },
    {
      id: 3,
      title: '2024年江苏省"双创计划"申报通知',
      date: '2024-03-25',
      department: '科技创新部',
      tags: ['创新创业', '资金支持'],
      content: '为深入实施创新驱动发展战略，加快培育发展新动能，现启动2024年江苏省"双创计划"申报工作。本计划面向海内外高层次人才和团队，支持其在江苏省内开展创新创业活动，对入选的创新创业项目给予最高500万元的资金支持。',
    },
    {
      id: 4,
      title: '江苏省企业博士后科研工作站招收公告',
      date: '2024-04-01',
      department: '科研管理部',
      tags: ['博士后', '科研工作站'],
      content: '为加强企业创新能力建设，促进产学研深度融合，现面向海内外招收博士后研究人员。入站博士后将获得年薪30-50万元（税前），并享受住房补贴、医疗保险等福利待遇。研究方向包括但不限于人工智能、大数据、集成电路、生物医药等领域。',
    },
  ];

  return (
    <Layout className="layout">
      <Navigation />
      <Content>
        <div className="page-header">
          <div className="page-title-container">
            <h1 className="page-title">招聘公告</h1>
            <div className="page-subtitle">最新人才招募信息</div>
          </div>
        </div>
        
        <div className="site-content">
          <div className="announcements-list">
            <List
              itemLayout="vertical"
              size="large"
              dataSource={announcements}
              renderItem={item => (
                <List.Item
                  key={item.id}
                  className="announcement-item"
                >
                  <Card className="announcement-card">
                    <div className="announcement-header">
                      <h2 className="announcement-title">{item.title}</h2>
                      <div className="announcement-meta">
                        <span className="announcement-date">发布日期：{item.date}</span>
                        <span className="announcement-department">发布部门：{item.department}</span>
                      </div>
                      <div className="announcement-tags">
                        {item.tags.map(tag => (
                          <Tag color="blue" key={tag}>{tag}</Tag>
                        ))}
                      </div>
                    </div>
                    <Divider />
                    <div className="announcement-content">
                      <p>{item.content}</p>
                    </div>
                    <div className="announcement-actions">
                      <Button type="primary">查看详情</Button>
                      <Button>立即申请</Button>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default App;
