import React from 'react';
import { List, Card, Tag, Space, Button, Popconfirm, Typography, Switch } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { CursorRule } from '../types/cursorrule';

const { Paragraph } = Typography;

interface CursorRuleListProps {
  rules: CursorRule[];
  onEdit: (rule: CursorRule) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

const CursorRuleList: React.FC<CursorRuleListProps> = ({ 
  rules, 
  onEdit, 
  onDelete,
  onToggleActive 
}) => {
  return (
    <List
      grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
      dataSource={rules}
      locale={{ emptyText: '暂无规则，请添加新的规则' }}
      renderItem={(rule) => (
        <List.Item>
          <Card
            title={
              <Space>
                {rule.name}
                <Switch 
                  checked={rule.isActive} 
                  size="small" 
                  onChange={(checked) => onToggleActive(rule.id, checked)}
                />
              </Space>
            }
            extra={
              <Space>
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => onEdit(rule)}
                >
                  编辑
                </Button>
                <Popconfirm
                  title="确定要删除这个规则吗？"
                  okText="确定"
                  cancelText="取消"
                  onConfirm={() => onDelete(rule.id)}
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
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>匹配模式:</div>
              <Paragraph copyable code style={{ marginBottom: 8 }}>
                {rule.pattern}
              </Paragraph>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>替换内容:</div>
              <Paragraph copyable code>
                {rule.replacement}
              </Paragraph>
            </div>
            <div style={{ marginTop: 12 }}>
              <Tag color={rule.isActive ? 'green' : 'red'}>
                {rule.isActive ? '已启用' : '已禁用'}
              </Tag>
            </div>
          </Card>
        </List.Item>
      )}
    />
  );
};

export default CursorRuleList;
