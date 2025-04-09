import React from 'react';
import { Card, Tag, Typography } from 'antd';
import { MCPService } from '../types/mcp';

const { Title, Paragraph } = Typography;

interface MCPServiceCardProps {
  service: MCPService;
}

const MCPServiceCard: React.FC<MCPServiceCardProps> = ({ service }) => {
  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case '内容生成':
        return 'blue';
      case '网页搜索':
        return 'orange';
      case '地图服务':
        return 'green';
      case '项目管理':
        return 'purple';
      case '效率工具':
        return 'cyan';
      case '时区转换':
        return 'magenta';
      default:
        return 'default';
    }
  };

  return (
    <Card
      hoverable
      style={{ height: '100%' }}
      bodyStyle={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        <div 
          style={{ 
            width: '32px', 
            height: '32px', 
            marginRight: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}
        >
          {service.icon}
        </div>
        <Title level={5} style={{ margin: 0 }}>
          {service.name}
        </Title>
      </div>
      
      <Paragraph 
        style={{ 
          fontSize: '14px', 
          color: 'rgba(0, 0, 0, 0.65)', 
          marginBottom: '16px',
          flex: 1
        }}
        ellipsis={{ rows: 3, expandable: false }}
      >
        {service.description}
      </Paragraph>
      
      <div>
        <Tag color={getServiceTypeColor(service.serviceType)}>
          {service.serviceType}
        </Tag>
      </div>
    </Card>
  );
};

export default MCPServiceCard;
