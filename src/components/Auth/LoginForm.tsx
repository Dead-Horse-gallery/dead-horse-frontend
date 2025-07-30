'use client';

// src/components/Auth/LoginForm.tsx
import React, { useState } from 'react';
import { useHybridAuth } from '../../contexts/HybridAuthContext';
import { MagicUser } from '../../types/auth';

interface LoginFormProps {
  onSuccess?: (user: MagicUser) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMagicLinkSent, setShowMagicLinkSent] = useState(false);
  const { login, user } = useHybridAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowMagicLinkSent(true);

    try {
      await login(email);
      setShowMagicLinkSent(false);
      if (user && onSuccess) {
        onSuccess(user);
      }
    } catch {
      setError('An unexpected error occurred');
      setShowMagicLinkSent(false);
    }
    
    setLoading(false);
  };

  if (showMagicLinkSent && loading) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="mb-4">
            <svg className="animate-spin h-8 w-8 text-black mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
          <p className="text-gray-600 mb-4">
            We sent a magic link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Click the link in your email to complete sign in. This window will automatically update when you&apos;re authenticated.
          </p>
          <button
            onClick={() => {
              setShowMagicLinkSent(false);
              setLoading(false);
              setEmail('');
            }}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Try a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">Dead Horse</h1>
        <p className="text-gray-600">Curated Web3 Art Gallery</p>
      </div>
      
      <h2 className="text-2xl font-bold mb-6 text-center">Welcome</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="your@email.com"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Sending Magic Link...' : 'Send Magic Link'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          We&apos;ll send you a secure login link via email. No passwords needed!
        </p>
        <p className="text-xs text-gray-500 mt-2">
          New to Dead Horse? Your account will be created automatically.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;