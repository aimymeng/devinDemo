import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Space, Tag, Card, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Prompt } from '../types';

const { Title } = Typography;
const { TextArea } = Input;

interface PromptFormProps {
  onSubmit: (prompt: Prompt | Omit<Prompt, 'id'>) => void;
  initialData: Prompt | null;
  onCancel: () => void;
}

const PromptForm: React.FC<PromptFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [form] = Form.useForm();
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        title: initialData.title,
        content: initialData.content,
      });
      setTags(initialData.tags);
    } else {
      form.resetFields();
      setTags([]);
    }
  }, [initialData, form]);

  const handleSubmit = (values: any) => {
    if (tags.length === 0) {
      message.warning('请至少添加一个标签');
      return;
    }
    
    const promptData = {
      ...(initialData ? { id: initialData.id } : {}),
      title: values.title,
      content: values.content,
      tags,
    };
    
    onSubmit(promptData as any);
    
    if (!initialData) {
      form.resetFields();
      setTags([]);
      setTagInput('');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Card>
      <Title level={4} style={{ marginBottom: 24 }}>
        {initialData ? '编辑 Prompt' : '添加新 Prompt'}
      </Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          title: '',
          content: '',
        }}
      >
        <Form.Item
          name="title"
          label="标题"
          rules={[{ required: true, message: '请输入标题' }]}
        >
          <Input placeholder="请输入标题" />
        </Form.Item>
        
        <Form.Item
          name="content"
          label="内容"
          rules={[{ required: true, message: '请输入内容' }]}
        >
          <TextArea rows={4} placeholder="请输入内容" />
        </Form.Item>
        
        <Form.Item label="标签">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Input
                placeholder="输入标签后按回车添加"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                style={{ width: 300 }}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={addTag}>
                添加
              </Button>
            </Space>
            
            <div style={{ marginTop: 8 }}>
              {tags.map((tag, index) => (
                <Tag
                  key={index}
                  closable
                  color="blue"
                  style={{ marginBottom: 8 }}
                  onClose={() => removeTag(tag)}
                >
                  {tag}
                </Tag>
              ))}
              {tags.length === 0 && (
                <span style={{ color: '#999' }}>暂无标签，请添加</span>
              )}
            </div>
          </Space>
        </Form.Item>
        
        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" htmlType="submit">
              {initialData ? '更新' : '保存'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PromptForm;
