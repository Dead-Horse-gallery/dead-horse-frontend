'use client';

import { useState } from 'react';
// Update the import path below if your AuthModal component is located elsewhere
import AuthModal from '../../components/AuthModal';

type Intent = 'purchase' | 'save' | 'contact' | 'verify' | 'apply' | null;

export default function AuthModalDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIntent, setCurrentIntent] = useState<Intent>(null);

  const openModal = (intent: Intent) => {
    setCurrentIntent(intent);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentIntent(null);
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Dead Horse Gallery - AuthModal Demo
          </h1>
          <p className="text-gray-600">
            Test the authentication modal with different user intents
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Purchase Intent */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Purchase Artwork</h3>
            <p className="text-gray-600 mb-4">
              Trigger authentication for purchasing an artwork
            </p>
            <button
              onClick={() => openModal('purchase')}
              className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Buy Now
            </button>
          </div>

          {/* Save Intent */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Save to Favorites</h3>
            <p className="text-gray-600 mb-4">
              Trigger authentication for saving artwork to favorites
            </p>
            <button
              onClick={() => openModal('save')}
              className="w-full bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ♥ Save
            </button>
          </div>

          {/* Contact Intent */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Contact Artist</h3>
            <p className="text-gray-600 mb-4">
              Trigger authentication for contacting an artist
            </p>
            <button
              onClick={() => openModal('contact')}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
            >
              Contact
            </button>
          </div>

          {/* Verify Intent */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Verify Ownership</h3>
            <p className="text-gray-600 mb-4">
              Trigger authentication for wallet verification
            </p>
            <button
              onClick={() => openModal('verify')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors"
            >
              Verify Wallet
            </button>
          </div>

          {/* Apply Intent */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Artist Application</h3>
            <p className="text-gray-600 mb-4">
              Trigger authentication for artist application
            </p>
            <button
              onClick={() => openModal('apply')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-500 transition-colors"
            >
              Apply Now
            </button>
          </div>

          {/* Modal Status */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Modal Status</h3>
            <p className="text-gray-600 mb-4">
              Current state: {isModalOpen ? `Open (${currentIntent})` : 'Closed'}
            </p>
            <button
              onClick={closeModal}
              disabled={!isModalOpen}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Close Modal
            </button>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-12 bg-white border border-gray-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">AuthModal Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Core Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Context-specific messaging based on user intent</li>
                <li>• Two-step authentication process</li>
                <li>• Magic.link email authentication</li>
                <li>• Optional Web3 wallet connection</li>
                <li>• Clean black/white gallery aesthetic</li>
                <li>• Dismissible with proper state management</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">User Experience</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• &quot;Continue as Guest&quot; option with limitations</li>
                <li>• Success state with welcome message</li>
                <li>• Benefits preview for each intent</li>
                <li>• Error handling and loading states</li>
                <li>• Responsive design for all devices</li>
                <li>• Smooth transitions between steps</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {currentIntent && (
        <AuthModal
          isOpen={isModalOpen}
          onClose={closeModal}
          intent={currentIntent}
        />
      )}
    </div>
  );
}
