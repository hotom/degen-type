import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Register({ supabase, setSession, setLoadingProfile, setAuthMode, initialReferralCode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState(initialReferralCode || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Basic validation
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (referralCode && referralCode.length !== 5) {
        throw new Error('Referral code must be 5 characters long');
      }

      // Prepare registration data
      const registrationData = {
        email,
        password,
        options: {
          data: {
            username: username || null,
            referred_by: referralCode || null
          }
        }
      };

      console.log('[Register] Starting registration process...');
      const { data, error } = await supabase.auth.signUp(registrationData);

      if (error) {
        console.error('[Register] Registration error:', error);
        throw error;
      }

      if (data?.user) {
        console.log('[Register] User created in auth:', data.user);
        setSuccess('Registration successful! Please check your email to confirm your account.');
        setEmail('');
        setPassword('');
        setUsername('');
        setReferralCode('');
      }
    } catch (error) {
      console.error('[Register] Error during registration:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="Enter your password"
          />
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1">
            Username (optional)
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="Choose a username (optional)"
          />
        </div>

        <div>
          <label htmlFor="referralCode" className="block text-sm font-medium text-slate-300 mb-1">
            Referral Code (optional)
          </label>
          <input
            id="referralCode"
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="Enter referral code (optional)"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow hover:shadow-lg transform hover:-translate-y-px transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="text-center mt-4">
        <button
          onClick={() => setAuthMode('login')}
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          Already have an account? Log in
        </button>
      </div>
    </div>
  );
} 