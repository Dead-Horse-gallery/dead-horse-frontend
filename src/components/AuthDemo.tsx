'use client';

import { useState } from 'react';
import { useHybridAuth } from '../contexts/HybridAuthContext';
import { log } from '../lib/logger';

export const AuthDemo = () => {
  const {
    user,
    wallet,
    profile,
    authState,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    connectWallet,
    disconnectWallet,
    linkWallet,
    unlinkWallet,
    upgradeToHybrid,
    checkAccess,
    claimCustodialAssets,
    mintNFTCertificate
  } = useHybridAuth();

  const [email, setEmail] = useState('');
  const [selectedArtwork, setSelectedArtwork] = useState('artwork_123');

  const handleLogin = async () => {
    if (!email) return;
    try {
      await login(email);
    } catch (err) {
      log.error('Login failed', { error: err, email });
    }
  };

  const handleMintNFT = async () => {
    try {
      const tokenId = await mintNFTCertificate(selectedArtwork);
      log.info("Demo action", { message: `NFT minted successfully! Token ID: ${tokenId}` });
    } catch (err) {
      log.error('Minting failed', { error: err, artwork: selectedArtwork });
      log.info("Demo action", { message: 'Minting failed: ' + (err as Error).message });
    }
  };

  const handleClaimAssets = async () => {
    try {
      const result = await claimCustodialAssets();
      log.info("Demo action", { message: `Assets claimed successfully! ${JSON.stringify(result, null, 2)}` });
    } catch (err) {
      log.error('Claiming failed', { error: err });
      log.info("Demo action", { message: 'Claiming failed: ' + (err as Error).message });
    }
  };

  const getAuthStateColor = (state: string) => {
    switch (state) {
      case 'anonymous': return 'bg-gray-500';
      case 'email': return 'bg-blue-500';
      case 'wallet': return 'bg-green-500';
      case 'hybrid': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">Dead Horse Gallery - Hybrid Authentication Demo</h1>
        
        {/* Auth State Display */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-lg font-semibold">Authentication State:</span>
            <span className={`px-3 py-1 rounded-full text-white font-medium ${getAuthStateColor(authState)}`}>
              {authState.toUpperCase()}
            </span>
            <span className="text-sm text-gray-600">
              {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </span>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>{error.code}:</strong> {error.message}
            </div>
          )}
        </div>

        {/* User Info */}
        {user && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Magic.link User</h3>
            <div className="text-sm space-y-1">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Issuer:</strong> {user.issuer}</p>
              {user.publicAddress && <p><strong>Magic Address:</strong> {user.publicAddress}</p>}
            </div>
          </div>
        )}

        {/* Wallet Info */}
        {wallet && (
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-900 mb-2">Connected Wallet</h3>
            <div className="text-sm space-y-1">
              <p><strong>Address:</strong> {wallet.address}</p>
              <p><strong>Chain ID:</strong> {wallet.chainId}</p>
              <p><strong>Connector:</strong> {wallet.connector}</p>
              {wallet.balance && <p><strong>Balance:</strong> {wallet.balance}</p>}
            </div>
          </div>
        )}

        {/* Profile Info */}
        {profile && (
          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-purple-900 mb-2">User Profile</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>ID:</strong> {profile.id}</p>
                <p><strong>Currency:</strong> {profile.preferences.currency}</p>
                <p><strong>Payment Method:</strong> {profile.preferences.paymentMethod}</p>
                <p><strong>Web3 Features:</strong> {profile.preferences.web3Features ? 'Enabled' : 'Disabled'}</p>
              </div>
              <div>
                <p><strong>Can Browse:</strong> {profile.permissions.canBrowse ? '✅' : '❌'}</p>
                <p><strong>Can Purchase:</strong> {profile.permissions.canPurchase ? '✅' : '❌'}</p>
                <p><strong>Can Mint NFT:</strong> {profile.permissions.canMintNFT ? '✅' : '❌'}</p>
                <p><strong>Can Access Web3:</strong> {profile.permissions.canAccessWeb3 ? '✅' : '❌'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Authentication Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Email Authentication */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Email Authentication</h3>
            {!user ? (
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleLogin}
                  disabled={!email || loading}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  Login with Magic Link
                </button>
              </div>
            ) : (
              <button
                onClick={logout}
                className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>

          {/* Wallet Connection */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Wallet Connection</h3>
            {!wallet?.isConnected ? (
              <button
                onClick={() => connectWallet()}
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
              >
                Connect Wallet
              </button>
            ) : (
              <button
                onClick={disconnectWallet}
                className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
              >
                Disconnect Wallet
              </button>
            )}
          </div>

          {/* Hybrid Actions */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Hybrid Features</h3>
            <div className="space-y-2">
              {authState === 'email' && wallet?.isConnected && (
                <button
                  onClick={linkWallet}
                  className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 text-sm"
                >
                  Link Wallet
                </button>
              )}
              {authState === 'hybrid' && (
                <button
                  onClick={unlinkWallet}
                  className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 text-sm"
                >
                  Unlink Wallet
                </button>
              )}
              {(authState === 'email' || authState === 'wallet') && (
                <button
                  onClick={upgradeToHybrid}
                  className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 text-sm"
                >
                  Upgrade to Hybrid
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Access Control Demo */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3">Access Control</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <span>{checkAccess('browse') ? '✅' : '❌'}</span>
              <span>Browse Gallery</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>{checkAccess('purchase') ? '✅' : '❌'}</span>
              <span>Purchase Art</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>{checkAccess('mint') ? '✅' : '❌'}</span>
              <span>Mint NFTs</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>{checkAccess('web3') ? '✅' : '❌'}</span>
              <span>Web3 Features</span>
            </div>
          </div>
        </div>

        {/* NFT Features */}
        {checkAccess('mint') && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-3">NFT Features</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <select
                  value={selectedArtwork}
                  onChange={(e) => setSelectedArtwork(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="artwork_123">Digital Sunset</option>
                  <option value="artwork_456">Abstract Flow</option>
                  <option value="artwork_789">Geometric Dreams</option>
                </select>
                <button
                  onClick={handleMintNFT}
                  className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                >
                  Mint NFT Certificate
                </button>
              </div>
              
              {authState === 'hybrid' && (
                <button
                  onClick={handleClaimAssets}
                  className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                >
                  Claim Custodial Assets
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
