
import React, { useState, useEffect } from 'react';
import type { NewPrompt, Prompt } from '../types';
import { ImageIcon, SaveIcon, CancelIcon } from './Icons';
import { uploadImage } from '../services/supabase';

interface PromptFormProps {
  onSave: (prompt: NewPrompt | Prompt) => void;
  editingPrompt: Prompt | null;
  onCancelEdit: () => void;
}

export const PromptForm: React.FC<PromptFormProps> = ({ onSave, editingPrompt, onCancelEdit }) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editingPrompt) {
      setTitle(editingPrompt.title);
      setText(editingPrompt.text);
      setImageUrl(editingPrompt.image_url);
    } else {
      setTitle('');
      setText('');
      setImageUrl(null);
    }
  }, [editingPrompt]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        const url = await uploadImage(file);
        setImageUrl(url);
      } catch (err) {
        alert("Image upload failed. Ensure you have a 'prompts' bucket created and public.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) {
      alert('Please fill in both title and prompt text.');
      return;
    }
    
    const payload = { title, text, image_url: imageUrl };
    if (editingPrompt) {
      onSave({ ...editingPrompt, ...payload });
    } else {
      onSave(payload);
    }

    setTitle('');
    setText('');
    setImageUrl(null);
  };

  return (
    <div className="sticky top-24">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-xl space-y-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white">{editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}</h2>
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="e.g., Sci-Fi Cityscape"
            required
          />
        </div>

        <div>
          <label htmlFor="prompt-text" className="block text-sm font-medium text-gray-300 mb-1">Prompt Text</label>
          <textarea
            id="prompt-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="Describe your creative vision..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Inspiration Image</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md relative min-h-[140px]">
            {isUploading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-indigo-500"></div>
                <span className="text-gray-400">Uploading to Cloud...</span>
              </div>
            ) : imageUrl ? (
              <div className="relative group">
                <img src={imageUrl} alt="Preview" className="h-48 w-full object-cover rounded-md"/>
                <button 
                  type="button" 
                  onClick={() => setImageUrl(null)} 
                  className="absolute top-2 right-2 bg-red-600/70 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CancelIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-1 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-500"/>
                <div className="flex text-sm text-gray-400">
                  <label htmlFor="image-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300">
                    <span>Upload to Storage</span>
                    <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button type="submit" disabled={isUploading} className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition">
            <SaveIcon className="w-5 h-5 mr-2" />
            {editingPrompt ? 'Update' : 'Save to Cloud'}
          </button>
          {editingPrompt && (
            <button type="button" onClick={onCancelEdit} className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-300 bg-gray-700 hover:bg-gray-600 transition">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
