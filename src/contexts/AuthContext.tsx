import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createMagic } from '../lib/magic';
import { useRouter } from 'next/navigation';
import { AuthContextType, MagicUserMetadata, AuthProviderProps, AuthState, AuthError } from '../types/auth';
import { supabase } from '../lib/supabase';
import { 
  checkLoginAttempts, 
  generateCSRFToken, 
  storeCSRFToken, 
  validateCSRFToken, 
  clearLoginAttempts
} from '../lib/auth-utils';

const initialAuthState: AuthState = {
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
};

export const AuthContext = createContext<AuthContextType>({
  ...initialAuthState,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: AuthProviderProps) {
  const [magic] = useState(() => createMagic());
  const [user, setUser] = useState<MagicUserMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  
  // Use refs for cleanup functions to avoid stale closures
  const refreshTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const mounted = useRef<boolean>(true);

  const checkUser = useCallback(async () => {
    try {
      if (!magic || !mounted.current) return;

      setLoading(true);
      const isLoggedIn = await magic.user.isLoggedIn();
      
      if (isLoggedIn) {
        const metadata = await magic.user.getInfo();
        if (mounted.current) {
          setUser(metadata as MagicUserMetadata);
          setIsAuthenticated(true);
          
          // Setup token refresh
          refreshTimeout.current = setTimeout(checkUser, 3600000); // Refresh every hour
        }
      } else {
        if (mounted.current) {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (err) {
      if (mounted.current) {
        const error = err as Error;
        setError({ code: 'AUTH_ERROR', message: error.message });
        console.error('Error checking authentication:', error);
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [magic]);

  useEffect(() => {
    checkUser();
    
    return () => {
      mounted.current = false;
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
    };
  }, [checkUser]);

  const login = async (email: string) => {
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

      // Store CSRF token in localStorage temporarily
      localStorage.setItem('auth_state', csrfToken);

      // Send magic link to user's email
      const didToken = await magic.auth.loginWithMagicLink({ 
        email,
        showUI: true,
      });
      
      if (!didToken) throw new Error('Authentication failed');

      // Verify the stored state matches
      const storedState = localStorage.getItem('auth_state');
      localStorage.removeItem('auth_state'); // Clean up immediately
      
      if (!storedState || !validateCSRFToken(storedState)) {
        throw new Error('Invalid authentication attempt');
      }

      // Get Supabase session
      const { error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      // Get user metadata
      const metadata = await magic.user.getInfo();
      setUser(metadata as MagicUserMetadata);
      setIsAuthenticated(true);

      // Clear login attempts on successful login
      clearLoginAttempts(email);

      // Redirect to dashboard or home
      router.push('/dashboard');
    } catch (err) {
      const error = err as Error;
      setError({ code: 'LOGIN_ERROR', message: error.message });
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      if (!magic) throw new Error('Magic not initialized');

      // Clear all authentication state
      localStorage.removeItem('auth_state');
      sessionStorage.removeItem('csrf_token');

      // Clear Supabase session
      await supabase.auth.signOut();
      
      // Logout from Magic
      await magic.user.logout();
      
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      // Clear refresh timeout
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
        refreshTimeout.current = undefined;
      }

      // Redirect to home page
      router.push('/');
      router.refresh(); // Ensure all server components are refreshed
    } catch (err) {
      const error = err as Error;
      setError({ code: 'LOGOUT_ERROR', message: error.message });
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = useCallback(async () => {
    if (!magic || !user) return;
    
    try {
      const metadata = await magic.user.getInfo();
      setUser(metadata as MagicUserMetadata);
    } catch (err) {
      const error = err as Error;
      console.error('Error refreshing user:', error);
    }
  }, [magic, user]);

  const contextValue = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
