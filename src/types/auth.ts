// Dead Horse Gallery - Hybrid authentication system
// Requirements:
// - Magic.link for email authentication (already configured)
// - Optional wallet connection for Web3 features
// - Account gating for gallery access
// - Progressive Web3 enhancement
// - Support both card payments (Stripe) and crypto (Coinbase Commerce)
// - User can start with email, upgrade to wallet later
// - Maintain NFT certificates in custodial wallet until claimed

export type UserAuthState = 'anonymous' | 'email' | 'wallet' | 'hybrid';

export interface MagicUserMetadata {
  email: string | null;
  issuer: string | null;
  publicAddress: string | null;
}

export interface MagicUser {
  issuer: string;
  email: string;
  publicAddress?: string;
  getIdToken: () => Promise<string>;
  getMetadata: () => Promise<MagicUserMetadata>;
}

export interface WalletConnection {
  address: string;
  chainId: number;
  connector: string; // 'metamask', 'walletconnect', 'coinbase', etc.
  isConnected: boolean;
  balance?: string;
  ensName?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  walletAddress?: string;
  authState: UserAuthState;
  preferences: {
    currency: 'USD' | 'ETH';
    paymentMethod: 'card' | 'crypto' | 'both';
    web3Features: boolean;
  };
  permissions: {
    canBrowse: boolean;
    canPurchase: boolean;
    canMintNFT: boolean;
    canAccessWeb3: boolean;
  };
  custodialAssets?: {
    nftCertificates: string[];
    pendingMints: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthError {
  code: 'AUTH_ERROR' | 'LOGIN_ERROR' | 'LOGOUT_ERROR' | 'WALLET_ERROR' | 'PERMISSION_ERROR';
  message: string;
  details?: Record<string, unknown>;
}

export interface ConversionMetrics {
  totalAttempts: number;
  successfulConversions: number;
  conversionRate: number;
  intentBreakdown: Record<string, number>;
  lastAttempt?: {
    intent: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
  };
}

export interface AuthState {
  user: MagicUser | null;
  wallet: WalletConnection | null;
  profile: UserProfile | null;
  authState: UserAuthState;
  loading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  // Magic.link methods
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // Wallet methods
  connectWallet: (connector?: string) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  switchChain: (chainId: number) => Promise<void>;
  
  // Hybrid methods
  linkWallet: () => Promise<void>;
  unlinkWallet: () => Promise<void>;
  upgradeToHybrid: () => Promise<void>;
  
  // Access control
  checkAccess: (resource: string) => boolean;
  requestAccess: (resource: string) => Promise<boolean>;
  
  // Soft gating methods
  authIntent: string | null;
  showAuthModal: (intent: 'purchase' | 'save' | 'contact' | 'verify' | 'apply', onSuccess?: () => void) => void;
  trackConversionIntent: (intent: string, metadata?: Record<string, unknown>) => void;
  getConversionMetrics: () => ConversionMetrics;
  hasBasicAccess: () => boolean;
  hasWalletAccess: () => boolean;
  hasHybridAccess: () => boolean;
  hasRequiredAccess: (level: 'basic' | 'wallet' | 'hybrid') => boolean;
  
  // NFT/Crypto features
  claimCustodialAssets: () => Promise<void>;
  mintNFTCertificate: (artworkId: string) => Promise<string>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

// Access control definitions
export const ACCESS_LEVELS = {
  ANONYMOUS: {
    canBrowse: false,
    canPurchase: false,
    canMintNFT: false,
    canAccessWeb3: false,
  },
  EMAIL: {
    canBrowse: true,
    canPurchase: true,
    canMintNFT: false,
    canAccessWeb3: false,
  },
  WALLET: {
    canBrowse: true,
    canPurchase: true,
    canMintNFT: true,
    canAccessWeb3: true,
  },
  HYBRID: {
    canBrowse: true,
    canPurchase: true,
    canMintNFT: true,
    canAccessWeb3: true,
  },
} as const;

export const SUPPORTED_CHAINS = {
  ETHEREUM: 1,
  POLYGON: 137,
  BASE: 8453,
} as const;

export const WALLET_CONNECTORS = [
  'metamask',
  'walletconnect',
  'coinbase',
  'injected',
] as const;
