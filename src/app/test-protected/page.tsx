"use client";

import React, { useState } from 'react';
// Update the import path below to the correct relative path if the alias does not resolve.
// Example (adjust as needed):
import { useHybridAuth } from '../../contexts/HybridAuthContext';
import { 
  ProtectedPurchase, 
  ProtectedSave, 
  ProtectedContact,
  ProtectedVerify,
  ProtectedApply
} from '../../components/ProtectedAction';

// Icon components for better visual presentation
const ShoppingCartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l1.5-1.5M16 19a2 2 0 100-4 2 2 0 000 4zM9 19a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DocumentIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const WalletIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export default function TestProtectedPage() {
  const { 
    user, 
    wallet, 
    authState, 
    loading, 
    error,
    authIntent,
    getConversionMetrics,
    hasBasicAccess,
    hasWalletAccess,
    hasHybridAccess,
    login,
    logout,
    connectWallet,
    disconnectWallet
  } = useHybridAuth();

  const [actionResults, setActionResults] = useState<Array<{
    intent: string;
    timestamp: string;
    success: boolean;
    message: string;
  }>>([]);

  const metrics = getConversionMetrics();

  // Test action handlers
  const handlePurchase = () => {
    const result = {
      intent: 'purchase',
      timestamp: new Date().toLocaleTimeString(),
      success: true,
      message: 'Purchase initiated successfully!'
    };
    setActionResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const handleSave = () => {
    const result = {
      intent: 'save',
      timestamp: new Date().toLocaleTimeString(),
      success: true,
      message: 'Item saved to favorites!'
    };
    setActionResults(prev => [result, ...prev.slice(0, 9)]);
  };

  const handleContact = () => {
    const result = {
      intent: 'contact',
      timestamp: new Date().toLocaleTimeString(),
      success: true,
      message: 'Contact form opened!'
    };
    setActionResults(prev => [result, ...prev.slice(0, 9)]);
  };

  const handleVerify = () => {
    const result = {
      intent: 'verify',
      timestamp: new Date().toLocaleTimeString(),
      success: true,
      message: 'Identity verification started!'
    };
    setActionResults(prev => [result, ...prev.slice(0, 9)]);
  };

  const handleApply = () => {
    const result = {
      intent: 'apply',
      timestamp: new Date().toLocaleTimeString(),
      success: true,
      message: 'Application submitted!'
    };
    setActionResults(prev => [result, ...prev.slice(0, 9)]);
  };

  const clearResults = () => {
    setActionResults([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading authentication state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">ProtectedAction Test Page</h1>
              <p className="text-gray-400 mt-1">Test all authentication intents and conversion flows</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Current Time</p>
              <p className="text-white font-mono">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Auth Status Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Authentication Status
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Auth State:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    authState === 'anonymous' ? 'bg-red-900 text-red-200' :
                    authState === 'email' ? 'bg-blue-900 text-blue-200' :
                    authState === 'wallet' ? 'bg-green-900 text-green-200' :
                    'bg-purple-900 text-purple-200'
                  }`}>
                    {authState.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Email Login:</span>
                  <span className={user ? 'text-green-400' : 'text-red-400'}>
                    {user ? '✓ Connected' : '✗ Not connected'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Wallet:</span>
                  <span className={wallet?.isConnected ? 'text-green-400' : 'text-red-400'}>
                    {wallet?.isConnected ? '✓ Connected' : '✗ Not connected'}
                  </span>
                </div>

                {user && (
                  <div className="pt-2 border-t border-gray-700">
                    <p className="text-sm text-gray-400">Email:</p>
                    <p className="text-white truncate">{user.email}</p>
                  </div>
                )}

                {wallet?.isConnected && (
                  <div className="pt-2 border-t border-gray-700">
                    <p className="text-sm text-gray-400">Wallet:</p>
                    <p className="text-white font-mono text-xs truncate">{wallet.address}</p>
                  </div>
                )}

                {error && (
                  <div className="pt-2 border-t border-red-700">
                    <p className="text-sm text-red-400">Error:</p>
                    <p className="text-red-300 text-xs">{error.message}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Access Levels */}
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Access Levels</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Basic Access:</span>
                  <span className={hasBasicAccess() ? 'text-green-400' : 'text-red-400'}>
                    {hasBasicAccess() ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Wallet Access:</span>
                  <span className={hasWalletAccess() ? 'text-green-400' : 'text-red-400'}>
                    {hasWalletAccess() ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Hybrid Access:</span>
                  <span className={hasHybridAccess() ? 'text-green-400' : 'text-red-400'}>
                    {hasHybridAccess() ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            </div>

            {/* Auth Controls */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Authentication Controls</h3>
              <div className="space-y-3">
                {!user ? (
                  <button
                    onClick={() => login('test@deadhorse.gallery')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <UserIcon className="w-4 h-4 mr-2" />
                    Test Email Login
                  </button>
                ) : (
                  <button
                    onClick={logout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                )}

                {!wallet?.isConnected ? (
                  <button
                    onClick={() => connectWallet()}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <WalletIcon className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </button>
                ) : (
                  <button
                    onClick={disconnectWallet}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Disconnect Wallet
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Protected Actions Test */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">ProtectedAction Tests</h2>
              <p className="text-gray-400 text-sm mb-6">
                Test each intent type. If not authenticated, you&apos;ll see the auth modal.
              </p>

              <div className="space-y-4">
                {/* Purchase Intent */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <ShoppingCartIcon className="w-4 h-4 mr-2" />
                    Purchase Intent
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Tests purchase-focused authentication flow
                  </p>
                  <ProtectedPurchase 
                    onClick={handlePurchase}
                    metadata={{ 
                      testItem: 'Digital Artwork #123',
                      price: 250,
                      currency: 'GBP'
                    }}
                  >
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors">
                      Test Purchase Action
                    </button>
                  </ProtectedPurchase>
                </div>

                {/* Save Intent */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <HeartIcon className="w-4 h-4 mr-2" />
                    Save Intent
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Tests save/favorite functionality
                  </p>
                  <ProtectedSave 
                    onClick={handleSave}
                    metadata={{ 
                      item: 'Test Artwork',
                      collection: 'Favorites'
                    }}
                  >
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors">
                      Test Save Action
                    </button>
                  </ProtectedSave>
                </div>

                {/* Contact Intent */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <MailIcon className="w-4 h-4 mr-2" />
                    Contact Intent
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Tests contact/messaging flow
                  </p>
                  <ProtectedContact 
                    onClick={handleContact}
                    metadata={{ 
                      contactType: 'artist',
                      subject: 'Test Inquiry'
                    }}
                  >
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors">
                      Test Contact Action
                    </button>
                  </ProtectedContact>
                </div>

                {/* Verify Intent */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <ShieldCheckIcon className="w-4 h-4 mr-2" />
                    Verify Intent
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Tests identity verification flow
                  </p>
                  <ProtectedVerify 
                    onClick={handleVerify}
                    metadata={{ 
                      verificationType: 'identity',
                      level: 'basic'
                    }}
                  >
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors">
                      Test Verify Action
                    </button>
                  </ProtectedVerify>
                </div>

                {/* Apply Intent */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <DocumentIcon className="w-4 h-4 mr-2" />
                    Apply Intent
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Tests application submission flow
                  </p>
                  <ProtectedApply 
                    onClick={handleApply}
                    metadata={{ 
                      applicationType: 'artist',
                      program: 'gallery_submission'
                    }}
                  >
                    <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded transition-colors">
                      Test Apply Action
                    </button>
                  </ProtectedApply>
                </div>
              </div>
            </div>
          </div>

          {/* Results & Analytics */}
          <div className="lg:col-span-1">
            {/* Conversion Metrics */}
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Conversion Metrics</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-400">{metrics.totalAttempts}</p>
                  <p className="text-xs text-gray-400">Total Attempts</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-400">{metrics.successfulConversions}</p>
                  <p className="text-xs text-gray-400">Successful</p>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-3 text-center mb-4">
                <p className="text-2xl font-bold text-yellow-400">
                  {(metrics.conversionRate * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400">Conversion Rate</p>
              </div>

              {Object.keys(metrics.intentBreakdown).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Intent Breakdown</h4>
                  <div className="space-y-2">
                    {Object.entries(metrics.intentBreakdown).map(([intent, count]) => (
                      <div key={intent} className="flex justify-between items-center">
                        <span className="text-sm text-gray-400 capitalize">{intent}</span>
                        <span className="text-white">{String(count)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {metrics.lastAttempt && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h4 className="font-medium mb-2">Last Attempt</h4>
                  <p className="text-sm text-gray-400">
                    Intent: <span className="text-white">{metrics.lastAttempt.intent}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Time: <span className="text-white">{new Date(metrics.lastAttempt.timestamp).toLocaleString()}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Action Results */}
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Action Results</h2>
                {actionResults.length > 0 && (
                  <button
                    onClick={clearResults}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {actionResults.length === 0 ? (
                <p className="text-gray-400 text-sm">No actions performed yet. Try the protected actions above!</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {actionResults.map((result, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium capitalize">{result.intent}</span>
                        <span className="text-xs text-gray-400">{result.timestamp}</span>
                      </div>
                      <p className={`text-sm ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                        {result.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Auth Intent Display */}
        {authIntent && (
          <div className="mt-8 bg-blue-900 border border-blue-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-200">
                  Auth Modal Active
                </h3>
                <div className="mt-2 text-sm text-blue-300">
                  <p>Current intent: <span className="font-medium">{authIntent}</span></p>
                  <p className="text-xs text-blue-400 mt-1">This would normally show the authentication modal.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
