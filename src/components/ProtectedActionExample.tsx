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
} from './ProtectedAction';
import { useHybridAuth } from '@/contexts/HybridAuthContext';

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

export default function ProtectedActionExample() {
  const [localFavorited, setLocalFavorited] = useState(artwork.isFavorited);
  const { user, authState } = useHybridAuth();

  const handlePurchase = () => {
    log.userAction('Proceeding to purchase');
    // Redirect to checkout or open payment modal
    alert('Purchase initiated! (Demo)');
  };

  const handleSave = () => {
    setLocalFavorited(!localFavorited);
    log.userAction('Artwork favorited', { favorited: !localFavorited });
    alert(`Artwork ${!localFavorited ? 'saved to' : 'removed from'} favorites! (Demo)`);
  };

  const handleContact = () => {
    log.userAction('Opening contact form');
    alert('Contact form opened! (Demo)');
  };

  const handleVerify = () => {
    log.userAction('Starting verification');
    alert('Verification process started! (Demo)');
  };

  const handleShare = () => {
    // This doesn't require auth, so no protection needed
    navigator.share({
      title: artwork.title,
      text: `Check out this artwork by ${artwork.artist.name}`,
      url: window.location.href,
    }).catch(() => {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-lg font-semibold">Dead Horse Gallery - ProtectedAction Demo</h1>
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

            {/* Action Buttons with Protection */}
            <div className="space-y-4">
              {/* Primary Actions - Using convenience components */}
              <div className="grid grid-cols-2 gap-4">
                <ProtectedPurchase onClick={handlePurchase} disabled={!artwork.isAvailable}>
                  <button className="flex items-center justify-center space-x-2 bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <ShoppingCartIcon className="h-5 w-5" />
                    <span>{artwork.isAvailable ? 'Purchase' : 'Sold Out'}</span>
                  </button>
                </ProtectedPurchase>

                <ProtectedSave onClick={handleSave}>
                  <button className={`flex items-center justify-center space-x-2 py-3 px-6 rounded-lg border transition-colors ${
                    localFavorited
                      ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                    {localFavorited ? (
                      <HeartIconSolid className="h-5 w-5" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                    <span>{localFavorited ? 'Saved' : 'Save'}</span>
                  </button>
                </ProtectedSave>
              </div>

              {/* Secondary Actions - Using base component with different access levels */}
              <div className="grid grid-cols-3 gap-4">
                <ProtectedContact onClick={handleContact}>
                  <button className="flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <ChatBubbleLeftIcon className="h-4 w-4" />
                    <span>Contact</span>
                  </button>
                </ProtectedContact>

                <ProtectedVerify onClick={handleVerify}>
                  <button className="flex items-center justify-center space-x-2 border border-blue-300 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors">
                    <ShareIcon className="h-4 w-4" />
                    <span>Verify</span>
                  </button>
                </ProtectedVerify>

                {/* This action doesn't need protection */}
                <button 
                  onClick={handleShare}
                  className="flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ShareIcon className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>

              {/* Custom Protection Example */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Advanced Protection Examples:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <ProtectedAction 
                    intent="purchase"
                    onClick={() => alert('Premium feature accessed! (Demo)')}
                  >
                    <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors">
                      Premium Feature
                    </button>
                  </ProtectedAction>

                  <ProtectedAction 
                    intent="verify"
                    onClick={() => alert('Wallet-only feature accessed! (Demo)')}
                  >
                    <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
                      Wallet Feature
                    </button>
                  </ProtectedAction>
                </div>
              </div>
            </div>

            {/* User Status Display */}
            {user ? (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Signed in as {user.email} ({authState} access)
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Actions will execute directly without showing authentication modal
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <p className="text-sm text-amber-800">
                  ⚠ Not authenticated (guest mode)
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Protected actions will show authentication modal instead of executing
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

        {/* ProtectedAction Feature Showcase */}
        <div className="mt-16 bg-gray-50 p-8 rounded-lg">
          <h2 className="text-xl font-bold mb-4">ProtectedAction Component Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Core Benefits</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• <strong>Seamless UX:</strong> No blocking dialogs, smooth authentication flow</li>
                <li>• <strong>Wrapper Design:</strong> Wraps any button or action element</li>
                <li>• <strong>Context Aware:</strong> Shows appropriate auth modal based on intent</li>
                <li>• <strong>Access Levels:</strong> Basic, wallet, or hybrid authentication</li>
                <li>• <strong>Pass-through:</strong> Authenticated users execute actions normally</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Usage Patterns</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• <strong>Convenience Components:</strong> ProtectedPurchase, ProtectedSave, etc.</li>
                <li>• <strong>Custom Requirements:</strong> Specify required access level</li>
                <li>• <strong>Flexible Wrapping:</strong> Works with any React element</li>
                <li>• <strong>Event Handling:</strong> Custom onClick handlers for authenticated actions</li>
                <li>• <strong>State Management:</strong> Maintains disabled states and styling</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded border">
            <h4 className="font-medium mb-2">Try the demo:</h4>
            <p className="text-sm text-gray-600">
              If you&apos;re not signed in, click any protected action above to see the authentication modal. 
              If you&apos;re signed in, the actions will execute directly with demo alerts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
