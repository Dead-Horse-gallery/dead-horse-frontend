/**
 * Accessible Navigation component with WCAG AA compliance
 * Features keyboard navigation, proper ARIA attributes, and focus management
 */

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import { FOCUS_STYLES, KEYBOARD, ARIA } from '@/lib/accessibility';
import AccessibleButton from './AccessibleButton';

export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavigationItem[];
  external?: boolean;
}

export interface AccessibleNavigationProps {
  items: NavigationItem[];
  logo?: React.ReactNode;
  className?: string;
  variant?: 'horizontal' | 'vertical';
  showMobileMenu?: boolean;
}

const AccessibleNavigation: React.FC<AccessibleNavigationProps> = ({
  items,
  logo,
  className,
  variant = 'horizontal',
  showMobileMenu = true,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const mobileMenuId = ARIA.generateId('mobile-menu');
  const logoId = ARIA.generateId('logo');

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setMobileMenuOpen(false);
      setActiveDropdown(null);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router.events]);

  // Handle escape key for dropdowns and mobile menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === KEYBOARD.KEYS.ESCAPE) {
        if (activeDropdown) {
          setActiveDropdown(null);
        } else if (mobileMenuOpen) {
          setMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [activeDropdown, mobileMenuOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const isCurrentPage = (href: string) => {
    return router.pathname === href;
  };

  const handleDropdownToggle = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const handleMobileMenuToggle = () => {
    const newState = !mobileMenuOpen;
    setMobileMenuOpen(newState);
    
    if (newState) {
      ARIA.announce('Mobile menu opened', 'polite');
    } else {
      ARIA.announce('Mobile menu closed', 'polite');
    }
  };

  const renderNavigationItem = (item: NavigationItem, isMobile = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = isCurrentPage(item.href);
    const dropdownId = hasChildren ? ARIA.generateId(`dropdown-${item.label}`) : undefined;

    const linkClasses = cn(
      'block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200',
      FOCUS_STYLES.navigation,
      isActive
        ? 'bg-gray-900 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
      isMobile && 'text-left w-full'
    );

    if (hasChildren) {
      return (
        <div key={item.label} className="relative">
          <AccessibleButton
            variant="ghost"
            className={cn(
              linkClasses,
              'flex items-center justify-between w-full'
            )}
            onClick={() => handleDropdownToggle(item.label)}
            aria-expanded={activeDropdown === item.label}
            aria-controls={dropdownId}
            aria-haspopup="menu"
          >
            <span className="flex items-center gap-2">
              {item.icon && <span aria-hidden="true">{item.icon}</span>}
              {item.label}
            </span>
            <svg
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                activeDropdown === item.label ? 'rotate-180' : ''
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </AccessibleButton>

          {activeDropdown === item.label && (
            <div
              id={dropdownId}
              className={cn(
                'mt-1 space-y-1',
                isMobile ? 'pl-4' : 'absolute left-0 top-full mt-2 w-48 bg-white shadow-lg rounded-md border border-gray-200 py-1 z-50'
              )}
              role="menu"
              aria-orientation="vertical"
            >
              {item.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    'block px-4 py-2 text-sm transition-colors duration-200',
                    FOCUS_STYLES.default,
                    isMobile
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white rounded-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                    isCurrentPage(child.href) && 'bg-gray-100 text-gray-900'
                  )}
                  role="menuitem"
                  target={child.external ? '_blank' : undefined}
                  rel={child.external ? 'noopener noreferrer' : undefined}
                >
                  <span className="flex items-center gap-2">
                    {child.icon && <span aria-hidden="true">{child.icon}</span>}
                    {child.label}
                    {child.external && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={linkClasses}
        aria-current={isActive ? 'page' : undefined}
        target={item.external ? '_blank' : undefined}
        rel={item.external ? 'noopener noreferrer' : undefined}
      >
        <span className="flex items-center gap-2">
          {item.icon && <span aria-hidden="true">{item.icon}</span>}
          {item.label}
          {item.external && (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          )}
        </span>
      </Link>
    );
  };

  return (
    <nav
      ref={navRef}
      className={cn(
        'bg-gray-800',
        variant === 'vertical' ? 'w-64 min-h-screen' : 'w-full',
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          {logo && (
            <div className="flex-shrink-0">
              <Link
                href="/"
                className={cn(
                  'flex items-center',
                  FOCUS_STYLES.navigation
                )}
                aria-labelledby={logoId}
              >
                <span id={logoId} className="sr-only">Dead Horse Gallery Home</span>
                {logo}
              </Link>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {items.map(item => renderNavigationItem(item))}
            </div>
          </div>

          {/* Mobile menu button */}
          {showMobileMenu && (
            <div className="md:hidden">
              <AccessibleButton
                variant="ghost"
                className="text-gray-400 hover:bg-gray-700 hover:text-white"
                onClick={handleMobileMenuToggle}
                aria-expanded={mobileMenuOpen}
                aria-controls={mobileMenuId}
                aria-label="Toggle mobile menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </AccessibleButton>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            id={mobileMenuId}
            className="md:hidden"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="space-y-1 px-2 pb-3 pt-2">
              {items.map(item => renderNavigationItem(item, true))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export { AccessibleNavigation };
export default AccessibleNavigation;
