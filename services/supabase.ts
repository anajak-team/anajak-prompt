
const SUPABASE_URL = 'https://svbckycmqzpoxwpjirzu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2YmNreWNtcXpwb3h3cGppcnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NzAyNTEsImV4cCI6MjA4MjA0NjI1MX0.SXW6LmEpY487J3H4bnBQ0hUwxC4nSn8rkLwAarpV2xo';

// @ts-ignore - Supabase is loaded via CDN
const { createClient } = window.supabase;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const getPrompts = async () => {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const savePrompt = async (prompt: any, userId: string) => {
  const { data, error } = await supabase
    .from('prompts')
    .insert([{ ...prompt, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const batchInsertPrompts = async (prompts: any[]) => {
  const { data, error } = await supabase
    .from('prompts')
    .insert(prompts)
    .select();

  if (error) throw error;
  return data;
};

export const updatePrompt = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('prompts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePrompt = async (id: string) => {
  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const uploadImage = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('prompts')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('prompts')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
