'use client';

// src/app/test-auth/page.tsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from '../../components/Auth/LoginForm';

const TestAuth = () => {
  const { user, loading, logout, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 text-black mx-auto mb-4">
            <svg fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <strong>Authentication Successful! 🎉</strong>
          </div>

          {/* User Profile Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Welcome to Dead Horse!</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-lg">{user.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Wallet Address</label>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded truncate">
                  {user.publicAddress}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">User Role</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.role === 'admin' ? 'bg-red-100 text-red-800' :
                  user.role === 'artist' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.role || 'user'}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Display Name</label>
                <p className="text-lg">{user.display_name || 'Not set'}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={logout}
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
              >
                Go to Gallery
              </button>
            </div>
          </div>

          {/* Backend Connection Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Backend Connection Status</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Magic.link Authentication ✅</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Database Connection ✅</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>User Profile Loaded ✅</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <LoginForm onSuccess={(user) => {
        console.log('Login successful!', user);
      }} />
    </div>
  );
};

export default TestAuth;