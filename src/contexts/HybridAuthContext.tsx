'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createMagic } from '../lib/magic';
import { useRouter } from 'next/navigation';
import { log } from '@/lib/logger';
import { 
  AuthContextType, 
  MagicUser, 
  WalletConnection, 
  UserProfile, 
  UserAuthState,
  AuthError,
  ACCESS_LEVELS,
  ConversionMetrics
} from '../types/auth';
import { 
  checkLoginAttempts, 
  generateCSRFToken, 
  storeCSRFToken, 
  validateCSRFToken, 
  clearLoginAttempts
} from '../lib/auth-utils';

export const HybridAuthContext = createContext<AuthContextType | undefined>(undefined);

export const useHybridAuth = (): AuthContextType => {
  const context = useContext(HybridAuthContext);
  if (context === undefined) {
    throw new Error('useHybridAuth must be used within a HybridAuthProvider');
  }
  return context;
};

export const HybridAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize Magic
  const [magic] = useState(() => createMagic());
  
  // Core state
  const [user, setUser] = useState<MagicUser | null>(null);
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authState, setAuthState] = useState<UserAuthState>('anonymous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [authIntent, setAuthIntent] = useState<string | null>(null);
  
  // Soft gating state
  const [conversionMetrics, setConversionMetrics] = useState<ConversionMetrics>({
    totalAttempts: 0,
    successfulConversions: 0,
    conversionRate: 0,
    intentBreakdown: {},
  });
  
  // Refs for cleanup
  const refreshTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const mounted = useRef<boolean>(true);
  
  const router = useRouter();

  // Derived state
  const isAuthenticated = authState !== 'anonymous';

  // Utility function to determine auth state
  const determineAuthState = useCallback((magicUser: MagicUser | null, walletConn: WalletConnection | null): UserAuthState => {
    if (magicUser && walletConn?.isConnected) return 'hybrid';
    if (magicUser) return 'email';
    if (walletConn?.isConnected) return 'wallet';
    return 'anonymous';
  }, []);

  // Create user profile based on auth state
  const createUserProfile = useCallback((state: UserAuthState, magicUser?: MagicUser, walletConn?: WalletConnection): UserProfile => {
    const permissions = ACCESS_LEVELS[state.toUpperCase() as keyof typeof ACCESS_LEVELS];
    
    return {
      id: magicUser?.issuer || walletConn?.address || 'anonymous',
      email: magicUser?.email,
      walletAddress: walletConn?.address,
      authState: state,
      preferences: {
        currency: 'USD',
        paymentMethod: state === 'wallet' ? 'crypto' : state === 'hybrid' ? 'both' : 'card',
        web3Features: state === 'wallet' || state === 'hybrid',
      },
      permissions,
      custodialAssets: {
        nftCertificates: [],
        pendingMints: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, []);

  // Track successful conversions when user authenticates
  const trackSuccessfulConversion = useCallback(() => {
    setConversionMetrics(prev => ({
      ...prev,
      successfulConversions: prev.successfulConversions + 1,
      conversionRate: (prev.successfulConversions + 1) / prev.totalAttempts,
    }));
  }, []);

  // Check existing authentication state
  const checkUser = useCallback(async () => {
    try {
      if (!magic || !mounted.current) return;

      setLoading(true);
      const isLoggedIn = await magic.user.isLoggedIn();
      
      if (isLoggedIn) {
        const metadata = await magic.user.getInfo();
        if (mounted.current && metadata && metadata.issuer && metadata.email) {
          const magicUser: MagicUser = {
            issuer: metadata.issuer,
            email: metadata.email,
            publicAddress: metadata.publicAddress || undefined,
            getIdToken: () => magic.user.getIdToken(),
            getMetadata: () => Promise.resolve(metadata),
          };

          setUser(magicUser);
          
          const newAuthState = determineAuthState(magicUser, wallet);
          setAuthState(newAuthState);
          setProfile(createUserProfile(newAuthState, magicUser, wallet || undefined));
          
          // Setup token refresh
          refreshTimeout.current = setTimeout(checkUser, 3600000); // Refresh every hour
        }
      } else {
        if (mounted.current) {
          const newAuthState = determineAuthState(null, wallet);
          setAuthState(newAuthState);
          
          if (newAuthState !== 'anonymous') {
            setProfile(createUserProfile(newAuthState, undefined, wallet || undefined));
          } else {
            setProfile(null);
          }
        }
      }
    } catch (err) {
      if (mounted.current) {
        const authError: AuthError = {
          code: 'AUTH_ERROR',
          message: err instanceof Error ? err.message : 'Authentication check failed',
          details: { error: err }
        };
        setError(authError);
        log.error('Error checking authentication:', { error: err });
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [magic, wallet, determineAuthState, createUserProfile]);

  // Magic.link authentication with enhanced security
  const login = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!magic) throw new Error('Magic not initialized');

      // Check for rate limiting
      const rateLimitError = checkLoginAttempts(email);
      if (rateLimitError) {
        setError(rateLimitError);
        return;
      }

      // Generate and store CSRF token
      const csrfToken = generateCSRFToken();
      storeCSRFToken(csrfToken);
      localStorage.setItem('auth_state', csrfToken);

      // Send magic link
      const didToken = await magic.auth.loginWithMagicLink({ 
        email,
        showUI: true,
      });
      
      if (!didToken) throw new Error('Authentication failed');

      // Verify CSRF token
      const storedState = localStorage.getItem('auth_state');
      localStorage.removeItem('auth_state');
      
      if (!storedState || !validateCSRFToken(storedState)) {
        throw new Error('Invalid authentication attempt');
      }

      // Server-side validation
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ didToken }),
      });

      if (!response.ok) {
        throw new Error('Server validation failed');
      }

      // Get user metadata
      const metadata = await magic.user.getInfo();
      if (metadata && metadata.issuer && metadata.email) {
        const magicUser: MagicUser = {
          issuer: metadata.issuer,
          email: metadata.email,
          publicAddress: metadata.publicAddress || undefined,
          getIdToken: () => magic.user.getIdToken(),
          getMetadata: () => Promise.resolve(metadata),
        };

        setUser(magicUser);
        
        const newAuthState = determineAuthState(magicUser, wallet);
        setAuthState(newAuthState);
        setProfile(createUserProfile(newAuthState, magicUser, wallet || undefined));
        
        clearLoginAttempts(email);
        
        // Track successful conversion
        trackSuccessfulConversion();
        
        // Store session info
        localStorage.setItem('authState', newAuthState);
        if (metadata.email) {
          localStorage.setItem('userEmail', metadata.email);
        }
      }
    } catch (err) {
      const authError: AuthError = {
        code: 'LOGIN_ERROR',
        message: err instanceof Error ? err.message : 'Login failed',
        details: { error: err }
      };
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  }, [magic, wallet, determineAuthState, createUserProfile, trackSuccessfulConversion]);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!magic) throw new Error('Magic not initialized');

      // Clear authentication state
      localStorage.removeItem('auth_state');
      localStorage.removeItem('authState');
      localStorage.removeItem('userEmail');
      sessionStorage.removeItem('csrf_token');
      
      // Logout from Magic
      await magic.user.logout();
      
      setUser(null);
      
      const newAuthState = determineAuthState(null, wallet);
      setAuthState(newAuthState);
      
      if (newAuthState !== 'anonymous') {
        setProfile(createUserProfile(newAuthState, undefined, wallet || undefined));
      } else {
        setProfile(null);
      }
      
      // Clear refresh timeout
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
        refreshTimeout.current = undefined;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      const authError: AuthError = {
        code: 'LOGOUT_ERROR',
        message: err instanceof Error ? err.message : 'Logout failed',
        details: { error: err }
      };
      setError(authError);
    } finally {
      setLoading(false);
    }
  }, [magic, wallet, router, determineAuthState, createUserProfile]);

  const refreshUser = useCallback(async () => {
    if (!magic || !user) return;
    
    try {
      const metadata = await magic.user.getInfo();
      if (metadata && metadata.issuer && metadata.email) {
        const refreshedUser: MagicUser = {
          issuer: metadata.issuer,
          email: metadata.email,
          publicAddress: metadata.publicAddress || undefined,
          getIdToken: () => magic.user.getIdToken(),
          getMetadata: () => Promise.resolve(metadata),
        };
        setUser(refreshedUser);
      }
    } catch (err) {
      log.error('Error refreshing user:', { error: err });
    }
  }, [magic, user]);

  // Wallet connection methods
  const connectWallet = useCallback(async (connector = 'injected') => {
    try {
      setLoading(true);
      setError(null);

      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('No Web3 wallet detected. Please install MetaMask or another Web3 wallet.');
      }

      // Request account access
      const accountsResponse = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const accounts = accountsResponse as string[];
      if (!Array.isArray(accounts) || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Get chain ID
      const chainIdResponse = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      const chainId = chainIdResponse as string;

      // Get balance
      const balanceResponse = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      });
      const balance = balanceResponse as string;

      const walletConnection: WalletConnection = {
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        connector,
        isConnected: true,
        balance: balance,
      };

      setWallet(walletConnection);
      
      const newAuthState = determineAuthState(user, walletConnection);
      setAuthState(newAuthState);
      setProfile(createUserProfile(newAuthState, user || undefined, walletConnection));

      // Listen for account changes
      window.ethereum.on('accountsChanged', (...args: unknown[]) => {
        const accounts = args[0] as string[];
        if (!Array.isArray(accounts) || accounts.length === 0) {
          // We'll call disconnectWallet directly since it's defined below
          setWallet(null);
          const newAuthState = determineAuthState(user, null);
          setAuthState(newAuthState);
          if (newAuthState !== 'anonymous') {
            setProfile(createUserProfile(newAuthState, user || undefined));
          } else {
            setProfile(null);
          }
        } else {
          setWallet(prev => prev ? { ...prev, address: accounts[0] } : null);
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', (...args: unknown[]) => {
        const chainId = args[0] as string;
        setWallet(prev => prev ? { ...prev, chainId: parseInt(chainId, 16) } : null);
      });

    } catch (err) {
      const authError: AuthError = {
        code: 'WALLET_ERROR',
        message: err instanceof Error ? err.message : 'Wallet connection failed',
        details: { error: err }
      };
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  }, [user, determineAuthState, createUserProfile]);

  const disconnectWallet = useCallback(async () => {
    try {
      setWallet(null);
      
      const newAuthState = determineAuthState(user, null);
      setAuthState(newAuthState);
      
      if (newAuthState !== 'anonymous') {
        setProfile(createUserProfile(newAuthState, user || undefined));
      } else {
        setProfile(null);
      }

      // Remove event listeners
      if (window.ethereum?.removeAllListeners) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    } catch (err) {
      log.error('Failed to disconnect wallet:', { error: err });
    }
  }, [user, determineAuthState, createUserProfile]);

  const switchChain = useCallback(async (chainId: number) => {
    try {
      if (!window.ethereum) throw new Error('No wallet connected');

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });

      setWallet(prev => prev ? { ...prev, chainId } : null);
    } catch (err) {
      const authError: AuthError = {
        code: 'WALLET_ERROR',
        message: err instanceof Error ? err.message : 'Chain switch failed',
        details: { error: err, chainId }
      };
      setError(authError);
      throw authError;
    }
  }, []);

  // Hybrid methods
  const linkWallet = useCallback(async () => {
    if (!user) throw new Error('Must be logged in with email first');
    if (!wallet?.isConnected) throw new Error('Must connect wallet first');

    try {
      const response = await fetch('/api/auth/link-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({
          walletAddress: wallet.address,
          chainId: wallet.chainId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to link wallet');
      }

      const newAuthState = 'hybrid';
      setAuthState(newAuthState);
      setProfile(createUserProfile(newAuthState, user, wallet));
    } catch (err) {
      const authError: AuthError = {
        code: 'WALLET_ERROR',
        message: err instanceof Error ? err.message : 'Wallet linking failed',
        details: { error: err }
      };
      setError(authError);
      throw authError;
    }
  }, [user, wallet, createUserProfile]);

  const unlinkWallet = useCallback(async () => {
    if (!user) throw new Error('Must be logged in');

    try {
      const response = await fetch('/api/auth/unlink-wallet', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to unlink wallet');
      }

      const newAuthState = 'email';
      setAuthState(newAuthState);
      setProfile(createUserProfile(newAuthState, user));
    } catch (err) {
      const authError: AuthError = {
        code: 'WALLET_ERROR',
        message: err instanceof Error ? err.message : 'Wallet unlinking failed',
        details: { error: err }
      };
      setError(authError);
      throw authError;
    }
  }, [user, createUserProfile]);

  const upgradeToHybrid = useCallback(async () => {
    if (authState === 'email' && !wallet?.isConnected) {
      await connectWallet();
    }
    if (authState === 'wallet' && !user) {
      throw new Error('Email authentication required for hybrid mode');
    }
    await linkWallet();
  }, [authState, wallet, user, connectWallet, linkWallet]);

  // Access control
  const checkAccess = useCallback((resource: string): boolean => {
    if (!profile) return false;

    switch (resource) {
      case 'browse':
        return profile.permissions.canBrowse;
      case 'purchase':
        return profile.permissions.canPurchase;
      case 'mint':
        return profile.permissions.canMintNFT;
      case 'web3':
        return profile.permissions.canAccessWeb3;
      default:
        return false;
    }
  }, [profile]);

  const requestAccess = useCallback(async (resource: string): Promise<boolean> => {
    if (checkAccess(resource)) return true;

    switch (resource) {
      case 'browse':
      case 'purchase':
        if (authState === 'anonymous') {
          throw new Error('Email authentication required');
        }
        break;
      case 'mint':
      case 'web3':
        if (authState === 'anonymous' || authState === 'email') {
          throw new Error('Wallet connection required');
        }
        break;
    }

    return false;
  }, [authState, checkAccess]);

  // NFT/Crypto features
  const claimCustodialAssets = useCallback(async () => {
    if (!user || !wallet?.isConnected) {
      throw new Error('Hybrid authentication required');
    }

    try {
      const response = await fetch('/api/nft/claim-custodial', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({
          walletAddress: wallet.address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to claim custodial assets');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const authError: AuthError = {
        code: 'WALLET_ERROR',
        message: err instanceof Error ? err.message : 'Asset claiming failed',
        details: { error: err }
      };
      setError(authError);
      throw authError;
    }
  }, [user, wallet]);

  const mintNFTCertificate = useCallback(async (artworkId: string): Promise<string> => {
    if (!checkAccess('mint')) {
      throw new Error('NFT minting permission required');
    }

    try {
      const response = await fetch('/api/nft/mint-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user ? `Bearer ${await user.getIdToken()}` : '',
        },
        body: JSON.stringify({
          artworkId,
          walletAddress: wallet?.address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mint NFT certificate');
      }

      const result = await response.json();
      return result.tokenId;
    } catch (err) {
      const authError: AuthError = {
        code: 'WALLET_ERROR',
        message: err instanceof Error ? err.message : 'NFT minting failed',
        details: { error: err, artworkId }
      };
      setError(authError);
      throw authError;
    }
  }, [user, wallet, checkAccess]);

  // Soft gating methods
  const trackConversionIntent = useCallback((intent: string, metadata?: Record<string, unknown>) => {
    setConversionMetrics(prev => ({
      ...prev,
      totalAttempts: prev.totalAttempts + 1,
      intentBreakdown: {
        ...prev.intentBreakdown,
        [intent]: (prev.intentBreakdown[intent] || 0) + 1,
      },
      lastAttempt: {
        intent,
        timestamp: new Date().toISOString(),
        metadata,
      },
    }));
  }, []);

  const showAuthModal = useCallback((intent: 'purchase' | 'save' | 'contact' | 'verify' | 'apply', onSuccess?: () => void) => {
    setAuthIntent(intent);
    trackConversionIntent(intent);
    
    // Store the success callback for use after authentication
    if (onSuccess) {
      // Store callback in a ref or state for use after successful auth
      // For now, we'll execute it immediately as a placeholder
      // In a real implementation, this would be called after successful authentication
      log.auth(`Auth success callback stored for intent: ${intent}`, { intent });
    }
    
    // In a real implementation, this would trigger the AuthModal component
    // For now, we'll just track the intent
    log.auth(`Showing auth modal for intent: ${intent}`, { intent });
  }, [trackConversionIntent]);

  const getConversionMetrics = useCallback((): ConversionMetrics => {
    return {
      ...conversionMetrics,
      conversionRate: conversionMetrics.totalAttempts > 0 
        ? conversionMetrics.successfulConversions / conversionMetrics.totalAttempts 
        : 0,
    };
  }, [conversionMetrics]);

  // Access level checking methods
  const hasBasicAccess = useCallback((): boolean => {
    return authState === 'email' || authState === 'wallet' || authState === 'hybrid';
  }, [authState]);

  const hasWalletAccess = useCallback((): boolean => {
    return authState === 'wallet' || authState === 'hybrid';
  }, [authState]);

  const hasHybridAccess = useCallback((): boolean => {
    return authState === 'hybrid';
  }, [authState]);

  const hasRequiredAccess = useCallback((level: 'basic' | 'wallet' | 'hybrid'): boolean => {
    switch (level) {
      case 'basic':
        return hasBasicAccess();
      case 'wallet':
        return hasWalletAccess();
      case 'hybrid':
        return hasHybridAccess();
      default:
        return false;
    }
  }, [hasBasicAccess, hasWalletAccess, hasHybridAccess]);

  // Initialize on mount
  useEffect(() => {
    checkUser();
    
    return () => {
      mounted.current = false;
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
    };
  }, [checkUser]);

  // Check for existing wallet connection on mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accountsResponse = await window.ethereum.request({ 
            method: 'eth_accounts' 
          });
          
          const accounts = accountsResponse as string[];
          if (Array.isArray(accounts) && accounts.length > 0) {
            const chainIdResponse = await window.ethereum.request({ 
              method: 'eth_chainId' 
            });
            const chainId = chainIdResponse as string;

            const walletConnection: WalletConnection = {
              address: accounts[0],
              chainId: parseInt(chainId, 16),
              connector: 'injected',
              isConnected: true,
            };

            setWallet(walletConnection);
          }
        } catch (err) {
          log.error('Failed to check wallet connection:', { error: err });
        }
      }
    };

    checkWalletConnection();
  }, []);

  const contextValue: AuthContextType = {
    // State
    user,
    wallet,
    profile,
    authState,
    loading,
    error,
    isAuthenticated,
    authIntent,
    
    // Magic methods
    login,
    logout,
    refreshUser,
    
    // Wallet methods
    connectWallet,
    disconnectWallet,
    switchChain,
    
    // Hybrid methods
    linkWallet,
    unlinkWallet,
    upgradeToHybrid,
    
    // Access control
    checkAccess,
    requestAccess,
    
    // Soft gating methods
    showAuthModal,
    trackConversionIntent,
    getConversionMetrics,
    hasBasicAccess,
    hasWalletAccess,
    hasHybridAccess,
    hasRequiredAccess,
    
    // NFT/Crypto features
    claimCustodialAssets,
    mintNFTCertificate,
  };

  return (
    <HybridAuthContext.Provider value={contextValue}>
      {children}
    </HybridAuthContext.Provider>
  );
};

// Add window.ethereum type declaration
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeAllListeners: (event: string) => void;
    };
  }
}
