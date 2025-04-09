import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Space, Card, Switch } from 'antd';
import { CursorRule } from '../types/cursorrule';

const { Title } = Typography;
const { TextArea } = Input;

interface CursorRuleFormProps {
  onSubmit: (rule: CursorRule | Omit<CursorRule, 'id'>) => void;
  initialData: CursorRule | null;
  onCancel: () => void;
}

const CursorRuleForm: React.FC<CursorRuleFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [form] = Form.useForm();
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        name: initialData.name,
        pattern: initialData.pattern,
        replacement: initialData.replacement,
      });
      setIsActive(initialData.isActive);
    } else {
      form.resetFields();
      setIsActive(true);
    }
  }, [initialData, form]);

  const handleSubmit = (values: any) => {
    const ruleData = {
      ...(initialData ? { id: initialData.id } : {}),
      name: values.name,
      pattern: values.pattern,
      replacement: values.replacement,
      isActive,
    };
    
    onSubmit(ruleData as any);
    
    if (!initialData) {
      form.resetFields();
      setIsActive(true);
    }
  };

  return (
    <Card>
      <Title level={4} style={{ marginBottom: 24 }}>
        {initialData ? '编辑规则' : '添加新规则'}
      </Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          name: '',
          pattern: '',
          replacement: '',
        }}
      >
        <Form.Item
          name="name"
          label="规则名称"
          rules={[{ required: true, message: '请输入规则名称' }]}
        >
          <Input placeholder="请输入规则名称" />
        </Form.Item>
        
        <Form.Item
          name="pattern"
          label="匹配模式"
          rules={[{ required: true, message: '请输入匹配模式' }]}
          tooltip="支持正则表达式"
        >
          <Input placeholder="请输入匹配模式，支持正则表达式" />
        </Form.Item>
        
        <Form.Item
          name="replacement"
          label="替换内容"
          rules={[{ required: true, message: '请输入替换内容' }]}
        >
          <TextArea rows={3} placeholder="请输入替换内容" />
        </Form.Item>
        
        <Form.Item label="状态">
          <Space>
            <Switch 
              checked={isActive} 
              onChange={setIsActive} 
            />
            <span>{isActive ? '启用' : '禁用'}</span>
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

export default CursorRuleForm;
