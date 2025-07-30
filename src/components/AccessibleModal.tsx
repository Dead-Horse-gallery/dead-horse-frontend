/**
 * Accessible Modal component with WCAG AA compliance
 * Features focus trapping, proper ARIA attributes, and keyboard navigation
 */

import React, { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { focusManager, FOCUS_STYLES, ARIA, KEYBOARD } from '@/lib/accessibility';
import AccessibleButton from './AccessibleButton';

export interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const focusTrapCleanup = useRef<(() => void) | null>(null);

  const titleId = ARIA.generateId('modal-title');
  const descriptionId = description ? ARIA.generateId('modal-description') : undefined;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === KEYBOARD.KEYS.ESCAPE) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle focus trapping
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Trap focus within modal
      focusTrapCleanup.current = focusManager.trapFocus(modalRef.current);

      // Announce modal opening
      ARIA.announce(`Modal opened: ${title}`, 'assertive');
    }

    return () => {
      if (focusTrapCleanup.current) {
        focusTrapCleanup.current();
        focusTrapCleanup.current = null;
      }
    };
  }, [isOpen, title]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === overlayRef.current) {
      onClose();
    }
  };

  const handleClose = () => {
    ARIA.announce('Modal closed', 'polite');
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div
        ref={modalRef}
        className={cn(
          // Base styles
          'relative w-full bg-white rounded-lg shadow-xl',
          'transform transition-all duration-300',
          'max-h-[90vh] overflow-y-auto',
          // Size classes
          sizeClasses[size],
          // Focus styles
          FOCUS_STYLES.card,
          className
        )}
        role="document"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 id={titleId} className="text-xl font-semibold text-gray-900 leading-6">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-gray-600">
                {description}
              </p>
            )}
          </div>

          {showCloseButton && (
            <AccessibleButton
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="ml-4 -mt-2 -mr-2"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </AccessibleButton>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );

  // Render modal in portal
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
};

export { AccessibleModal };
export default AccessibleModal;
