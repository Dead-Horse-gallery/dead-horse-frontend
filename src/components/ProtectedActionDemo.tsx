'use client';

import { useState } from 'react';
import ProtectedAction, { 
  ProtectedPurchase, 
  ProtectedSave, 
  ProtectedContact, 
  ProtectedVerify 
} from './ProtectedAction';
import { useHybridAuth } from '../contexts/HybridAuthContext';

export default function ProtectedActionDemo() {
  const [cartCount, setCartCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const { user, authState } = useHybridAuth();

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ProtectedAction Component Demo
          </h1>
          <p className="text-gray-600">
            Seamless authentication wrapper for any action or button
          </p>
          
          {user ? (
            <div className="mt-4 inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg">
              Signed in as {user.email} ({authState})
            </div>
          ) : (
            <div className="mt-4 inline-block bg-amber-100 text-amber-800 px-4 py-2 rounded-lg">
              Not signed in - actions will show auth modal
            </div>
          )}
        </div>

        {/* Basic Usage Examples */}
        <div className="space-y-8">
          {/* Convenience Components */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Convenience Components</h2>
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
                <button className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors">
                  ♥ Favorites ({favoriteCount})
                </button>
              </ProtectedSave>

              <ProtectedContact onClick={() => alert('Contact form opened!')}>
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Contact Artist
                </button>
              </ProtectedContact>

              <ProtectedVerify onClick={() => alert('Verification started!')}>
                <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Verify Wallet
                </button>
              </ProtectedVerify>
            </div>
          </div>

          {/* Custom Access Levels */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Custom Access Levels</h2>
            <p className="text-gray-600 mb-6">
              Specify different authentication requirements for different features.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ProtectedAction 
                intent="purchase" 
                onClick={() => alert('Basic access feature!')}
              >
                <button className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                  Basic Access
                  <div className="text-xs opacity-75">Requires: Email</div>
                </button>
              </ProtectedAction>

              <ProtectedAction 
                intent="verify" 
                onClick={() => alert('Wallet access feature!')}
              >
                <button className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors">
                  Wallet Access
                  <div className="text-xs opacity-75">Requires: Wallet</div>
                </button>
              </ProtectedAction>

              <ProtectedAction 
                intent="purchase"
                onClick={() => alert('Hybrid access feature!')}
              >
                <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                  Hybrid Access
                  <div className="text-xs opacity-75">Requires: Email + Wallet</div>
                </button>
              </ProtectedAction>
            </div>
          </div>

          {/* Element Wrapping Examples */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Flexible Element Wrapping</h2>
            <p className="text-gray-600 mb-6">
              ProtectedAction can wrap any clickable element, not just buttons.
            </p>
            
            <div className="space-y-4">
              {/* Card wrapper */}
              <ProtectedAction intent="save" onClick={() => alert('Card clicked!')}>
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <h3 className="font-semibold">Clickable Card</h3>
                  <p className="text-gray-600 text-sm">This entire card is wrapped and protected</p>
                </div>
              </ProtectedAction>

              {/* Link wrapper */}
              <ProtectedAction intent="contact" onClick={() => alert('Link clicked!')}>
                <a href="#" className="inline-block text-blue-600 hover:text-blue-800 underline">
                  Protected Link Action
                </a>
              </ProtectedAction>

              {/* Image wrapper */}
              <ProtectedAction intent="purchase" onClick={() => alert('Image clicked!')}>
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
                  <span className="text-gray-500">Click me!</span>
                </div>
              </ProtectedAction>
            </div>
          </div>

          {/* Advanced Usage */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Advanced Usage</h2>
            <p className="text-gray-600 mb-6">
              Complex interactions with disabled states and custom styling.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Disabled State</h3>
                <ProtectedAction 
                  intent="purchase" 
                  disabled={true}
                  onClick={() => alert('This should not fire')}
                >
                  <button className="w-full bg-gray-400 text-white py-3 px-4 rounded-lg cursor-not-allowed">
                    Disabled Button
                  </button>
                </ProtectedAction>
              </div>

              <div>
                <h3 className="font-medium mb-3">Custom Styling</h3>
                <ProtectedAction 
                  intent="save"
                  className="transform hover:scale-105 transition-transform"
                  onClick={() => alert('Styled action executed!')}
                >
                  <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg">
                    Fancy Button
                  </button>
                </ProtectedAction>
              </div>
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">How It Works</h2>
            <div className="space-y-3 text-blue-800">
              <p>
                <strong>For Guest Users:</strong> Clicking any protected action shows the authentication modal 
                with messaging tailored to the specific intent.
              </p>
              <p>
                <strong>For Authenticated Users:</strong> Actions execute immediately without any modal interruption.
              </p>
              <p>
                <strong>Smooth UX:</strong> No jarring redirects or blocking dialogs - just seamless authentication 
                when needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
