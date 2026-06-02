// src/lib/compressWorker.ts
//
// Off-main-thread image compression using the browser's NATIVE OffscreenCanvas
// codecs. Native codecs are SIMD-optimized C++ and beat a hand-rolled WASM
// encoder on both speed and bundle size; the real win here is doing the
// decode/resize/encode on a Worker thread so the UI never janks during upload.

// `self` types as Window under the DOM lib (no webworker lib configured), so
// narrow it to just the worker surface we use.
const scope = self as unknown as {
  onmessage: ((e: MessageEvent) => void) | null;
  postMessage: (message: unknown) => void;
};

interface CompressRequest {
  id: number;
  blob: Blob;
  maxDim: number;
  quality: number;
  type: string; // "image/webp" | "image/jpeg"
}

scope.onmessage = async (e: MessageEvent) => {
  const { id, blob, maxDim, quality, type } = e.data as CompressRequest;
  try {
    const bitmap = await createImageBitmap(blob);
    let width = bitmap.width;
    let height = bitmap.height;

    if (width > maxDim || height > maxDim) {
      const ratio = Math.min(maxDim / width, maxDim / height);
      width = Math.max(1, Math.round(width * ratio));
      height = Math.max(1, Math.round(height * ratio));
    }

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2D context in worker");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const out = await canvas.convertToBlob({ type, quality });
    scope.postMessage({ id, blob: out });
  } catch (err) {
    scope.postMessage({
      id,
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
