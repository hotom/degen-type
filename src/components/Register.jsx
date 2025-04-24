import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Register({ onSwitchToLogin, setAuthMode, initialReferralCode }) {
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState(initialReferralCode || '');
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
    setLoading(true);
    setError(null);
    setMessage(null);

    console.log('[Register] Starting registration process...');

    // Validate username length
    if (username.length < 3) {
      console.log('[Register] Username validation failed: too short');
      setError('Username must be at least 3 characters long');
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      console.log('[Register] Password validation failed: too short');
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Validate referral code length if provided
    if (referralCode && referralCode.length !== 5) {
      console.log('[Register] Referral code validation failed: invalid length');
      setError('Referral code must be 5 characters long');
      setLoading(false);
      return;
    }

    // Validate email match
    if (email !== confirmEmail) {
      console.log('[Register] Email validation failed: emails do not match');
      setError('Emails do not match');
      setLoading(false);
      return;
    }

    try {
      console.log('[Register] All validations passed, preparing registration data...');
      
      // Prepare registration data
      const registrationData = {
        email,
        password,
        options: {
          data: {
            username,
            referred_by: referralCode || null
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          // Enable email confirmation
          emailConfirm: true
        }
      };

      console.log('[Register] Registration data prepared:', {
        email,
        username,
        referred_by: referralCode || null,
        options: registrationData.options,
        emailConfirm: true
      });

      // Register the user
      console.log('[Register] Calling Supabase auth.signUp with email confirmation...');
      const { data, error } = await supabase.auth.signUp(registrationData);

      if (error) {
        console.error('[Register] Auth signUp error:', error);
        setError(error.message);
      } else {
        console.log('[Register] Auth signUp successful:', {
          userId: data?.user?.id,
          email: data?.user?.email,
          metadata: data?.user?.user_metadata,
          emailConfirmed: data?.user?.email_confirmed_at,
          confirmationSent: data?.user?.confirmation_sent_at
        });

        if (data?.user) {
          console.log('[Register] User created in auth, waiting for email confirmation...');
          setMessage('Check your email to complete registration');
          // Clear form
          setEmail('');
          setConfirmEmail('');
          setPassword('');
          setUsername('');
          setReferralCode('');
          // Switch to login mode after successful registration
          setTimeout(() => {
            setAuthMode('login');
          }, 2000);
        } else {
          console.error('[Register] No user data in response');
          setError('Registration failed - no user data received');
        }
      }
    } catch (err) {
      console.error('[Register] Unexpected error during registration:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg backdrop-blur-sm">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400 mb-6 text-center">
        Create Account
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}
      
      {message && (
        <div className="mb-4 p-3 bg-teal-500/20 border border-teal-500/50 rounded-lg text-teal-300 text-sm">
          {message}
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
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label htmlFor="confirmEmail" className="block text-sm font-medium text-slate-300 mb-1">
            Confirm Email
          </label>
          <input
            id="confirmEmail"
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Confirm your email"
            required
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
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Enter your password"
            required
          />
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Choose a username"
            required
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
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Enter referral code"
            maxLength={5}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => setAuthMode('login')}
          className="text-sm text-slate-400 hover:text-teal-300 transition duration-200"
        >
          Already have an account? Log in
        </button>
      </div>
    </div>
  );
} 