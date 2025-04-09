import React from 'react';
import { List, Card, Tag, Space, Button, Popconfirm, Typography } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Prompt } from '../types';

const { Paragraph } = Typography;

interface PromptListProps {
  prompts: Prompt[];
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
}

const PromptList: React.FC<PromptListProps> = ({ prompts, onEdit, onDelete }) => {
  return (
    <List
      grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
      dataSource={prompts}
      locale={{ emptyText: '暂无 Prompt，请添加新的 Prompt' }}
      renderItem={(prompt) => (
        <List.Item>
          <Card
            title={prompt.title}
            extra={
              <Space>
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => onEdit(prompt)}
                >
                  编辑
                </Button>
                <Popconfirm
                  title="确定要删除这个 Prompt 吗？"
                  okText="确定"
                  cancelText="取消"
                  onConfirm={() => onDelete(prompt.id)}
                >
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />}
                  >
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            }
          >
            <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: '展开' }}>
              {prompt.content}
            </Paragraph>
            <div style={{ marginTop: 16 }}>
              {prompt.tags.map((tag, index) => (
                <Tag color="blue" key={index} style={{ marginBottom: 8 }}>
                  {tag}
                </Tag>
              ))}
            </div>
          </Card>
        </List.Item>
      )}
    />
  );
};

export default PromptList;
