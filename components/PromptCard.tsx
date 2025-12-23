
import React, { useState } from 'react';
import type { Prompt } from '../types';
import { TrashIcon, EditIcon, CopyIcon, CheckIcon, ImageIcon } from './Icons';

interface PromptCardProps {
  prompt: Prompt;
  onDelete: (id: string) => void;
  onEdit: (prompt: Prompt) => void;
  viewMode: 'list' | 'grid';
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, onDelete, onEdit, viewMode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const formattedDate = new Date(prompt.created_at).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const isListView = viewMode === 'list';

  const ActionButtons = () => (
    <div className={`flex items-center space-x-1 ${isListView ? 'ml-auto' : 'absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'}`}>
      <button onClick={handleCopy} className="p-1.5 rounded-full bg-gray-900/60 hover:bg-gray-900 text-gray-300 hover:text-green-400 backdrop-blur-sm">
        {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
      </button>
      <button onClick={() => onEdit(prompt)} className="p-1.5 rounded-full bg-gray-900/60 hover:bg-gray-900 text-gray-300 hover:text-blue-400 backdrop-blur-sm">
        <EditIcon className="w-4 h-4" />
      </button>
      <button onClick={() => onDelete(prompt.id)} className="p-1.5 rounded-full bg-gray-900/60 hover:bg-gray-900 text-gray-300 hover:text-red-400 backdrop-blur-sm">
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );

  if (isListView) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 transition-all hover:border-indigo-500/50 p-3 flex items-center space-x-4 group">
        <div className="w-12 h-12 flex-shrink-0 bg-gray-700 rounded overflow-hidden">
          {prompt.image_url ? (
            <img src={prompt.image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-gray-500" /></div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white truncate" title={prompt.title}>{prompt.title}</h3>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>
        <ActionButtons />
      </div>
    );
  }

  return (
    <div className="group relative bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 transition-all hover:border-indigo-500/50 flex flex-col">
      <div className="aspect-[3/4] bg-gray-700">
        {prompt.image_url ? (
          <img src={prompt.image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-gray-600" /></div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-gray-900 to-transparent">
        <h3 className="text-xs font-semibold text-white truncate" title={prompt.title}>{prompt.title}</h3>
      </div>
      <ActionButtons />
    </div>
  );
};
