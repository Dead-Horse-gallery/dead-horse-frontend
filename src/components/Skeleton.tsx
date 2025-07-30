import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animated?: boolean;
}

/**
 * Base Skeleton component for loading states
 * Provides a shimmer animation for better perceived performance
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  rounded = false,
  animated = true,
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  const animationClasses = animated ? 'animate-pulse' : '';
  const roundedClasses = rounded ? 'rounded-full' : 'rounded';
  
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`${baseClasses} ${animationClasses} ${roundedClasses} ${className}`}
      style={style}
      aria-label="Loading..."
      role="status"
    />
  );
};

/**
 * Skeleton for artwork cards in gallery
 */
export const ArtworkCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    {/* Image skeleton */}
    <Skeleton height="200px" className="w-full" />
    
    <div className="p-4 space-y-3">
      {/* Title skeleton */}
      <Skeleton height="1.25rem" width="80%" />
      
      {/* Artist name skeleton */}
      <Skeleton height="1rem" width="60%" />
      
      {/* Price skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton height="1.5rem" width="30%" />
        <Skeleton height="2rem" width="80px" rounded />
      </div>
    </div>
  </div>
);

/**
 * Skeleton for artist profile
 */
export const ArtistProfileSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-lg p-6">
    <div className="flex items-center space-x-4 mb-6">
      {/* Avatar skeleton */}
      <Skeleton width="80px" height="80px" rounded />
      
      <div className="flex-1 space-y-2">
        {/* Name skeleton */}
        <Skeleton height="1.5rem" width="200px" />
        {/* Bio skeleton */}
        <Skeleton height="1rem" width="300px" />
        <Skeleton height="1rem" width="250px" />
      </div>
    </div>
    
    {/* Stats skeleton */}
    <div className="grid grid-cols-3 gap-4 mb-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="text-center">
          <Skeleton height="1.5rem" width="40px" className="mx-auto mb-1" />
          <Skeleton height="1rem" width="60px" className="mx-auto" />
        </div>
      ))}
    </div>
    
    {/* Description skeleton */}
    <div className="space-y-2">
      <Skeleton height="1rem" width="100%" />
      <Skeleton height="1rem" width="90%" />
      <Skeleton height="1rem" width="80%" />
    </div>
  </div>
);

/**
 * Skeleton for payment form
 */
export const PaymentFormSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
    {/* Title skeleton */}
    <Skeleton height="1.5rem" width="200px" />
    
    {/* Form fields skeleton */}
    <div className="space-y-4">
      {/* Card number */}
      <div>
        <Skeleton height="1rem" width="100px" className="mb-2" />
        <Skeleton height="3rem" width="100%" />
      </div>
      
      {/* Expiry and CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton height="1rem" width="80px" className="mb-2" />
          <Skeleton height="3rem" width="100%" />
        </div>
        <div>
          <Skeleton height="1rem" width="60px" className="mb-2" />
          <Skeleton height="3rem" width="100%" />
        </div>
      </div>
      
      {/* Name */}
      <div>
        <Skeleton height="1rem" width="120px" className="mb-2" />
        <Skeleton height="3rem" width="100%" />
      </div>
      
      {/* Submit button */}
      <Skeleton height="3rem" width="100%" className="mt-6" />
    </div>
  </div>
);

/**
 * Skeleton for navigation menu
 */
export const NavigationSkeleton: React.FC = () => (
  <nav className="bg-white shadow-sm border-b">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Logo skeleton */}
        <Skeleton height="2rem" width="150px" />
        
        {/* Navigation items skeleton */}
        <div className="hidden md:flex space-x-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height="1rem" width="80px" />
          ))}
        </div>
        
        {/* Auth button skeleton */}
        <Skeleton height="2.5rem" width="100px" rounded />
      </div>
    </div>
  </nav>
);

/**
 * Skeleton for gallery grid
 */
export const GalleryGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ArtworkCardSkeleton key={i} />
    ))}
  </div>
);

/**
 * Skeleton for text content
 */
export const TextSkeleton: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        height="1rem" 
        width={i === lines - 1 ? '75%' : '100%'} 
      />
    ))}
  </div>
);

export default Skeleton;
