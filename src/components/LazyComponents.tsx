import React, { Suspense, lazy } from 'react';
import Image from 'next/image';
import { logger } from '@/lib/logger';
import { Skeleton, ArtworkCardSkeleton, PaymentFormSkeleton } from './Skeleton';

/**
 * Lazy loading utilities for Dead Horse Gallery
 * Implements code splitting for better performance
 */

// Generic lazy component wrapper
function createLazyComponent<T extends Record<string, unknown>>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  name: string,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);

  const WrappedComponent: React.FC<T> = (props) => (
    <Suspense fallback={fallback || <Skeleton height="200px" />}>
      <LazyComponent {...props} />
    </Suspense>
  );

  WrappedComponent.displayName = `Lazy(${name})`;
  return WrappedComponent;
}

// Lazy load existing components - simplified approach
export const LazyPaymentForm = createLazyComponent(
  () => import('./PaymentForm').then(module => ({ default: module.default || module.PaymentForm })),
  'PaymentForm',
  <PaymentFormSkeleton />
);

export const LazyResearchSurvey = createLazyComponent(
  () => import('./ResearchSurvey').then(module => ({ default: module.default || module.ResearchSurvey })),
  'ResearchSurvey',
  <div className="p-6">
    <Skeleton height="2rem" width="300px" className="mb-4" />
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i}>
          <Skeleton height="1rem" width="200px" className="mb-2" />
          <Skeleton height="3rem" width="100%" />
        </div>
      ))}
    </div>
  </div>
);

export const LazyDeadHorseDemo = createLazyComponent(
  () => import('./DeadHorseDemo').then(module => ({ default: module.default || module.DeadHorseDemo })),
  'DeadHorseDemo',
  <div className="space-y-6">
    <Skeleton height="2rem" width="400px" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} height="4rem" />
      ))}
    </div>
  </div>
);

/**
 * Intersection Observer hook for lazy loading content when it comes into view
 */
export const useLazyLoad = (options: IntersectionObserverInit = {}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before element comes into view
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasLoaded, options]);

  return { ref: elementRef, isVisible, hasLoaded };
};

/**
 * Component for lazy loading content when it enters viewport
 */
interface LazyContentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

export const LazyContent: React.FC<LazyContentProps> = ({
  children,
  fallback,
  className = '',
  threshold = 0.1,
  rootMargin = '100px',
}) => {
  const { ref, isVisible } = useLazyLoad({ threshold, rootMargin });

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : (fallback || <Skeleton height="200px" />)}
    </div>
  );
};

/**
 * Optimized image component with lazy loading using Next.js Image
 */
interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width = 400,
  height = 300,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    logger.debug('Image loaded successfully', { src });
  };

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && (
        <Skeleton 
          height={`${height}px`} 
          width={`${width}px`}
          className="absolute inset-0 z-10" 
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        priority={priority}
        sizes={sizes}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};

/**
 * Gallery component with lazy loading for artwork cards
 */
interface LazyGalleryProps {
  artworks: Array<{
    id: string;
    title: string;
    artist: string;
    imageUrl: string;
    price: string;
  }>;
  itemsPerPage?: number;
}

export const LazyGallery: React.FC<LazyGalleryProps> = ({
  artworks,
  itemsPerPage = 8,
}) => {
  const [visibleCount, setVisibleCount] = React.useState(itemsPerPage);

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + itemsPerPage, artworks.length));
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {artworks.slice(0, visibleCount).map((artwork) => (
          <LazyContent
            key={artwork.id}
            fallback={<ArtworkCardSkeleton />}
            threshold={0.1}
            rootMargin="200px"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <LazyImage
                src={artwork.imageUrl}
                alt={artwork.title}
                width={400}
                height={300}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg">{artwork.title}</h3>
                <p className="text-gray-600">{artwork.artist}</p>
                <p className="text-xl font-bold text-green-600">{artwork.price}</p>
              </div>
            </div>
          </LazyContent>
        ))}
      </div>
      
      {visibleCount < artworks.length && (
        <div className="text-center">
          <button
            onClick={loadMore}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Load More ({artworks.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Performance monitoring hook for lazy loaded components
 */
export const usePerformanceMonitor = (componentName: string) => {
  const startTime = React.useRef<number>(0);

  React.useEffect(() => {
    startTime.current = performance.now();
    logger.debug(`Component mounted: ${componentName}`);

    return () => {
      const mountTime = performance.now() - startTime.current;
      logger.info(`Component unmounted: ${componentName}`, {
        mountTime: `${mountTime.toFixed(2)}ms`
      });
    };
  }, [componentName]);

  const measureRender = React.useCallback(() => {
    const renderTime = performance.now() - startTime.current;
    logger.debug(`Component render: ${componentName}`, {
      renderTime: `${renderTime.toFixed(2)}ms`
    });
  }, [componentName]);

  return { measureRender };
};

// Export collection of lazy components
const LazyComponentsExport = {
  LazyPaymentForm,
  LazyResearchSurvey,
  LazyDeadHorseDemo,
  LazyContent,
  LazyImage,
  LazyGallery,
  useLazyLoad,
  usePerformanceMonitor,
};

export default LazyComponentsExport;
