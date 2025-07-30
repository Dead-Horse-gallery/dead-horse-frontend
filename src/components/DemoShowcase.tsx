'use client';

import { useState, useCallback } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { useHybridAuth } from '@/contexts/HybridAuthContext';
import { log } from '@/lib/logger';
import { useToast, toast } from '@/components/Toast';
import Image from 'next/image';
import { HeartIcon, ShareIcon, ShoppingCartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { 
  ProtectedPurchase, 
  ProtectedSave, 
  ProtectedContact
} from '@/components/ProtectedAction';
import AuthModal from '@/components/AuthModal';
import ProtectedRoute from '@/components/ProtectedRoute';

/**
 * Consolidated Demo Showcase for Dead Horse Gallery
 * 
 * Combines functionality from:
 * - AuthDemo.tsx (authentication system demonstration)
 * - DeadHorseDemo.tsx (gallery UI and protected actions)
 * - ProtectedRoute.example.tsx (route protection examples)
 * 
 * This reduces bundle size while providing comprehensive demo functionality
 */

interface DemoShowcaseProps {
  /** Whether to show the demo in production builds */
  enableInProduction?: boolean;
  /** Default tab to show */
  defaultTab?: number;
}

type Intent = 'purchase' | 'save' | 'contact' | 'verify' | 'apply' | null;

// Mock artwork data for gallery demo
const mockArtwork = {
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

export default function DemoShowcase({ 
  enableInProduction = false, 
  defaultTab = 0 
}: DemoShowcaseProps) {
  const {
    user,
    wallet,
    authState,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    connectWallet,
    disconnectWallet,
    claimCustodialAssets,
    mintNFTCertificate
  } = useHybridAuth();

  const { addToast } = useToast();

  // State
  const [email, setEmail] = useState('');
  const [selectedArtwork, setSelectedArtwork] = useState('artwork_123');
  const [activeIntent, setActiveIntent] = useState<Intent>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(mockArtwork.isFavorited);

  // Auth handlers
  const handleLogin = useCallback(async () => {
    if (!email) return;
    try {
      await login(email);
      log.info('Demo login successful', { email, component: 'DemoShowcase' });
    } catch (err) {
      log.error('Demo login failed', { error: err, email, component: 'DemoShowcase' });
    }
  }, [email, login]);

  const handleMintNFT = useCallback(async () => {
    try {
      const tokenId = await mintNFTCertificate(selectedArtwork);
      addToast(toast.success(
        'NFT Minted Successfully!', 
        `Token ID: ${tokenId}`,
        { duration: 7000 }
      ));
      log.info('Demo NFT minted', { tokenId, artwork: selectedArtwork, component: 'DemoShowcase' });
    } catch (err) {
      log.error('Demo minting failed', { error: err, artwork: selectedArtwork, component: 'DemoShowcase' });
      addToast(toast.error(
        'Minting Failed',
        (err as Error).message
      ));
    }
  }, [selectedArtwork, mintNFTCertificate, addToast]);

  const handleClaimAssets = useCallback(async () => {
    try {
      await claimCustodialAssets();
      addToast(toast.success(
        'Assets Claimed Successfully!',
        'Your custodial assets have been transferred to your wallet.'
      ));
      log.info('Demo assets claimed', { component: 'DemoShowcase' });
    } catch (err) {
      log.error('Demo asset claiming failed', { error: err, component: 'DemoShowcase' });
      addToast(toast.error(
        'Asset Claiming Failed',
        (err as Error).message
      ));
    }
  }, [claimCustodialAssets, addToast]);

  // Gallery handlers
  const handleToggleFavorite = useCallback(() => {
    setIsFavorited(prev => !prev);
    log.info('Demo favorite toggled', { artworkId: mockArtwork.id, favorited: !isFavorited });
  }, [isFavorited]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: mockArtwork.title,
        text: `Check out "${mockArtwork.title}" by ${mockArtwork.artist.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast(toast.success(
        'Link Copied!',
        'Artwork link has been copied to your clipboard.'
      ));
    }
    log.info('Demo artwork shared', { artworkId: mockArtwork.id });
  }, [addToast]);

  const openAuthModal = useCallback((intent: Intent) => {
    setActiveIntent(intent);
    setIsAuthModalOpen(true);
    log.info('Demo auth modal opened', { intent });
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setActiveIntent(null);
    log.info('Demo auth modal closed');
  }, []);

  // Only show in development unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !enableInProduction) {
    return null;
  }

  // Tab content components
  const AuthDemoContent = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Authentication System Demo</h3>
        
        {/* Current State Display */}
        <div className="mb-6 p-4 bg-gray-800 rounded">
          <h4 className="font-semibold mb-2">Current State:</h4>
          <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>Auth State:</strong> {authState}</p>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          {error && <p className="text-red-400"><strong>Error:</strong> {error.message || String(error)}</p>}
          {user && <p><strong>User:</strong> {user.email}</p>}
          {wallet && <p><strong>Wallet:</strong> {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}</p>}
        </div>

        {/* Login Form */}
        {!isAuthenticated && (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Enter email for Magic Link"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded text-white placeholder-gray-400"
            />
            <button
              onClick={handleLogin}
              disabled={!email || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 p-3 rounded font-semibold"
            >
              {loading ? 'Logging in...' : 'Login with Magic Link'}
            </button>
          </div>
        )}

        {/* Authenticated Actions */}
        {isAuthenticated && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => connectWallet()}
                disabled={!!wallet || loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 p-3 rounded font-semibold"
              >
                {wallet ? 'Wallet Connected' : 'Connect Wallet'}
              </button>
              
              <button
                onClick={() => disconnectWallet()}
                disabled={!wallet || loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 p-3 rounded font-semibold"
              >
                Disconnect Wallet
              </button>
            </div>

            {wallet && (
              <div className="space-y-2">
                <select
                  value={selectedArtwork}
                  onChange={(e) => setSelectedArtwork(e.target.value)}
                  className="w-full p-3 bg-gray-700 rounded text-white"
                >
                  <option value="artwork_123">Urban Fragments #3</option>
                  <option value="artwork_456">Digital Dreams #7</option>
                  <option value="artwork_789">Abstract Reality #12</option>
                </select>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleMintNFT}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 p-3 rounded font-semibold"
                  >
                    Mint NFT Certificate
                  </button>
                  
                  <button
                    onClick={handleClaimAssets}
                    disabled={loading}
                    className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 p-3 rounded font-semibold"
                  >
                    Claim Custodial Assets
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => logout()}
              disabled={loading}
              className="w-full bg-gray-600 hover:bg-gray-700 p-3 rounded font-semibold"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const GalleryDemoContent = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Gallery UI Demo with Protected Actions</h3>
        
        {/* Artwork Card */}
        <div className="bg-black rounded-lg overflow-hidden max-w-2xl">
          <div className="relative">
            <Image
              src={mockArtwork.image}
              alt={mockArtwork.title}
              width={600}
              height={800}
              className="w-full h-64 object-cover"
            />
            
            {/* Action buttons overlay */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <ProtectedSave
                onClick={handleToggleFavorite}
                className="p-2 bg-black/50 rounded-full hover:bg-black/70"
              >
                {isFavorited ? (
                  <HeartIconSolid className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5 text-white" />
                )}
              </ProtectedSave>
              
              <button
                onClick={handleShare}
                className="p-2 bg-black/50 rounded-full hover:bg-black/70"
              >
                <ShareIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{mockArtwork.title}</h2>
                <p className="text-gray-400">by {mockArtwork.artist.name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">${mockArtwork.price.toLocaleString()}</p>
                <p className="text-gray-400">{mockArtwork.currency}</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">{mockArtwork.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-6">
              <div>
                <p><strong>Medium:</strong> {mockArtwork.medium}</p>
                <p><strong>Year:</strong> {mockArtwork.year}</p>
              </div>
              <div>
                <p><strong>Dimensions:</strong> {mockArtwork.dimensions}</p>
                <p><strong>Edition:</strong> {mockArtwork.edition}</p>
              </div>
            </div>

            {/* Protected Action Buttons */}
            <div className="flex space-x-4">
              <ProtectedPurchase
                onClick={() => openAuthModal('purchase')}
                className="flex-1 bg-white text-black py-3 px-6 rounded font-semibold hover:bg-gray-200 flex items-center justify-center space-x-2"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                <span>Purchase</span>
              </ProtectedPurchase>

              <ProtectedContact
                onClick={() => openAuthModal('contact')}
                className="bg-gray-800 text-white py-3 px-6 rounded font-semibold hover:bg-gray-700 flex items-center space-x-2"
              >
                <ChatBubbleLeftIcon className="w-5 h-5" />
                <span>Contact Artist</span>
              </ProtectedContact>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ProtectedRouteDemoContent = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Protected Route Examples</h3>
        
        <div className="space-y-4">
          {/* Example 1: Protected page with modal */}
          <div className="bg-gray-800 p-4 rounded">
            <h4 className="font-semibold mb-2">Modal-based Protection</h4>
            <p className="text-gray-300 mb-3">Shows login modal when accessing protected content</p>
            <ProtectedRoute>
              <div className="p-4 bg-green-900/20 border border-green-600 rounded">
                <p className="text-green-400">🔒 This content is protected! You can see this because you&apos;re authenticated.</p>
              </div>
            </ProtectedRoute>
          </div>

          {/* Example 2: Optional authentication */}
          <div className="bg-gray-800 p-4 rounded">
            <h4 className="font-semibold mb-2">Optional Authentication</h4>
            <p className="text-gray-300 mb-3">Public content that adapts based on auth status</p>
            <ProtectedRoute requireAuth={false}>
              <div className="p-4 bg-blue-900/20 border border-blue-600 rounded">
                <p className="text-blue-400">
                  🌍 This is public content. 
                  {isAuthenticated 
                    ? " Welcome back! You're seeing the authenticated version." 
                    : " Sign in to see personalized content."
                  }
                </p>
              </div>
            </ProtectedRoute>
          </div>

          {/* Example 3: Different protection levels */}
          <div className="bg-gray-800 p-4 rounded">
            <h4 className="font-semibold mb-2">Different Protection Strategies</h4>
            <div className="space-y-2">
              <p className="text-gray-300">Examples of different protection patterns:</p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Modal-based: Shows login modal overlay</li>
                <li>• Redirect-based: Redirects to login page</li>
                <li>• Soft-gated: Shows teaser with upgrade prompt</li>
                <li>• Role-based: Different content for different user types</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dead Horse Gallery - Demo Showcase</h1>
          <p className="text-gray-400">
            Comprehensive demonstration of authentication, protected actions, and route protection.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-yellow-400 text-sm mt-2">
              ⚠️ Development mode - This component is hidden in production unless explicitly enabled.
            </p>
          )}
        </div>

        <TabGroup defaultIndex={defaultTab}>
          <TabList className="flex space-x-1 rounded-xl bg-gray-900 p-1 mb-8">
            <Tab className="w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-white ui-selected:bg-white ui-selected:text-black ui-not-selected:text-gray-400 ui-not-selected:hover:bg-white/[0.12] ui-not-selected:hover:text-white">
              Authentication Demo
            </Tab>
            <Tab className="w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-white ui-selected:bg-white ui-selected:text-black ui-not-selected:text-gray-400 ui-not-selected:hover:bg-white/[0.12] ui-not-selected:hover:text-white">
              Gallery UI Demo
            </Tab>
            <Tab className="w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-white ui-selected:bg-white ui-selected:text-black ui-not-selected:text-gray-400 ui-not-selected:hover:bg-white/[0.12] ui-not-selected:hover:text-white">
              Protected Routes
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <AuthDemoContent />
            </TabPanel>
            <TabPanel>
              <GalleryDemoContent />
            </TabPanel>
            <TabPanel>
              <ProtectedRouteDemoContent />
            </TabPanel>
          </TabPanels>
        </TabGroup>

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          intent={activeIntent || 'save'}
        />
      </div>
    </div>
  );
}
