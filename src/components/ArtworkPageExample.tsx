'use client';

import { useState } from 'react';
import Image from 'next/image';
import { HeartIcon, ShareIcon, ShoppingCartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
// import AuthModal from '@/components/AuthModal';
import AuthModal from './AuthModal';
// Update the path below if HybridAuthContext is in a different location
import { useHybridAuth } from '../contexts/HybridAuthContext';

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

export default function ArtworkPageExample() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authIntent, setAuthIntent] = useState<Intent>(null);
  const [localFavorited, setLocalFavorited] = useState(artwork.isFavorited);
  
  const { user, authState, checkAccess } = useHybridAuth();

  const handleAuthAction = (intent: Intent) => {
    // Check if user needs authentication for this action
    const requiredAccess = intent === 'verify' ? 'wallet' : 'basic';
    
    if (!checkAccess(requiredAccess)) {
      setAuthIntent(intent);
      setIsAuthModalOpen(true);
    } else {
      // User is authenticated, perform the action
      executeAction(intent);
    }
  };

  const executeAction = (intent: Intent) => {
    switch (intent) {
      case 'purchase':
        // Redirect to checkout or open payment modal
        // Proceeding to purchase (logging removed)
        break;
      case 'save':
        // Toggle favorite status
        setLocalFavorited(!localFavorited);
        // Artwork favorited (logging removed)
        break;
      case 'contact':
        // Open contact form or redirect to artist page
        // Opening contact form (logging removed)
        break;
      case 'verify':
        // Open verification flow
        // Starting verification (logging removed)
        break;
    }
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthIntent(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-lg font-semibold">Dead Horse Gallery</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Artwork Image */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={artwork.image}
                alt={artwork.title}
                width={600}
                height={800}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Artwork Details */}
          <div className="space-y-8">
            {/* Title and Artist */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {artwork.title}
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                by <span className="font-medium">{artwork.artist.name}</span>
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ${artwork.price.toLocaleString()} {artwork.currency}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Primary Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleAuthAction('purchase')}
                  disabled={!artwork.isAvailable}
                  className="flex items-center justify-center space-x-2 bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span>{artwork.isAvailable ? 'Purchase' : 'Sold Out'}</span>
                </button>

                <button
                  onClick={() => handleAuthAction('save')}
                  className={`flex items-center justify-center space-x-2 py-3 px-6 rounded-lg border transition-colors ${
                    localFavorited
                      ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {localFavorited ? (
                    <HeartIconSolid className="h-5 w-5" />
                  ) : (
                    <HeartIcon className="h-5 w-5" />
                  )}
                  <span>{localFavorited ? 'Saved' : 'Save'}</span>
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleAuthAction('contact')}
                  className="flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChatBubbleLeftIcon className="h-4 w-4" />
                  <span>Contact Artist</span>
                </button>

                <button
                  onClick={() => handleAuthAction('verify')}
                  className="flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ShareIcon className="h-4 w-4" />
                  <span>Verify Ownership</span>
                </button>
              </div>
            </div>

            {/* User Status Display */}
            {user && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Signed in as {user.email} ({authState} access)
                </p>
              </div>
            )}

            {/* Artwork Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {artwork.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Medium</h4>
                  <p className="text-gray-600">{artwork.medium}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Dimensions</h4>
                  <p className="text-gray-600">{artwork.dimensions}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Year</h4>
                  <p className="text-gray-600">{artwork.year}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Edition</h4>
                  <p className="text-gray-600">{artwork.edition}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-16 bg-gray-50 p-8 rounded-lg">
          <h2 className="text-xl font-bold mb-4">AuthModal Integration Example</h2>
          <p className="text-gray-600 mb-4">
            This page demonstrates how the AuthModal integrates with existing artwork pages:
          </p>
          <ul className="space-y-2 text-gray-600">
            <li>• <strong>Purchase:</strong> Shows purchase-specific benefits and security features</li>
            <li>• <strong>Save:</strong> Explains collection building and notification features</li>
            <li>• <strong>Contact:</strong> Highlights community access and artist connection</li>
            <li>• <strong>Verify:</strong> Focuses on wallet connection and ownership verification</li>
          </ul>
          <p className="text-sm text-gray-500 mt-4">
            Try the actions above to see how the modal adapts its messaging based on user intent.
          </p>
        </div>
      </div>

      {authIntent && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          intent={authIntent}
        />
      )}
    </div>
  );
}
