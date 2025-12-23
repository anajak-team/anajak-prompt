
import React, { useState } from 'react';
import { GoogleIcon } from './Icons';
import { supabase } from '../services/supabase';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) alert(error.message);
    setIsLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) alert(error.message);
    else setMessage('Check your email for the magic link!');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700 p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Cloud Vault</h1>
          <p className="text-gray-400 text-sm mt-1">Sync your prompts across all devices.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-2.5 px-4 rounded-xl transition-all disabled:opacity-70 group shadow-lg"
          >
            <GoogleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="px-3 text-xs text-gray-500 uppercase">or use magic link</span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>

          <form onSubmit={handleMagicLink} className="space-y-3">
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 transition outline-none"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              Send Magic Link
            </button>
          </form>

          {message && <p className="text-green-400 text-sm mt-4">{message}</p>}
          
          <p className="text-[10px] text-gray-500 mt-6 leading-relaxed">
            By joining, you agree to our Cloud Terms. Images are stored in your private Supabase bucket.
          </p>
        </div>
      </div>
    </div>
  );
};
