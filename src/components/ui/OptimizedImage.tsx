// src/components/ui/OptimizedImage.tsx
import { useState, useRef, useEffect, memo } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  placeholderColor?: string;
  blurAmount?: number;
  aspectRatio?: "square" | "video" | "auto";
  objectFit?: "cover" | "contain" | "fill";
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean; // Skip lazy loading for above-the-fold images
}

/**
 * OptimizedImage component with:
 * - Intersection Observer for lazy loading
 * - Blur-up placeholder effect
 * - Smooth fade-in transition
 * - Error state handling
 * - Skeleton loading state
 */
function OptimizedImageComponent({
  src,
  alt,
  className,
  containerClassName,
  placeholderColor = "#e5e7eb",
  blurAmount = 20,
  aspectRatio = "square",
  objectFit = "cover",
  onLoad,
  onError,
  priority = false,
}: OptimizedImageProps) {
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "200px", // Start loading 200px before entering viewport
        threshold: 0.01,
      },
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [priority]);

  // Handle image load
  const handleLoad = () => {
    // Small delay for smoother animation
    requestAnimationFrame(() => {
      setShowImage(true);
    });
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Reset state when src changes
  useEffect(() => {
    setShowImage(false);
    setHasError(false);
  }, [src]);

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "",
  }[aspectRatio];

  const objectFitClass = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
  }[objectFit];

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        aspectRatioClass,
        containerClassName,
      )}
      style={{ backgroundColor: placeholderColor }}
    >
      {/* Skeleton/Placeholder */}
      {!showImage && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]" />
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-400">
            <svg
              className="w-8 h-8 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs">Failed to load</span>
          </div>
        </div>
      )}

      {/* Actual Image */}
      {isInView && !hasError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            "absolute inset-0 w-full h-full transition-all duration-500 ease-out",
            objectFitClass,
            showImage ? "opacity-100 scale-100" : "opacity-0 scale-105",
            !showImage && `blur-[${blurAmount}px]`,
            className,
          )}
          style={{
            filter: showImage ? "blur(0px)" : `blur(${blurAmount}px)`,
            transform: showImage ? "scale(1)" : "scale(1.1)",
          }}
          onLoad={handleLoad}
          onError={handleError}
          decoding="async"
        />
      )}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const OptimizedImage = memo(OptimizedImageComponent);

/**
 * Simplified version for grids with many images
 * Less features but better performance for large lists
 */
interface SimpleOptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
}

function SimpleOptimizedImageComponent({
  src,
  alt,
  className,
}: SimpleOptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" },
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={isInView ? src : undefined}
      data-src={src}
      alt={alt}
      className={cn(
        "transition-opacity duration-300",
        isLoaded ? "opacity-100" : "opacity-0",
        className,
      )}
      onLoad={() => setIsLoaded(true)}
      decoding="async"
    />
  );
}

export const SimpleOptimizedImage = memo(SimpleOptimizedImageComponent);
