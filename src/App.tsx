import React, { useState } from 'react';
import PromptList from './components/PromptList';
import PromptForm from './components/PromptForm';
import { Prompt } from './types';

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
  };

  const handleEditPrompt = (updatedPrompt: Prompt | Omit<Prompt, 'id'>) => {
    if ('id' in updatedPrompt) {
      setPrompts(prompts.map(p => p.id === updatedPrompt.id ? updatedPrompt as Prompt : p));
      setEditingPrompt(null);
      setIsFormVisible(false);
    }
  };

  const handleDeletePrompt = (id: string) => {
    setPrompts(prompts.filter(p => p.id !== id));
  };

  const startEditing = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsFormVisible(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Prompt 管理系统</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Prompt 列表</h2>
            <button
              onClick={() => {
                setEditingPrompt(null);
                setIsFormVisible(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              添加新 Prompt
            </button>
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
      </main>
    </div>
  );
};

export default App;
