
import React, { useState, useEffect, useCallback } from 'react';
import { PromptForm } from './components/PromptForm';
import { PromptList } from './components/PromptList';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { LoginPage } from './components/LoginPage';
import { LogoutIcon } from './components/Icons';
import type { Prompt, NewPrompt, User } from './types';
import { supabase, getPrompts, savePrompt, updatePrompt, deletePrompt, batchInsertPrompts } from './services/supabase';

declare const XLSX: any;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
          email: session.user.email || '',
          avatar: session.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`
        });
      }
      setIsInitializing(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
          email: session.user.email || '',
          avatar: session.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshPrompts = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getPrompts();
      setPrompts(data || []);
    } catch (err) {
      console.error("Error fetching prompts:", err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshPrompts();
    }
  }, [refreshPrompts, user]);

  const handleSavePrompt = async (promptData: NewPrompt | Prompt) => {
    if (!user) return;
    try {
      if ('id' in promptData) {
        await updatePrompt(promptData.id, {
          title: promptData.title,
          text: promptData.text,
          image_url: promptData.image_url
        });
      } else {
        await savePrompt(promptData, user.id);
      }
      await refreshPrompts();
      setEditingPrompt(null);
    } catch (err) {
      alert("Failed to save prompt. Please check your Supabase table permissions.");
    }
  };

  const handleImport = async (file: File) => {
    if (!user) return;
    setIsImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result;
        let promptsToImport: any[] = [];

        if (file.name.endsWith('.json')) {
          promptsToImport = JSON.parse(content as string);
        } else {
          const workbook = XLSX.read(content, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          promptsToImport = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        }

        const formatted = promptsToImport.map(p => ({
          title: p.title || 'Untitled',
          text: p.text || '',
          image_url: p.image_url || null,
          user_id: user.id
        }));

        await batchInsertPrompts(formatted);
        await refreshPrompts();
        alert(`Successfully imported ${formatted.length} prompts to Cloud!`);
      };

      if (file.name.endsWith('.json')) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    } catch (err) {
      alert("Import failed: " + (err as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleConfirmDelete = async () => {
    if (promptToDelete) {
      try {
        await deletePrompt(promptToDelete.id);
        await refreshPrompts();
        setPromptToDelete(null);
      } catch (err) {
        alert("Failed to delete prompt.");
      }
    }
  };

  const filteredPrompts = prompts.filter(prompt =>
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={() => { }} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-20 border-b border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <h1 className="text-xl font-bold text-indigo-400 hidden sm:block">
                <span className="text-white">ANAJAK</span> Prompt V.0.1
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gray-900/50 py-1.5 px-3 rounded-full border border-gray-700">
                <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full bg-gray-700 object-cover" />
                <div className="hidden md:block text-left leading-tight">
                  <p className="text-xs font-semibold text-white">{user.name}</p>
                  <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  title="Sign Out"
                >
                  <LogoutIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {isImporting && (
          <div className="mb-6 bg-indigo-600/20 border border-indigo-500/50 rounded-lg p-3 text-center text-indigo-300 animate-pulse">
            Processing Cloud Import...
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <PromptForm
              onSave={handleSavePrompt}
              editingPrompt={editingPrompt}
              onCancelEdit={() => setEditingPrompt(null)}
            />
          </div>
          <div className="lg:col-span-2">
            <PromptList
              prompts={filteredPrompts}
              totalPrompts={prompts.length}
              onDelete={(id) => setPromptToDelete(prompts.find(p => p.id === id) || null)}
              onEdit={setEditingPrompt}
              viewMode={viewMode}
              onSetViewMode={setViewMode}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onImport={handleImport}
            />
          </div>
        </div>
      </main>

      <DeleteConfirmationModal
        isOpen={!!promptToDelete}
        onCancel={() => setPromptToDelete(null)}
        onConfirm={handleConfirmDelete}
        promptTitle={promptToDelete?.title || ''}
      />
    </div>
  );
};

export default App;
