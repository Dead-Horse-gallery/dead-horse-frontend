// Create login modal component for Dead Horse Gallery:
// - Two-tab interface: "Email" and "Wallet"
// - Email tab: Magic.link email authentication
// - Wallet tab: Connect wallet options
// - Option to link wallet to existing email account
// - Clean black/white design
// - Responsive modal with backdrop
// - "Continue as Guest" option for public content

"use client";

import React, { useState, useEffect } from 'react';
import { useHybridAuth } from '@/contexts/HybridAuthContext';
import { useRouter } from 'next/navigation';

// SVG Icon Components
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const WalletIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const LoadingIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const LinkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueAsGuest?: () => void;
  returnUrl?: string;
  allowGuestAccess?: boolean;
  title?: string;
  subtitle?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onContinueAsGuest,
  returnUrl,
  allowGuestAccess = true,
  title = "Welcome to Dead Horse",
  subtitle = "Sign in to access the full gallery experience"
}) => {
  const [activeTab, setActiveTab] = useState<'email' | 'wallet'>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLinkOption, setShowLinkOption] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  
  const { user, login, connectWallet, linkWallet } = useHybridAuth();
  const router = useRouter();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setEmail('');
    setError('');
    setSuccess('');
    setIsLoading(false);
    setShowLinkOption(false);
    setIsLinking(false);
    setActiveTab('email');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await login(email);
      setSuccess('Magic link sent! Check your email to complete login.');
      
      // Close modal after successful login initiation
      setTimeout(() => {
        handleClose();
        if (returnUrl) {
          router.push(returnUrl);
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await connectWallet();
      
      // Check if user has an email account and offer to link
      if (user && user.email) {
        setShowLinkOption(true);
        setSuccess('Wallet connected! You can link it to your existing account.');
      } else {
        setSuccess('Wallet connected successfully!');
        setTimeout(() => {
          handleClose();
          if (returnUrl) {
            router.push(returnUrl);
          }
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkWallet = async () => {
    setIsLinking(true);
    setError('');

    try {
      await linkWallet();
      setSuccess('Wallet linked to your account successfully!');
      
      setTimeout(() => {
        handleClose();
        if (returnUrl) {
          router.push(returnUrl);
        }
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link wallet');
    } finally {
      setIsLinking(false);
    }
  };

  const handleContinueAsGuest = () => {
    if (onContinueAsGuest) {
      onContinueAsGuest();
    }
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full"
            disabled={isLoading || isLinking}
          >
            <XIcon className="w-5 h-5" />
          </button>
          
          <div className="pr-12">
            <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
            <p className="text-gray-400 text-sm">{subtitle}</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Tab Switcher */}
          <div className="flex bg-gray-900 rounded-xl p-1 mb-6">
            <button
              onClick={() => !isLoading && !isLinking && setActiveTab('email')}
              disabled={isLoading || isLinking}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'email'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-400 hover:text-white disabled:opacity-50'
              }`}
            >
              <MailIcon className="w-4 h-4" />
              <span>Email</span>
            </button>
            <button
              onClick={() => !isLoading && !isLinking && setActiveTab('wallet')}
              disabled={isLoading || isLinking}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'wallet'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-400 hover:text-white disabled:opacity-50'
              }`}
            >
              <WalletIcon className="w-4 h-4" />
              <span>Wallet</span>
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
              <p className="text-red-400 text-sm flex items-start space-x-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
              <p className="text-green-400 text-sm flex items-start space-x-2">
                <CheckIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{success}</span>
              </p>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    placeholder="Enter your email"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all disabled:opacity-50"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <LoadingIcon className="w-5 h-5 animate-spin" />
                    <span>Sending Magic Link...</span>
                  </>
                ) : (
                  <span>Send Magic Link</span>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center leading-relaxed">
                We&apos;ll send you a secure magic link for password-free authentication.
              </p>
            </form>
          )}

          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <div className="space-y-4">
              {!showLinkOption ? (
                <>
                  <div className="text-center">
                    <div className="bg-gray-900 rounded-xl p-6 mb-4 border border-gray-800">
                      <WalletIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-white mb-2">Connect Your Wallet</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Connect your crypto wallet to access Web3 features and make secure transactions.
                      </p>
                    </div>

                    <button
                      onClick={handleWalletConnect}
                      disabled={isLoading}
                      className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-sm"
                    >
                      {isLoading ? (
                        <>
                          <LoadingIcon className="w-5 h-5 animate-spin" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <WalletIcon className="w-5 h-5" />
                          <span>Connect Wallet</span>
                        </>
                      )}
                    </button>

                    <p className="text-xs text-gray-500 text-center mt-3 leading-relaxed">
                      Supports MetaMask, WalletConnect, and other Web3 wallets.
                    </p>
                  </div>
                </>
              ) : (
                /* Link Wallet Option */
                <div className="text-center space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                    <LinkIcon className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">Link Wallet to Account</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                      Connect this wallet to your existing email account for enhanced security and features.
                    </p>
                    
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-300 mb-4">
                      <UserIcon className="w-4 h-4" />
                      <span>{user?.email}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowLinkOption(false)}
                      disabled={isLinking}
                      className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-all disabled:opacity-50"
                    >
                      Skip for Now
                    </button>
                    <button
                      onClick={handleLinkWallet}
                      disabled={isLinking}
                      className="flex-1 bg-white text-black py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {isLinking ? (
                        <>
                          <LoadingIcon className="w-4 h-4 animate-spin" />
                          <span>Linking...</span>
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-4 h-4" />
                          <span>Link Wallet</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Continue as Guest Option */}
          {allowGuestAccess && (
            <div className="mt-6 pt-6 border-t border-gray-800">
              <button
                onClick={handleContinueAsGuest}
                disabled={isLoading || isLinking}
                className="w-full text-gray-400 hover:text-white py-2 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <UserIcon className="w-4 h-4" />
                <span>Continue as Guest</span>
              </button>
              <p className="text-xs text-gray-600 text-center mt-2">
                Limited access to public content only
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-950 rounded-b-2xl border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-white hover:underline transition-colors">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="/privacy" className="text-white hover:underline transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
