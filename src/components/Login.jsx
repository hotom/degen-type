import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Login({ setAuthMode, setLoadingProfile }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if(setLoadingProfile) setLoadingProfile(true); 
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) throw error;
      console.log('Login successful', data);
      // Profile fetching will be handled by onAuthStateChange listener in App.jsx
      // setLoading(false); // Handled by setLoadingProfile in App
    } catch (error) {
      setError(error.message);
      console.error('Login error:', error.message);
      if(setLoadingProfile) setLoadingProfile(false); // Stop loading on error
      setLoading(false); // Also set local loading false on error
    } finally {
      // setLoading(false); // Don't reset here on success, wait for modal close/profile load
    }
  };

  return (
    <div className="text-slate-200">
      <h2 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
          <input
            type="email"
            required
            className="mt-1 block w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
          <input
            type="password"
            required
            className="mt-1 block w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        {error && <p className="text-red-400 text-sm text-center py-2">{error}</p>}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200 transform hover:scale-[1.02]"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="mt-6 text-sm text-center text-slate-400">
        Don't have an account? {' '}
        <button onClick={() => setAuthMode('register')} className="font-medium text-cyan-400 hover:text-cyan-300 underline">
          Register here
        </button>
      </p>
    </div>
  );
} 