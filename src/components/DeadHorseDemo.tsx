'use client';

import { useState } from 'react';
import Image from 'next/image';
import { HeartIcon, ShareIcon, ShoppingCartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { log } from '@/lib/logger';
import ProtectedAction, { 
  ProtectedPurchase, 
  ProtectedSave, 
  ProtectedContact, 
  ProtectedVerify 
} from '@/components/ProtectedAction';
import AuthModal from '@/components/AuthModal';
import { useHybridAuth } from '@/contexts/HybridAuthContext';

type Intent = 'purchase' | 'save' | 'contact' | 'verify' | 'apply' | null;

// Mock artwork data
const artwork = {
  id: '1',
  title: 'Urban Fragments #3',
  artist: {
    name: 'Elena Rodriguez',
    slug: 'elena-rodriguez',
    avatar: '/api/placeholder/48/48'
  },
  price: 2500,
  currency: 'USD',
  image: '/api/placeholder/600/800',
  description: 'A powerful exploration of urban decay and renewal, this mixed-media piece combines photography, digital manipulation, and traditional painting techniques to create a haunting yet beautiful commentary on modern city life.',
  medium: 'Mixed Media on Canvas',
  dimensions: '36" x 48"',
  year: 2024,
  edition: 'Unique',
  isFavorited: false,
  isAvailable: true
};

/**
 * Comprehensive Demo Component for Dead Horse Gallery Authentication System
 * 
 * This component demonstrates:
 * 1. ProtectedAction components and usage patterns
 * 2. AuthModal with different intents
 * 3. HybridAuth context integration
 * 4. Real-world UI patterns from the gallery
 */
export default function DeadHorseDemo() {
  // State management
  const [localFavorited, setLocalFavorited] = useState(artwork.isFavorited);
  const [cartCount, setCartCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIntent, setCurrentIntent] = useState<Intent>(null);
  const [email, setEmail] = useState('');
  const [selectedArtwork, setSelectedArtwork] = useState('artwork_123');
  const [activeTab, setActiveTab] = useState<'protected-actions' | 'auth-modal' | 'auth-demo'>('protected-actions');

  // Auth context
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

  // Action handlers for ProtectedAction demo
  const handlePurchase = () => {
    log.userAction('Proceeding to purchase');
    log.info('Demo action', { message: 'Purchase initiated! (Demo)' });
  };

  const handleSave = () => {
    setLocalFavorited(!localFavorited);
    log.userAction('Artwork favorited', { favorited: !localFavorited });
    log.info("Demo action", { message: `Artwork ${!localFavorited ? 'saved to' : 'removed from'} favorites! (Demo)` });
  };

  const handleContact = () => {
    log.userAction('Opening contact form');
    log.info('Demo action', { message: 'Contact form opened! (Demo)' });
  };

  const handleVerify = () => {
    log.userAction('Starting verification');
    log.info('Demo action', { message: 'Verification process started! (Demo)' });
  };

  // Auth modal handlers
  const openModal = (intent: Intent) => {
    setCurrentIntent(intent);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentIntent(null);
  };

  // Auth demo handlers
  const handleLogin = async () => {
    if (!email) return;
    try {
      await login(email);
    } catch (err) {
      log.error('Login failed', { error: err });
    }
  };

  const handleMintNFT = async () => {
    try {
      const tokenId = await mintNFTCertificate(selectedArtwork);
      log.info("Demo action", { message: `NFT minted successfully! Token ID: ${tokenId}` });
    } catch (err) {
      log.error('Minting failed', { error: err });
      alert('Minting failed: ' + (err as Error).message);
    }
  };

  const handleClaimAssets = async () => {
    try {
      await claimCustodialAssets();
      log.info('Demo action', { message: 'Assets claimed successfully!' });
    } catch (err) {
      log.error('Asset claiming failed', { error: err });
      alert('Asset claiming failed: ' + (err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Dead Horse Gallery</h1>
          <p className="text-xl text-gray-300">Complete Authentication System Demo</p>
        </div>
      </div>

      {/* Auth Status */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  ✓ Authenticated as {user.email}
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {authState}
                </div>
                {wallet && (
                  <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    Wallet: {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                  </div>
                )}
              </div>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg inline-block">
                Not authenticated - actions will trigger authentication flow
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
          {[
            { id: 'protected-actions', label: 'ProtectedAction Components' },
            { id: 'auth-modal', label: 'AuthModal Demo' },
            { id: 'auth-demo', label: 'HybridAuth Demo' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'protected-actions' && (
          <div className="space-y-12">
            {/* Artwork Card Demo */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div className="aspect-[4/5] bg-gray-100 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="w-24 h-24 mx-auto mb-4 bg-gray-300 rounded"></div>
                      <p>{artwork.title}</p>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{artwork.title}</h2>
                    <p className="text-lg text-gray-600 mb-1">by {artwork.artist.name}</p>
                    <p className="text-2xl font-bold text-gray-900">${artwork.price.toLocaleString()}</p>
                  </div>

                  <p className="text-gray-600 mb-8">{artwork.description}</p>

                  {/* Protected Action Buttons */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <ProtectedPurchase onClick={handlePurchase}>
                        <button className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2">
                          <ShoppingCartIcon className="w-5 h-5" />
                          <span>Purchase</span>
                        </button>
                      </ProtectedPurchase>

                      <ProtectedSave onClick={handleSave}>
                        <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                          {localFavorited ? (
                            <HeartIconSolid className="w-5 h-5 text-red-500" />
                          ) : (
                            <HeartIcon className="w-5 h-5" />
                          )}
                          <span>{localFavorited ? 'Saved' : 'Save'}</span>
                        </button>
                      </ProtectedSave>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <ProtectedContact onClick={handleContact}>
                        <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                          <ChatBubbleLeftIcon className="w-5 h-5" />
                          <span>Contact Artist</span>
                        </button>
                      </ProtectedContact>

                      <ProtectedVerify onClick={handleVerify}>
                        <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                          <span>🔒</span>
                          <span>Verify Authenticity</span>
                        </button>
                      </ProtectedVerify>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Convenience Components Demo */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Convenience Components</h3>
              <p className="text-gray-600 mb-6">
                Pre-configured components for common actions with appropriate access levels.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ProtectedPurchase onClick={() => setCartCount(c => c + 1)}>
                  <button className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors">
                    Add to Cart ({cartCount})
                  </button>
                </ProtectedPurchase>

                <ProtectedSave onClick={() => setFavoriteCount(c => c + 1)}>
                  <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                    Favorite ({favoriteCount})
                  </button>
                </ProtectedSave>

                <ProtectedContact onClick={() => alert('Contact opened!')}>
                  <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                    Contact
                  </button>
                </ProtectedContact>

                <ProtectedVerify onClick={() => alert('Verification started!')}>
                  <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                    Verify
                  </button>
                </ProtectedVerify>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'auth-modal' && (
          <div className="space-y-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">AuthModal with Different Intents</h3>
              <p className="text-gray-600 mb-6">
                Test the authentication modal with different user intents to see contextual messaging.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { intent: 'purchase', label: 'Purchase Intent', color: 'bg-green-600 hover:bg-green-700' },
                  { intent: 'save', label: 'Save Intent', color: 'bg-blue-600 hover:bg-blue-700' },
                  { intent: 'contact', label: 'Contact Intent', color: 'bg-purple-600 hover:bg-purple-700' },
                  { intent: 'verify', label: 'Verify Intent', color: 'bg-orange-600 hover:bg-orange-700' },
                  { intent: 'apply', label: 'Apply Intent', color: 'bg-red-600 hover:bg-red-700' }
                ].map(({ intent, label, color }) => (
                  <button
                    key={intent}
                    onClick={() => openModal(intent as Intent)}
                    className={`text-white py-3 px-4 rounded-lg transition-colors ${color}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'auth-demo' && (
          <div className="space-y-8">
            {/* Login Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Email Authentication</h3>
              <div className="flex space-x-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                />
                <button
                  onClick={handleLogin}
                  disabled={!email || loading}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
              {error && (
                <p className="text-red-600 mt-2">{error.message}</p>
              )}
            </div>

            {/* Wallet Section */}
            {isAuthenticated && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Wallet Connection</h3>
                <div className="space-y-4">
                  {!wallet ? (
                    <button
                      onClick={connectWallet}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Connect Wallet
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Connected: {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                      </p>
                      <div className="space-x-2">
                        <button
                          onClick={disconnectWallet}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Disconnect
                        </button>
                        {authState !== 'hybrid' && (
                          <button
                            onClick={upgradeToHybrid}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Upgrade to Hybrid
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* NFT & Assets Section */}
            {authState === 'hybrid' && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">NFT & Asset Management</h3>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={selectedArtwork}
                      onChange={(e) => setSelectedArtwork(e.target.value)}
                      placeholder="Artwork ID"
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                    />
                    <button
                      onClick={handleMintNFT}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mint NFT Certificate
                    </button>
                  </div>
                  <button
                    onClick={handleClaimAssets}
                    className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Claim Custodial Assets
                  </button>
                </div>
              </div>
            )}

            {/* Access Level Testing */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Access Level Testing</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['anonymous', 'email', 'wallet', 'hybrid'].map((level) => (
                  <div key={level} className="text-center">
                    <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                      checkAccess(level as any) ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <p className="text-sm">{level}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={closeModal}
        intent={currentIntent}
        onSuccess={() => {
          closeModal();
          log.info("Demo action", { message: `Authentication successful for ${currentIntent} intent!` });
        }}
      />
    </div>
  );
}
