// src/lib/imageUtils.ts
// Client-side image compression and thumbnail generation

interface CompressOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format?: "jpeg" | "webp";
}

interface ImageVariant {
  blob: Blob;
  width: number;
  height: number;
  size: number;
}

/**
 * Compress an image file to reduce upload size and improve loading
 */
export async function compressImage(
  file: File | Blob,
  options: CompressOptions,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions maintaining aspect ratio
      if (width > options.maxWidth || height > options.maxHeight) {
        const ratio = Math.min(
          options.maxWidth / width,
          options.maxHeight / height,
        );
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Use better image smoothing for quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = options.format === "webp" ? "image/webp" : "image/jpeg";

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to compress image"));
          }
        },
        mimeType,
        options.quality,
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));

    if (file instanceof File) {
      img.src = URL.createObjectURL(file);
    } else {
      img.src = URL.createObjectURL(file);
    }
  });
}

/**
 * Generate multiple image variants (thumbnail, medium, original)
 * for responsive loading
 */
export async function generateImageVariants(file: File): Promise<{
  thumbnail: ImageVariant;
  medium: ImageVariant;
  original: ImageVariant;
}> {
  const [thumbnail, medium] = await Promise.all([
    // Thumbnail: 200px max, low quality for blur-up
    compressImage(file, {
      maxWidth: 200,
      maxHeight: 200,
      quality: 0.6,
      format: "jpeg",
    }),
    // Medium: 800px for gallery grid
    compressImage(file, {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
      format: "jpeg",
    }),
  ]);

  // Get dimensions for each variant
  const getDimensions = async (
    blob: Blob,
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(blob);
    });
  };

  const [thumbDims, medDims] = await Promise.all([
    getDimensions(thumbnail),
    getDimensions(medium),
  ]);

  // Get original dimensions
  const origDims = await getDimensions(file);

  return {
    thumbnail: {
      blob: thumbnail,
      width: thumbDims.width,
      height: thumbDims.height,
      size: thumbnail.size,
    },
    medium: {
      blob: medium,
      width: medDims.width,
      height: medDims.height,
      size: medium.size,
    },
    original: {
      blob: file,
      width: origDims.width,
      height: origDims.height,
      size: file.size,
    },
  };
}

/**
 * Convert a data URL to a Blob
 */
export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Convert a Blob to a data URL
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Check if an image needs compression based on size
 */
export function shouldCompressImage(file: File): boolean {
  // Compress images larger than 500KB
  return file.size > 500 * 1024;
}

/**
 * Get optimal quality setting based on file size
 */
export function getOptimalQuality(fileSize: number): number {
  if (fileSize > 5 * 1024 * 1024) return 0.6; // > 5MB
  if (fileSize > 2 * 1024 * 1024) return 0.7; // > 2MB
  if (fileSize > 1 * 1024 * 1024) return 0.8; // > 1MB
  return 0.85;
}

/**
 * Compress image for upload - optimized for web viewing
 */
export async function compressForUpload(file: File): Promise<File> {
  // Don't compress small files
  if (file.size < 300 * 1024) {
    return file;
  }

  const quality = getOptimalQuality(file.size);

  const compressed = await compressImage(file, {
    maxWidth: 1920, // Full HD max
    maxHeight: 1920,
    quality,
    format: "jpeg",
  });

  // Only use compressed version if it's actually smaller
  if (compressed.size < file.size) {
    return new File([compressed], file.name.replace(/\.[^.]+$/, ".jpg"), {
      type: "image/jpeg",
    });
  }

  return file;
}

/**
 * Create a tiny placeholder for blur-up effect
 * Returns a base64 data URL of a very small image
 */
export async function createBlurPlaceholder(
  file: File | Blob,
): Promise<string> {
  const tiny = await compressImage(file, {
    maxWidth: 20,
    maxHeight: 20,
    quality: 0.3,
    format: "jpeg",
  });

  return blobToDataURL(tiny);
}
