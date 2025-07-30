/**
 * Accessible Button component with WCAG AA compliance
 * Features enhanced focus indicators, proper ARIA attributes, and keyboard navigation
 */

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { FOCUS_STYLES } from '@/lib/accessibility';

export interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText = 'Loading...',
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      // Layout and spacing
      'inline-flex items-center justify-center gap-2',
      'font-medium leading-5',
      'transition-all duration-200',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      // Enhanced focus styles for accessibility
      FOCUS_STYLES.button,
      // Full width option
      fullWidth ? 'w-full' : '',
    ];

    const variantClasses = {
      primary: [
        'bg-blue-600 text-white',
        'hover:bg-blue-700 hover:shadow-md',
        'active:bg-blue-800 active:shadow-sm',
        'disabled:bg-blue-300',
      ],
      secondary: [
        'bg-gray-600 text-white',
        'hover:bg-gray-700 hover:shadow-md',
        'active:bg-gray-800 active:shadow-sm',
        'disabled:bg-gray-300',
      ],
      outline: [
        'border-2 border-gray-300 text-gray-700 bg-white',
        'hover:bg-gray-50 hover:border-gray-400',
        'active:bg-gray-100 active:border-gray-500',
        'disabled:border-gray-200 disabled:text-gray-400',
      ],
      ghost: [
        'text-gray-700 bg-transparent',
        'hover:bg-gray-100',
        'active:bg-gray-200',
        'disabled:text-gray-400',
      ],
      destructive: [
        'bg-red-600 text-white',
        'hover:bg-red-700 hover:shadow-md',
        'active:bg-red-800 active:shadow-sm',
        'disabled:bg-red-300',
      ],
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm rounded-md min-h-[32px]',
      md: 'px-4 py-2 text-base rounded-lg min-h-[40px]',
      lg: 'px-6 py-3 text-lg rounded-xl min-h-[48px]',
    };

    const buttonContent = loading ? (
      <>
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>{loadingText}</span>
      </>
    ) : (
      <>
        {leftIcon && <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>}
      </>
    );

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-describedby={loading ? 'button-loading-state' : undefined}
        {...props}
      >
        {buttonContent}
        {loading && (
          <span id="button-loading-state" className="sr-only">
            Button is loading, please wait
          </span>
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export { AccessibleButton };
export default AccessibleButton;
