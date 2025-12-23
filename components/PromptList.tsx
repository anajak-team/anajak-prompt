
import React from 'react';
import type { Prompt } from '../types';
import { PromptCard } from './PromptCard';
import { FilePlusIcon, ListIcon, GridIcon, SearchIcon, ImportIcon, ExportIcon, DownloadIcon } from './Icons';

// Make TypeScript aware of the global XLSX object from the CDN script
declare const XLSX: any;

interface PromptListProps {
  prompts: Prompt[];
  totalPrompts: number;
  onDelete: (id: string) => void;
  onEdit: (prompt: Prompt) => void;
  viewMode: 'list' | 'grid';
  onSetViewMode: (mode: 'list' | 'grid') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onImport: (file: File) => void;
}

export const PromptList: React.FC<PromptListProps> = ({ prompts, totalPrompts, onDelete, onEdit, viewMode, onSetViewMode, searchQuery, onSearchChange, onImport }) => {

  const handleExportJson = () => {
    const dataStr = JSON.stringify(prompts, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    link.download = `cloud-vault-export-${timestamp}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const handleExportTemplate = () => {
    const templateData = [
      { title: "Example: Sci-Fi Character", text: "Create a detailed description of a rogue android bounty hunter navigating the neon-lit underbelly of a futuristic city." },
      { title: "Example: Fantasy Landscape", text: "Describe a hidden valley where ancient trees have silver leaves and the river glows with soft, ethereal light at night." },
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Prompts");
    const cols = [{ wch: 40 }, { wch: 100 }];
    worksheet["!cols"] = cols;
    XLSX.writeFile(workbook, "Prompt-Vault-Template.xlsx");
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
    event.target.value = '';
  };
  
  const fileInputAccept = ".json, .xlsx, .xls";

  if (totalPrompts === 0 && !searchQuery) {
    return (
      <div className="text-center bg-gray-800/50 border border-dashed border-gray-700 rounded-lg p-12">
        <FilePlusIcon className="mx-auto h-12 w-12 text-gray-500" />
        <h3 className="mt-2 text-lg font-medium text-white">No prompts in Cloud</h3>
        <p className="mt-1 text-sm text-gray-400">Sync is active. Create a prompt or import a file to start.</p>
        <div className='flex justify-center items-center space-x-4'>
          <label htmlFor="import-button-empty" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition cursor-pointer">
            <ImportIcon className="w-5 h-5 mr-2" />
            Import to Cloud
          </label>
          <input
            type="file"
            id="import-button-empty"
            className="sr-only"
            accept={fileInputAccept}
            onChange={handleFileSelect}
          />
           <button onClick={handleExportTemplate} className="mt-4 inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition">
            <DownloadIcon className="w-5 h-5 mr-2" />
            Download Template
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-xl font-semibold text-white self-start sm:self-center shrink-0">Cloud Storage</h2>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <SearchIcon className="w-5 h-5 text-gray-500" />
            </span>
            <input
              type="search"
              placeholder="Search cloud..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
          <div className="flex-shrink-0 flex items-center space-x-1 p-1 bg-gray-800 border border-gray-700 rounded-lg">
            <label htmlFor="import-button" className="p-1.5 rounded-md text-gray-400 hover:text-white transition-colors cursor-pointer" title="Import to Cloud">
              <ImportIcon className="w-5 h-5" />
            </label>
            <input type="file" id="import-button" className="sr-only" accept={fileInputAccept} onChange={handleFileSelect}/>
            <button onClick={handleExportJson} className="p-1.5 rounded-md text-gray-400 hover:text-white transition-colors" title="Export Cloud Data"><ExportIcon className="w-5 h-5"/></button>
            <button onClick={handleExportTemplate} className="p-1.5 rounded-md text-gray-400 hover:text-white transition-colors" title="Download Excel Template"><DownloadIcon className="w-5 h-5"/></button>
            <span className="w-px h-5 bg-gray-700 mx-1"></span>
            <button
              onClick={() => onSetViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              <ListIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => onSetViewMode('grid')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              <GridIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {prompts.length === 0 && searchQuery && (
         <div className="text-center bg-gray-800/50 border border-dashed border-gray-700 rounded-lg p-12">
          <SearchIcon className="mx-auto h-12 w-12 text-gray-500" />
          <h3 className="mt-2 text-lg font-medium text-white">No Cloud Matches</h3>
          <p className="mt-1 text-sm text-gray-400">No prompts found for "{searchQuery}".</p>
        </div>
      )}

      <div className={viewMode === 'list'
        ? 'space-y-4'
        : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
      }>
        {prompts.map(prompt => (
          <PromptCard 
            key={prompt.id} 
            prompt={prompt} 
            onDelete={onDelete} 
            onEdit={onEdit} 
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
};
