export interface MagicUserMetadata {
  email: string;
  issuer: string;
  publicAddress: string;
}

export interface AuthError {
  code: 'AUTH_ERROR' | 'LOGIN_ERROR' | 'LOGOUT_ERROR';
  message: string;
}

export interface AuthState {
  user: MagicUserMetadata | null;
  loading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
