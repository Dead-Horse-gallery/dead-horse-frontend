/**
 * Accessible Input component with WCAG AA compliance
 * Features proper labeling, error states, and enhanced focus indicators
 */

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { FOCUS_STYLES, ARIA } from '@/lib/accessibility';

export interface AccessibleInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  hideLabel?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  (
    {
      label,
      error,
      success,
      hint,
      required = false,
      hideLabel = false,
      leftIcon,
      rightIcon,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || ARIA.generateId('input');
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const successId = success ? `${inputId}-success` : undefined;

    const baseInputClasses = [
      'block w-full rounded-lg border px-3 py-2',
      'text-gray-900 placeholder-gray-400',
      'transition-all duration-200',
      'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
      FOCUS_STYLES.input,
    ];

    const inputStateClasses = {
      default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
      success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
    };

    const getInputState = () => {
      if (error) return 'error';
      if (success) return 'success';
      return 'default';
    };

    const inputState = getInputState();

    const labelClasses = cn(
      'block text-sm font-medium text-gray-700 mb-1',
      hideLabel && 'sr-only'
    );

    const containerClasses = cn(
      'relative',
      (leftIcon || rightIcon) && 'flex items-center'
    );

    const inputElement = (
      <input
        ref={ref}
        id={inputId}
        className={cn(
          baseInputClasses,
          inputStateClasses[inputState],
          leftIcon && 'pl-10',
          rightIcon && 'pr-10',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={cn(
          errorId,
          hintId,
          successId
        ).trim() || undefined}
        aria-required={required}
        {...props}
      />
    );

    return (
      <div className="w-full">
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>

        <div className={containerClasses}>
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none">
              <div className="text-gray-400" aria-hidden="true">
                {leftIcon}
              </div>
            </div>
          )}

          {inputElement}

          {rightIcon && (
            <div className="absolute right-3 flex items-center pointer-events-none">
              <div className="text-gray-400" aria-hidden="true">
                {rightIcon}
              </div>
            </div>
          )}
        </div>

        {/* Hint text */}
        {hint && (
          <p id={hintId} className="mt-1 text-sm text-gray-600">
            {hint}
          </p>
        )}

        {/* Success message */}
        {success && (
          <p id={successId} className="mt-1 text-sm text-green-600" role="status">
            <svg
              className="inline w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {success}
          </p>
        )}

        {/* Error message */}
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            <svg
              className="inline w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';

export { AccessibleInput };
export default AccessibleInput;
