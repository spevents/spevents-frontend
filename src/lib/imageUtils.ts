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

    // Always revoke the object URL — in both success and error paths —
    // to prevent memory leaks when compressing many images.
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

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

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
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
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(blob);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to load image for dimension check"));
      };
      img.src = objectUrl;
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

// ===============================
// FAST OFF-MAIN-THREAD COMPRESSION
// ===============================
// A single shared Worker decodes/resizes/encodes on a background thread so the
// UI never blocks during upload. Falls back to the main-thread path on
// browsers without OffscreenCanvas.convertToBlob (e.g. older Safari).

let _worker: Worker | null = null;
let _reqId = 0;
const _pending = new Map<
  number,
  { resolve: (b: Blob) => void; reject: (e: Error) => void }
>();

function getCompressWorker(): Worker | null {
  if (
    typeof Worker === "undefined" ||
    typeof OffscreenCanvas === "undefined" ||
    typeof (OffscreenCanvas.prototype as { convertToBlob?: unknown })
      .convertToBlob !== "function"
  ) {
    return null;
  }
  if (!_worker) {
    try {
      _worker = new Worker(new URL("./compressWorker.ts", import.meta.url), {
        type: "module",
      });
      _worker.onmessage = (e: MessageEvent) => {
        const { id, blob, error } = e.data as {
          id: number;
          blob?: Blob;
          error?: string;
        };
        const pending = _pending.get(id);
        if (!pending) return;
        _pending.delete(id);
        if (error || !blob) pending.reject(new Error(error || "compress failed"));
        else pending.resolve(blob);
      };
      _worker.onerror = () => {
        // Reject everything in flight and disable the worker so callers fall
        // back to the main-thread path.
        _pending.forEach((p) => p.reject(new Error("compress worker error")));
        _pending.clear();
        _worker = null;
      };
    } catch {
      _worker = null;
    }
  }
  return _worker;
}

let _webpSupport: boolean | null = null;
function supportsWebpEncode(): boolean {
  if (_webpSupport !== null) return _webpSupport;
  try {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    _webpSupport = c.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    _webpSupport = false;
  }
  return _webpSupport;
}

/**
 * Compress for upload, off the main thread when possible, emitting WebP (~30%
 * smaller than JPEG at equal quality) so fewer bytes travel to storage.
 * Drop-in faster replacement for compressForUpload.
 */
export async function compressForUploadFast(file: File): Promise<File> {
  if (file.size < 300 * 1024) return file;

  const quality = getOptimalQuality(file.size);
  const useWebp = supportsWebpEncode();
  const type = useWebp ? "image/webp" : "image/jpeg";
  const ext = useWebp ? ".webp" : ".jpg";
  const maxDim = 1920;

  const worker = getCompressWorker();
  if (worker) {
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        const id = ++_reqId;
        _pending.set(id, { resolve, reject });
        worker.postMessage({ id, blob: file, maxDim, quality, type });
        setTimeout(() => {
          if (_pending.has(id)) {
            _pending.delete(id);
            reject(new Error("compress timeout"));
          }
        }, 15000);
      });
      if (blob.size < file.size) {
        return new File([blob], file.name.replace(/\.[^.]+$/, ext), { type });
      }
      return file;
    } catch (err) {
      console.warn("Worker compress failed, falling back to main thread:", err);
      // fall through
    }
  }

  // Main-thread fallback (also prefers WebP where supported).
  const compressed = await compressImage(file, {
    maxWidth: maxDim,
    maxHeight: maxDim,
    quality,
    format: useWebp ? "webp" : "jpeg",
  });
  if (compressed.size < file.size) {
    return new File([compressed], file.name.replace(/\.[^.]+$/, ext), { type });
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
