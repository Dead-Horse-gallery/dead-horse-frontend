/**
 * Accessible Image component with WCAG AA compliance
 * Features proper alt text, loading states, and error handling
 */

import React, { useState, forwardRef, ImgHTMLAttributes } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ARIA } from '@/lib/accessibility';

export interface AccessibleImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'width' | 'height'> {
  src: string;
  alt: string;
  decorative?: boolean;
  caption?: string;
  fallbackSrc?: string;
  showLoadingState?: boolean;
  aspectRatio?: 'square' | '16/9' | '4/3' | '3/2' | 'auto';
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
}

const AccessibleImage = forwardRef<HTMLImageElement, AccessibleImageProps>(
  (
    {
      src,
      alt,
      decorative = false,
      caption,
      fallbackSrc,
      showLoadingState = true,
      aspectRatio = 'auto',
      priority = false,
      sizes,
      className,
      width,
      height,
      ...props
    },
    ref
  ) => {
    const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
    const [currentSrc, setCurrentSrc] = useState(src);

    const imageId = ARIA.generateId('image');
    const captionId = caption ? `${imageId}-caption` : undefined;

    const aspectRatioClasses = {
      square: 'aspect-square',
      '16/9': 'aspect-video',
      '4/3': 'aspect-[4/3]',
      '3/2': 'aspect-[3/2]',
      auto: '',
    };

    const handleImageLoad = () => {
      setImageState('loaded');
    };

    const handleImageError = () => {
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        setImageState('loading');
      } else {
        setImageState('error');
      }
    };

    const baseClasses = cn(
      'transition-opacity duration-300',
      aspectRatioClasses[aspectRatio],
      className
    );

    // For decorative images
    if (decorative) {
      return (
        <div className="relative overflow-hidden">
          {showLoadingState && imageState === 'loading' && (
            <div className={cn(
              'absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center',
              aspectRatioClasses[aspectRatio]
            )}>
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {imageState === 'error' ? (
            <div className={cn(
              'bg-gray-100 flex items-center justify-center',
              aspectRatioClasses[aspectRatio]
            )}>
              <div className="text-center text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span className="text-sm">Image unavailable</span>
              </div>
            </div>
          ) : (
            <Image
              ref={ref}
              src={currentSrc}
              alt=""
              aria-hidden="true"
              role="presentation"
              className={cn(
                baseClasses,
                imageState === 'loading' ? 'opacity-0' : 'opacity-100'
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
              width={width}
              height={height}
              priority={priority}
              sizes={sizes}
              {...props}
            />
          )}
        </div>
      );
    }

    // For content images with alt text
    return (
      <figure className="relative">
        {showLoadingState && imageState === 'loading' && (
          <div className={cn(
            'absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10',
            aspectRatioClasses[aspectRatio]
          )}>
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {imageState === 'error' ? (
          <div className={cn(
            'bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300',
            aspectRatioClasses[aspectRatio]
          )}
          role="img"
          aria-label={alt}
          >
            <div className="text-center text-gray-500 p-4">
              <svg
                className="w-12 h-12 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span className="text-sm font-medium">Image failed to load</span>
              <p className="text-xs mt-1">
                {alt.length > 50 ? `${alt.substring(0, 50)}...` : alt}
              </p>
            </div>
          </div>
        ) : (
          <Image
            ref={ref}
            id={imageId}
            src={currentSrc}
            alt={alt}
            className={cn(
              baseClasses,
              imageState === 'loading' ? 'opacity-0' : 'opacity-100'
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
            aria-describedby={captionId}
            width={width}
            height={height}
            priority={priority}
            sizes={sizes}
            {...props}
          />
        )}

        {caption && (
          <figcaption
            id={captionId}
            className="mt-2 text-sm text-gray-600 text-center"
          >
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }
);

AccessibleImage.displayName = 'AccessibleImage';

export { AccessibleImage };
export default AccessibleImage;
