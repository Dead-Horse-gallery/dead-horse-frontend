// Create a ProtectedRoute component for Dead Horse Gallery
// - Wraps pages that require authentication
// - Shows login modal for unauthenticated users
// - Allows both email and wallet authentication
// - Uses Magic.link for email auth
// - Redirects to login with return URL
// - Clean minimal design matching gallery aesthetic

"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import { useHybridAuth } from '@/contexts/HybridAuthContext';
import { useRouter, usePathname } from 'next/navigation';

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

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  showModal?: boolean;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnUrl?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, returnUrl }) => {
  const [activeTab, setActiveTab] = useState<'email' | 'wallet'>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, connectWallet } = useHybridAuth();
  const router = useRouter();

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
      
      // Close modal after successful login
      setTimeout(() => {
        onClose();
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

  const handleWalletLogin = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await connectWallet();
      setSuccess('Wallet connected successfully!');
      
      // Close modal after successful login
      setTimeout(() => {
        onClose();
        if (returnUrl) {
          router.push(returnUrl);
        }
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setError('');
    setSuccess('');
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-gray-800 rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-gray-400 text-sm">Sign in to access Dead Horse Gallery</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            disabled={isLoading}
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tab Switcher */}
          <div className="flex bg-gray-900 rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab('email')}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === 'email'
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white disabled:opacity-50'
              }`}
            >
              <MailIcon className="w-4 h-4" />
              <span>Email</span>
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === 'wallet'
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white disabled:opacity-50'
              }`}
            >
              <WalletIcon className="w-4 h-4" />
              <span>Wallet</span>
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  placeholder="Enter your email"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors disabled:opacity-50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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

              <p className="text-xs text-gray-500 text-center">
                We&apos;ll send you a magic link for secure, password-free sign in.
              </p>
            </form>
          )}

          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="bg-gray-900 rounded-lg p-6 mb-4">
                  <WalletIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Connect Your Wallet</h3>
                  <p className="text-gray-400 text-sm">
                    Use your crypto wallet to sign in securely. We support MetaMask and other Web3 wallets.
                  </p>
                </div>

                <button
                  onClick={handleWalletLogin}
                  disabled={isLoading}
                  className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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

                <p className="text-xs text-gray-500 text-center mt-3">
                  Make sure your wallet is unlocked and ready to connect.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 bg-gray-950">
          <p className="text-xs text-gray-500 text-center">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-white hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-white hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo,
  showModal = true 
}) => {
  const { user, loading } = useHybridAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      if (showModal) {
        setShowLoginModal(true);
      } else if (redirectTo) {
        const returnUrl = encodeURIComponent(pathname || '');
        router.push(`${redirectTo}?returnUrl=${returnUrl}`);
      }
    }
  }, [user, loading, requireAuth, showModal, redirectTo, router, pathname]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <LoadingIcon className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    if (showModal) {
      return (
        <>
          {/* Blurred background content */}
          <div className="min-h-screen bg-black blur-sm pointer-events-none">
            {children}
          </div>
          
          {/* Login Modal */}
          <LoginModal
            isOpen={showLoginModal}
            onClose={() => {
              setShowLoginModal(false);
              // Optionally redirect to home or a public page
              router.push('/');
            }}
            returnUrl={pathname || undefined}
          />
        </>
      );
    }
    
    // If not showing modal and no redirect specified, show inline message
    if (!redirectTo) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
            <p className="text-gray-400 mb-6">
              You need to be signed in to access this page.
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Sign In
            </button>
            
            <LoginModal
              isOpen={showLoginModal}
              onClose={() => setShowLoginModal(false)}
              returnUrl={pathname || undefined}
            />
          </div>
        </div>
      );
    }

    return null;
  }

  // User is authenticated or auth is not required
  return <>{children}</>;
};

export default ProtectedRoute;
