// ProtectedAction - Universal wrapper component for authentication-gated actions
// Provides seamless integration with HybridAuthContext for protected elements

"use client";

import React from 'react';
import { useHybridAuth } from '@/contexts/HybridAuthContext';

// Base ProtectedAction props
interface ProtectedActionProps {
  children: React.ReactNode;
  onClick?: () => void;
  intent: 'purchase' | 'save' | 'contact' | 'verify' | 'apply';
  requireLevel?: 'email' | 'wallet' | 'hybrid';
  metadata?: Record<string, unknown>;
  className?: string;
  disabled?: boolean;
}

// Main ProtectedAction component
export default function ProtectedAction({
  children,
  onClick,
  intent,
  requireLevel = 'email',
  metadata,
  className,
  disabled = false,
  ...props
}: ProtectedActionProps) {
  const { user, wallet, showAuthModal, trackConversionIntent } = useHybridAuth();

  const isAuthenticated = () => {
    switch (requireLevel) {
      case 'email':
        return !!user;
      case 'wallet':
        return wallet?.isConnected;
      case 'hybrid':
        return !!user && wallet?.isConnected;
      default:
        return !!user;
    }
  };

  const handleClick = () => {
    if (disabled) return;

    if (!isAuthenticated()) {
      trackConversionIntent(intent, metadata);
      showAuthModal(intent);
      return;
    }

    // User is authenticated, execute the action
    onClick?.();
  };

  // Handle children more robustly
  if (!children) {
    return null;
  }

  // If children is a single React element, clone it
  if (React.isValidElement(children)) {
    const childElement = children as React.ReactElement<{
      onClick?: () => void;
      className?: string;
      disabled?: boolean;
      [key: string]: unknown;
    }>;
    
    return React.cloneElement(childElement, {
      ...childElement.props,
      onClick: handleClick,
      className: className || childElement.props.className,
      disabled: disabled || childElement.props.disabled,
      ...props,
    });
  }

  // If children is text or multiple elements, wrap in a button
  return (
    <button
      onClick={handleClick}
      className={className}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// Convenience component for purchase actions
export function ProtectedPurchase({ 
  children, 
  onClick, 
  metadata, 
  ...props 
}: Omit<ProtectedActionProps, 'intent'>) {
  return (
    <ProtectedAction 
      intent="purchase" 
      onClick={onClick} 
      metadata={metadata}
      {...props}
    >
      {children}
    </ProtectedAction>
  );
}

// Convenience component for save/favorite actions
export function ProtectedSave({ 
  children, 
  onClick, 
  metadata, 
  ...props 
}: Omit<ProtectedActionProps, 'intent'>) {
  return (
    <ProtectedAction 
      intent="save" 
      onClick={onClick} 
      metadata={metadata}
      {...props}
    >
      {children}
    </ProtectedAction>
  );
}

// Convenience component for contact actions
export function ProtectedContact({ 
  children, 
  onClick, 
  metadata, 
  ...props 
}: Omit<ProtectedActionProps, 'intent'>) {
  return (
    <ProtectedAction 
      intent="contact" 
      onClick={onClick} 
      metadata={metadata}
      {...props}
    >
      {children}
    </ProtectedAction>
  );
}

// Convenience component for verification actions
export function ProtectedVerify({ 
  children, 
  onClick, 
  metadata, 
  ...props 
}: Omit<ProtectedActionProps, 'intent'>) {
  return (
    <ProtectedAction 
      intent="verify" 
      onClick={onClick} 
      metadata={metadata}
      {...props}
    >
      {children}
    </ProtectedAction>
  );
}

// Convenience component for application actions
export function ProtectedApply({ 
  children, 
  onClick, 
  metadata, 
  ...props 
}: Omit<ProtectedActionProps, 'intent'>) {
  return (
    <ProtectedAction 
      intent="apply" 
      onClick={onClick} 
      metadata={metadata}
      {...props}
    >
      {children}
    </ProtectedAction>
  );
}
