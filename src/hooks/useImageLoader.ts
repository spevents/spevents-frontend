// src/hooks/useImageLoader.ts
import { useState, useEffect, useRef, useCallback } from "react";

interface UseImageLoaderOptions {
  src: string;
  thumbnailSrc?: string;
  rootMargin?: string;
  threshold?: number;
  enabled?: boolean;
}

interface UseImageLoaderReturn {
  isLoaded: boolean;
  isInView: boolean;
  hasError: boolean;
  imgRef: React.RefObject<HTMLDivElement>;
  currentSrc: string | null;
}

/**
 * Custom hook for optimized image loading with intersection observer
 * - Only loads images when they enter the viewport
 * - Supports thumbnail/placeholder loading
 * - Tracks loading state for blur-up animations
 */
export function useImageLoader({
  src,
  thumbnailSrc,
  rootMargin = "100px",
  threshold = 0.1,
  enabled = true,
}: UseImageLoaderOptions): UseImageLoaderReturn {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Preload image
  const preloadImage = useCallback((imageSrc: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () =>
        reject(new Error(`Failed to load image: ${imageSrc}`));
      img.src = imageSrc;
    });
  }, []);

  // Setup intersection observer
  useEffect(() => {
    if (!enabled || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            // Once in view, stop observing
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { rootMargin, threshold },
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [enabled, rootMargin, threshold]);

  // Load image when in view
  useEffect(() => {
    if (!isInView || !src) return;

    let isMounted = true;

    const loadImages = async () => {
      try {
        // If thumbnail exists, load it first for blur-up effect
        if (thumbnailSrc) {
          await preloadImage(thumbnailSrc);
          if (isMounted) {
            setCurrentSrc(thumbnailSrc);
          }
        }

        // Then load full image
        await preloadImage(src);
        if (isMounted) {
          setCurrentSrc(src);
          setIsLoaded(true);
        }
      } catch (error) {
        if (isMounted) {
          setHasError(true);
          console.error("Image loading error:", error);
        }
      }
    };

    loadImages();

    return () => {
      isMounted = false;
    };
  }, [isInView, src, thumbnailSrc, preloadImage]);

  return {
    isLoaded,
    isInView,
    hasError,
    imgRef,
    currentSrc,
  };
}

/**
 * Generate thumbnail URL from original URL
 * Supports CloudFront image resizing or query param based resizing
 */
export function getThumbnailUrl(
  originalUrl: string,
  width: number = 200,
): string {
  // If already a data URL, return as-is
  if (originalUrl.startsWith("data:")) {
    return originalUrl;
  }

  // For CloudFront URLs, we can use query params if Lambda@Edge is configured
  // Otherwise, return the original URL (backend should generate thumbnails)
  const url = new URL(originalUrl);

  // Check if this is a CloudFront URL
  if (url.hostname.includes("cloudfront.net")) {
    // Add width query param for Lambda@Edge image resizing
    url.searchParams.set("w", width.toString());
    url.searchParams.set("q", "60"); // Lower quality for thumbnails
    return url.toString();
  }

  // For Vercel Blob or other CDNs, return original
  return originalUrl;
}

/**
 * Batch preload images for better performance
 */
export async function preloadImages(
  urls: string[],
  concurrency: number = 3,
): Promise<void> {
  const chunks: string[][] = [];
  for (let i = 0; i < urls.length; i += concurrency) {
    chunks.push(urls.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    await Promise.allSettled(
      chunk.map((url) => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = url;
        });
      }),
    );
  }
}
