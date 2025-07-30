'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setIsVisible(true);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    // Wait for animation to complete before removing
    setTimeout(() => onRemove(toast.id), 200);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-900/90 border-green-700';
      case 'error':
        return 'bg-red-900/90 border-red-700';
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-700';
      case 'info':
      default:
        return 'bg-blue-900/90 border-blue-700';
    }
  };

  return (
    <div
      className={`
        relative flex items-start space-x-3 p-4 rounded-lg border backdrop-blur-sm
        transform transition-all duration-200 ease-in-out
        ${getBackgroundColor()}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex-shrink-0">
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">
          {toast.title}
        </p>
        {toast.message && (
          <p className="mt-1 text-sm text-gray-300">
            {toast.message}
          </p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium text-white hover:text-gray-300 underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={handleRemove}
        className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 text-gray-400 hover:text-white" />
      </button>
    </div>
  );
}

// Convenience functions
export const toast = {
  success: (title: string, message?: string, options?: Partial<ToastMessage>) => ({
    type: 'success' as const,
    title,
    message,
    ...options
  }),
  error: (title: string, message?: string, options?: Partial<ToastMessage>) => ({
    type: 'error' as const,
    title,
    message,
    ...options
  }),
  info: (title: string, message?: string, options?: Partial<ToastMessage>) => ({
    type: 'info' as const,
    title,
    message,
    ...options
  }),
  warning: (title: string, message?: string, options?: Partial<ToastMessage>) => ({
    type: 'warning' as const,
    title,
    message,
    ...options
  }),
};
