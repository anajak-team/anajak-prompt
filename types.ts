
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Prompt {
  id: string;
  title: string;
  text: string;
  image_url: string | null;
  user_id: string;
  created_at: string;
}

export type NewPrompt = Omit<Prompt, 'id' | 'created_at' | 'user_id'>;
