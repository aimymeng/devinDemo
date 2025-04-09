import React from 'react';
import { Prompt } from '../types';

interface PromptListProps {
  prompts: Prompt[];
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
}

const PromptList: React.FC<PromptListProps> = ({ prompts, onEdit, onDelete }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {prompts.length === 0 ? (
          <li className="px-6 py-4 text-center text-gray-500">
            暂无 Prompt，请添加新的 Prompt
          </li>
        ) : (
          prompts.map((prompt) => (
            <li key={prompt.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{prompt.title}</h3>
                  <div className="mt-1">
                    <p className="text-sm text-gray-500 line-clamp-2">{prompt.content}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {prompt.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={() => onEdit(prompt)}
                    className="mr-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => onDelete(prompt.id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    删除
                  </button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default PromptList;
