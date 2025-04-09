import React, { useState } from 'react';
import { Layout, Typography, Input, Row, Col, Card, Button } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { MCPService } from '../types/mcp';
import MCPServiceCard from './MCPServiceCard';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

const initialServices: MCPService[] = [
  {
    id: '1',
    name: 'Amap Maps',
    icon: '🗺️',
    description: '高德地图MCP Server提供覆盖12大核心接口，提供全球覆盖的地理信息服务，包括地图显示、路线规划、地点搜索等功能。',
    serviceType: '地图服务'
  },
  {
    id: '2',
    name: 'EverArt',
    icon: '🎨',
    description: '基于 EverArt API 的 AI 图像生成工具，可以使用 SD、Flux 等各种模型生成图像。',
    serviceType: '内容生成'
  },
  {
    id: '3',
    name: 'Notion',
    icon: '📝',
    description: '开源社区开发者基于 Notion API 封装，使得 AI 能够与 Notion 工作区进行交互。',
    serviceType: '内容生成'
  },
  {
    id: '4',
    name: 'GitHub',
    icon: '🐙',
    description: 'GitHub 官方提供的服务，为开发人员提供工具，提供连接 GitHub 的高级自动化和交互功能。',
    serviceType: '项目管理'
  },
  {
    id: '5',
    name: 'Firecrawl',
    icon: '🔥',
    description: 'FireCrawl 官方提供的服务，实现大规模、高免费网页数据的抓取和结构化解析。',
    serviceType: '网页搜索'
  },
  {
    id: '6',
    name: 'Perplexity Ask',
    icon: '🔍',
    description: 'Perplexity 官方提供的服务，通过自然语言信息交互提供实时的网络搜索与研究功能。',
    serviceType: '网页搜索'
  },
  {
    id: '7',
    name: 'QuickChart',
    icon: '📊',
    description: '开源社区开发者封装，使用 QuickChart.io 生成各种类型的图表。',
    serviceType: '内容生成'
  },
  {
    id: '8',
    name: 'Flomo',
    icon: '🚀',
    description: 'Flomo 浮墨笔记官方提供的服务，用户可通过 AI 智能交互在 Flomo 中创建笔记，通过 API 实现高效记录和整理。',
    serviceType: '内容生成'
  },
  {
    id: '9',
    name: 'Time',
    icon: '⏰',
    description: 'Time 是一个提供时间和时区转换功能的 MCP 服务，使 LLM 能够获取当前时间信息和进行时区转换。',
    serviceType: '时区转换'
  },
  {
    id: '10',
    name: 'Sequential Thinking',
    icon: '🔄',
    description: '通过结构化思维通过程序化问题一步步解决。',
    serviceType: '内容生成'
  },
  {
    id: '11',
    name: 'BochaAI',
    icon: '🔵',
    description: '博茶是一个综合的搜索引擎，让你的应用从无百亿级网页和全文内容中获取高质量的信息。',
    serviceType: '网页搜索'
  },
  {
    id: '12',
    name: 'Brave Search',
    icon: '🦁',
    description: '基于 Brave API 的搜索工具，提供网络和本地位置相关搜索。',
    serviceType: '网页搜索'
  },
  {
    id: '13',
    name: 'Figma',
    icon: '🎨',
    description: '为 Agent 提供 Figma 文件的信息和样式信息，增强它与设计师交流设计的能力。',
    serviceType: '内容生成'
  },
  {
    id: '14',
    name: 'Weather',
    icon: '☀️',
    description: '极简的天气查询工具，一句话即可查看全球天气。',
    serviceType: '效率工具'
  },
  {
    id: '15',
    name: 'ChatPPT',
    icon: '📊',
    description: 'ChatPPT MCP Server 目前已经开放了 10 个智能PPT文档的能力，包括但不限于自动生成PPT、智能排版等。',
    serviceType: '内容生成'
  }
];

const MCPManagement: React.FC = () => {
  const [services, setServices] = useState<MCPService[]>(initialServices);
  const [searchText, setSearchText] = useState('');

  const handleSearch = (value: string) => {
    setSearchText(value);
    if (!value) {
      setServices(initialServices);
      return;
    }
    
    const filtered = initialServices.filter(service => 
      service.name.toLowerCase().includes(value.toLowerCase()) || 
      service.description.toLowerCase().includes(value.toLowerCase()) ||
      service.serviceType.toLowerCase().includes(value.toLowerCase())
    );
    
    setServices(filtered);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px', 
        display: 'flex', 
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          height: '100%', 
          flex: 1 
        }}>
          <Title level={4} style={{ margin: 0, marginRight: '24px' }}>
            MCP 🔥
          </Title>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Text style={{ fontSize: '16px', cursor: 'pointer' }}>文档</Text>
            <Text style={{ fontSize: '16px', cursor: 'pointer' }}>API参考</Text>
          </div>
        </div>
      </Header>
      
      <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          background: '#fff', 
          padding: '40px 24px', 
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 0,
            opacity: 0.1
          }}>
            {/* Decorative icons */}
            <div style={{ position: 'absolute', top: '20%', left: '10%', fontSize: '24px' }}>🎨</div>
            <div style={{ position: 'absolute', top: '30%', right: '15%', fontSize: '24px' }}>📊</div>
            <div style={{ position: 'absolute', bottom: '25%', left: '20%', fontSize: '24px' }}>🔍</div>
            <div style={{ position: 'absolute', bottom: '40%', right: '25%', fontSize: '24px' }}>🚀</div>
            <div style={{ position: 'absolute', top: '50%', left: '30%', fontSize: '24px' }}>🔥</div>
            <div style={{ position: 'absolute', top: '60%', right: '30%', fontSize: '24px' }}>📝</div>
            <div style={{ position: 'absolute', bottom: '20%', right: '10%', fontSize: '24px' }}>🐙</div>
          </div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Title level={3} style={{ marginBottom: '16px' }}>
              连接智能，即点即用
            </Title>
            <Title level={4} style={{ fontWeight: 'normal', marginBottom: '32px' }}>
              探索百炼全周期 MCP 服务
            </Title>
            
            <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex' }}>
              <Search
                placeholder="搜索你感兴趣的MCP服务"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ flex: 1 }}
              />
              <Button 
                type="primary" 
                size="large" 
                icon={<PlusOutlined />} 
                style={{ marginLeft: '8px' }}
              />
            </div>
          </div>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <Title level={4} style={{ margin: 0 }}>
            云部署 MCP Server {services.length}
          </Title>
        </div>
        
        <Row gutter={[16, 16]}>
          {services.map(service => (
            <Col xs={24} sm={12} md={8} lg={8} xl={6} key={service.id}>
              <MCPServiceCard service={service} />
            </Col>
          ))}
          <Col xs={24} sm={12} md={8} lg={8} xl={6}>
            <Card 
              hoverable 
              style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: '180px'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                  <PlusOutlined />
                </div>
                <Text>Coming Soon...</Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default MCPManagement;
