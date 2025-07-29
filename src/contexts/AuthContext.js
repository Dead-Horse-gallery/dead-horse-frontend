'use client';

// src/contexts/AuthContext.js
import React, { createContext, useContext, useState } from 'react';

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
  const [loading, setLoading] = useState(false);

  const login = async (email) => {
    console.log('🔥 Mock login called with:', email);
    
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        email: email,
        publicAddress: '0x1234567890abcdef',
        id: 'mock-user-id',
        display_name: email.split('@')[0],
        role: 'user'
      };
      
      setUser(mockUser);
      console.log('🎉 Mock login successful:', mockUser);
      
      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Mock login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};