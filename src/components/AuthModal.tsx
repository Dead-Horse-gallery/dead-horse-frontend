// AuthModal - Modal component for authentication flows
"use client";

import React from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  intent: 'purchase' | 'save' | 'contact' | 'verify' | 'apply';
}

export default function AuthModal({ isOpen, onClose, intent }: AuthModalProps) {
  if (!isOpen) return null;

  const getIntentMessage = () => {
    switch (intent) {
      case 'purchase':
        return 'Create an account to complete your purchase and unlock exclusive gallery features.';
      case 'save':
        return 'Save your favorite artworks and get personalized recommendations.';
      case 'contact':
        return 'Connect with artists and galleries through your verified account.';
      case 'verify':
        return 'Verify your identity to access premium features and secure transactions.';
      case 'apply':
        return 'Submit your application and join our curated community of artists.';
      default:
        return 'Create an account to unlock all gallery features.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Authentication Required</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          {getIntentMessage()}
        </p>
        
        <div className="space-y-3">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
            Sign Up with Email
          </button>
          <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-lg transition-colors">
            Connect Wallet
          </button>
          <button 
            onClick={onClose}
            className="w-full text-gray-500 hover:text-gray-700 py-2 transition-colors"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
