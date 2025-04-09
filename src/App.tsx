import React, { useState } from 'react';
import { Layout, Typography, Button, message, Menu } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Prompt } from './types';
import { CursorRule } from './types/cursorrule';
import PromptList from './components/PromptList';
import PromptForm from './components/PromptForm';
import CursorRuleList from './components/CursorRuleList';
import CursorRuleForm from './components/CursorRuleForm';
import MCPManagement from './components/MCPManagement';

const { Header, Content } = Layout;
const { Title } = Typography;

const initialPrompts: Prompt[] = [
  { id: '1', title: '客户服务问题', content: '您好，我是客服助手，请问有什么可以帮您解决的问题？', tags: ['客服', '问候'] },
  { id: '2', title: '产品咨询', content: '感谢您对我们产品的关注，请问您想了解哪些具体信息？', tags: ['产品', '咨询'] },
  { id: '3', title: '技术支持', content: '您好，我是技术支持团队，请详细描述您遇到的技术问题，我们将尽快为您解决。', tags: ['技术', '支持'] },
];

const initialRules: CursorRule[] = [
  { id: '1', name: '替换空格', pattern: '\\s+', replacement: ' ', isActive: true },
  { id: '2', name: '移除特殊字符', pattern: '[^\\w\\s]', replacement: '', isActive: false },
  { id: '3', name: '转换为小写', pattern: '[A-Z]', replacement: '\\L$0', isActive: true },
];

const App: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isPromptFormVisible, setIsPromptFormVisible] = useState(false);
  
  const [rules, setRules] = useState<CursorRule[]>(initialRules);
  const [editingRule, setEditingRule] = useState<CursorRule | null>(null);
  const [isRuleFormVisible, setIsRuleFormVisible] = useState(false);
  
  const [activeTab, setActiveTab] = useState('1');

  const handleAddPrompt = (newPrompt: Omit<Prompt, 'id'>) => {
    const prompt = {
      ...newPrompt,
      id: Date.now().toString(),
    };
    setPrompts([...prompts, prompt]);
    setIsPromptFormVisible(false);
    message.success('Prompt 添加成功！');
  };

  const handleEditPrompt = (updatedPrompt: Prompt | Omit<Prompt, 'id'>) => {
    if ('id' in updatedPrompt) {
      setPrompts(prompts.map(p => p.id === updatedPrompt.id ? updatedPrompt as Prompt : p));
      setEditingPrompt(null);
      setIsPromptFormVisible(false);
      message.success('Prompt 更新成功！');
    }
  };

  const handleDeletePrompt = (id: string) => {
    setPrompts(prompts.filter(p => p.id !== id));
    message.success('Prompt 删除成功！');
  };

  const startEditingPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsPromptFormVisible(true);
  };

  const handleAddRule = (newRule: Omit<CursorRule, 'id'>) => {
    const rule = {
      ...newRule,
      id: Date.now().toString(),
    };
    setRules([...rules, rule]);
    setIsRuleFormVisible(false);
    message.success('规则添加成功！');
  };

  const handleEditRule = (updatedRule: CursorRule | Omit<CursorRule, 'id'>) => {
    if ('id' in updatedRule) {
      setRules(rules.map(r => r.id === updatedRule.id ? updatedRule as CursorRule : r));
      setEditingRule(null);
      setIsRuleFormVisible(false);
      message.success('规则更新成功！');
    }
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
    message.success('规则删除成功！');
  };

  const startEditingRule = (rule: CursorRule) => {
    setEditingRule(rule);
    setIsRuleFormVisible(true);
  };

  const handleToggleRuleActive = (id: string, isActive: boolean) => {
    setRules(rules.map(r => r.id === id ? { ...r, isActive } : r));
    message.success(`规则${isActive ? '启用' : '禁用'}成功！`);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Title level={3} style={{ margin: 0, marginRight: '48px' }}>管理系统</Title>
          <Menu
            mode="horizontal"
            selectedKeys={[activeTab]}
            style={{ flex: 1, border: 'none' }}
            onSelect={({ key }) => setActiveTab(key as string)}
            items={[
              { key: '1', label: 'Prompt 管理' },
              { key: '2', label: 'CursorRule 管理' },
              { key: '3', label: 'MCP 管理' }
            ]}
          />
        </div>
      </Header>
      <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Prompt Management */}
        <div style={{ display: activeTab === '1' ? 'block' : 'none' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <Title level={4} style={{ margin: 0 }}>Prompt 列表</Title>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => {
                  setEditingPrompt(null);
                  setIsPromptFormVisible(true);
                }}
              >
                添加新 Prompt
              </Button>
            </div>
            
            {isPromptFormVisible ? (
              <PromptForm 
                onSubmit={editingPrompt ? handleEditPrompt : handleAddPrompt} 
                initialData={editingPrompt}
                onCancel={() => {
                  setIsPromptFormVisible(false);
                  setEditingPrompt(null);
                }}
              />
            ) : (
              <PromptList 
                prompts={prompts} 
                onEdit={startEditingPrompt} 
                onDelete={handleDeletePrompt} 
              />
            )}
          </div>
        </div>
        
        {/* CursorRule Management */}
        <div style={{ display: activeTab === '2' ? 'block' : 'none' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <Title level={4} style={{ margin: 0 }}>规则列表</Title>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => {
                  setEditingRule(null);
                  setIsRuleFormVisible(true);
                }}
              >
                添加新规则
              </Button>
            </div>
            
            {isRuleFormVisible ? (
              <CursorRuleForm 
                onSubmit={editingRule ? handleEditRule : handleAddRule} 
                initialData={editingRule}
                onCancel={() => {
                  setIsRuleFormVisible(false);
                  setEditingRule(null);
                }}
              />
            ) : (
              <CursorRuleList 
                rules={rules} 
                onEdit={startEditingRule} 
                onDelete={handleDeleteRule}
                onToggleActive={handleToggleRuleActive}
              />
            )}
          </div>
        </div>
        
        {/* MCP Management */}
        <div style={{ display: activeTab === '3' ? 'block' : 'none' }}>
          <MCPManagement />
        </div>
      </Content>
    </Layout>
  );
};

export default App;
