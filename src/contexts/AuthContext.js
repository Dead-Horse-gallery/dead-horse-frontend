'use client';

// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [magic, setMagic] = useState(null);

  // Initialize Magic.link only on client side
  useEffect(() => {
    const initMagic = async () => {
      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY) {
        try {
          // Dynamic import of Magic to avoid SSR issues
          const { Magic } = await import('magic-sdk');
          const magicInstance = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY);
          setMagic(magicInstance);
          console.log('Magic.link initialized successfully');
        } catch (error) {
          console.error('Failed to initialize Magic.link:', error);
        }
      }
      setLoading(false);
    };

    initMagic();
  }, []);

  // Login function
  const login = async (email) => {
    if (!magic) {
      return { success: false, error: 'Magic.link not initialized yet. Please try again in a moment.' };
    }

    try {
      setLoading(true);
      
      // Magic.link login
      await magic.auth.loginWithMagicLink({ email });
      
      // Wait for authentication to complete
      let attempts = 0;
      while (attempts < 10) {
        try {
          const isLoggedIn = await magic.user.isLoggedIn();
          if (isLoggedIn) {
            const userMetadata = await magic.user.getMetadata();
            const didToken = await magic.user.getIdToken();
            
            // Send to backend
            const response = await fetch('http://localhost:3001/api/auth/login', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${didToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: userMetadata.email,
                publicAddress: userMetadata.publicAddress
              })
            });

            if (response.ok) {
              const profile = await response.json();
              const userData = { ...userMetadata, ...profile };
              setUser(userData);
              return { success: true, user: userData };
            } else {
              throw new Error('Backend authentication failed');
            }
          }
          
          // Wait before next attempt
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        } catch (error) {
          attempts++;
          if (attempts >= 10) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      throw new Error('Authentication timeout');
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    if (!magic) return;
    
    try {
      await magic.user.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};