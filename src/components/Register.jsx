import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Register({ onSwitchToLogin, setAuthMode, initialReferralCode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (initialReferralCode) {
      setReferralCode(initialReferralCode);
      console.log('[Register] Using initial referral code from prop:', initialReferralCode);
    } else {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get('ref');
      if (refCode) {
        setReferralCode(refCode.toUpperCase());
        console.log('[Register] Using referral code from current URL (fallback): ', refCode.toUpperCase());
      }
    }
  }, [initialReferralCode]);

  const handleRegister = async (e) => {
    e.preventDefault();
    // Basic frontend validation
    if (username.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (referralCode && referralCode.length !== 5) {
      setError('Referral code must be exactly 5 characters long if provided.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { 
            username: username, 
            referred_by: referralCode || null 
          }
        }
      });

      if (signUpError) throw signUpError;

      // Check if the user is authenticated
      const session = supabase.auth.getSession();
      if (!session) {
        console.error('User is not authenticated');
        setError('User is not authenticated');
        return;
      }

      // Manual upsert into users table to record referred_by and generate referral_code
      const newUserId = data.user.id;
      const generatedCode = Math.random().toString(36).substring(2, 7).toUpperCase();

      const { error: upsertError } = await supabase.from('users').upsert(
        {
          auth_user_id: newUserId,
          username: username,
          referral_code: generatedCode,
          referred_by: referralCode || null,
          points: 0
        },
        { onConflict: ['auth_user_id'] }
      );
      if (upsertError) {
        console.error('Error upserting user record:', upsertError.message);
        setError('Registration succeeded but failed to store referral info.');
        return; // prevent clearing form
      }

      setMessage('Registration successful! Please check your email to verify your account.');
      console.log('Registration successful', data);
      setEmail('');
      setPassword('');
      setUsername('');
      setReferralCode('');

    } catch (error) {
      setError(error.message);
      console.error('Registration error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-slate-200">
      <h2 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">Register Account</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Username (min 3 chars)</label>
          <input
            type="text"
            required
            minLength="3"
            className="mt-1 block w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
          />
        </div>
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
          <label className="block text-sm font-medium text-slate-400 mb-1">Password (min 6 chars)</label>
          <input
            type="password"
            required
            minLength="6"
            className="mt-1 block w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Referral Code (Optional)</label>
          <input
            type="text"
            maxLength="5" 
            className="mt-1 block w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-500 font-mono uppercase"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            placeholder="ABCDE (Optional)"
          />
        </div>
        {error && <p className="text-red-400 text-sm text-center py-2">{error}</p>}
        {message && <p className="text-green-400 text-sm text-center py-2">{message}</p>}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200 transform hover:scale-[1.02]"
        >
          {loading ? 'Registering...' : 'Create Account'}
        </button>
      </form>
      <p className="mt-6 text-sm text-center text-slate-400">
        Already have an account? {' '}
        <button onClick={() => setAuthMode('login')} className="font-medium text-cyan-400 hover:text-cyan-300 underline">
          Login here
        </button>
      </p>
    </div>
  );
} 