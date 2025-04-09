import React, { useState } from 'react';
import { Layout, Typography, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Prompt } from './types';
import PromptList from './components/PromptList';
import PromptForm from './components/PromptForm';

const { Header, Content } = Layout;
const { Title } = Typography;

const initialPrompts: Prompt[] = [
  { id: '1', title: '客户服务问题', content: '您好，我是客服助手，请问有什么可以帮您解决的问题？', tags: ['客服', '问候'] },
  { id: '2', title: '产品咨询', content: '感谢您对我们产品的关注，请问您想了解哪些具体信息？', tags: ['产品', '咨询'] },
  { id: '3', title: '技术支持', content: '您好，我是技术支持团队，请详细描述您遇到的技术问题，我们将尽快为您解决。', tags: ['技术', '支持'] },
];

const App: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleAddPrompt = (newPrompt: Omit<Prompt, 'id'>) => {
    const prompt = {
      ...newPrompt,
      id: Date.now().toString(),
    };
    setPrompts([...prompts, prompt]);
    setIsFormVisible(false);
    message.success('Prompt 添加成功！');
  };

  const handleEditPrompt = (updatedPrompt: Prompt | Omit<Prompt, 'id'>) => {
    if ('id' in updatedPrompt) {
      setPrompts(prompts.map(p => p.id === updatedPrompt.id ? updatedPrompt as Prompt : p));
      setEditingPrompt(null);
      setIsFormVisible(false);
      message.success('Prompt 更新成功！');
    }
  };

  const handleDeletePrompt = (id: string) => {
    setPrompts(prompts.filter(p => p.id !== id));
    message.success('Prompt 删除成功！');
  };

  const startEditing = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsFormVisible(true);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Title level={3} style={{ margin: 0 }}>Prompt 管理系统</Title>
        </div>
      </Header>
      <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <Title level={4} style={{ margin: 0 }}>Prompt 列表</Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => {
                setEditingPrompt(null);
                setIsFormVisible(true);
              }}
            >
              添加新 Prompt
            </Button>
          </div>
          
          {isFormVisible ? (
            <PromptForm 
              onSubmit={editingPrompt ? handleEditPrompt : handleAddPrompt} 
              initialData={editingPrompt}
              onCancel={() => {
                setIsFormVisible(false);
                setEditingPrompt(null);
              }}
            />
          ) : (
            <PromptList 
              prompts={prompts} 
              onEdit={startEditing} 
              onDelete={handleDeletePrompt} 
            />
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default App;
