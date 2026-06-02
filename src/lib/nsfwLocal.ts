// src/lib/nsfwLocal.ts
//
// On-device NSFW moderation. Runs the nsfwjs MobileNetV2 model in the browser
// on the TensorFlow.js WASM (SIMD) backend, so moderation no longer needs a
// network round trip to the backend / HuggingFace.
//
// Everything here is dynamically imported so TF.js + the model weights land in
// a lazy chunk that is fetched once on first use and then cached — the initial
// app bundle is untouched. Callers MUST keep a server-side fallback: if the
// model can't load (old browser, fetch blocked), throw so the caller falls back.

import type { NSFWCheckResponse } from "@/services/nsfw";

interface Prediction {
  className: string;
  probability: number;
}
interface NsfwModel {
  classify: (img: ImageData, topk?: number) => Promise<Prediction[]>;
}

const MODEL_INPUT_SIZE = 224;
// Pin the WASM binaries to the installed backend version.
const WASM_CDN =
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@4.22.0/dist/";

let modelPromise: Promise<NsfwModel> | null = null;

async function getModel(): Promise<NsfwModel> {
  if (!modelPromise) {
    modelPromise = (async () => {
      const tf = await import("@tensorflow/tfjs");

      // Prefer the WASM SIMD backend; fall back to whatever TF picks (WebGL/CPU).
      try {
        const wasm = await import("@tensorflow/tfjs-backend-wasm");
        wasm.setWasmPaths(WASM_CDN);
        await tf.setBackend("wasm");
      } catch (err) {
        console.warn("WASM backend unavailable, using default TF backend:", err);
      }
      await tf.ready();

      // Load ONLY MobileNetV2 (subpath import keeps InceptionV3 out of the chunk).
      const { load } = await import("nsfwjs/core");
      const { MobileNetV2Model } = await import("nsfwjs/models/mobilenet_v2");
      return load("MobileNetV2", {
        modelDefinitions: [MobileNetV2Model],
        size: MODEL_INPUT_SIZE,
      }) as Promise<NsfwModel>;
    })();
  }
  return modelPromise;
}

/**
 * Classify an image entirely on-device. Throws if the model is unavailable so
 * the caller can fall back to the server check (never silently allow).
 */
export async function classifyLocal(file: Blob): Promise<NSFWCheckResponse> {
  const model = await getModel();

  // Decode + downscale to the model's input size on a tiny offscreen canvas.
  const bitmap = await createImageBitmap(file);
  try {
    const canvas =
      typeof OffscreenCanvas !== "undefined"
        ? new OffscreenCanvas(MODEL_INPUT_SIZE, MODEL_INPUT_SIZE)
        : Object.assign(document.createElement("canvas"), {
            width: MODEL_INPUT_SIZE,
            height: MODEL_INPUT_SIZE,
          });
    const ctx = canvas.getContext("2d") as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null;
    if (!ctx) throw new Error("No 2D context for NSFW classify");
    ctx.drawImage(bitmap, 0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
    const imageData = ctx.getImageData(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);

    const predictions = await model.classify(imageData);

    let score = 0;
    let label = "Neutral";
    for (const p of predictions) {
      if (
        (p.className === "Porn" || p.className === "Hentai") &&
        p.probability > score
      ) {
        score = p.probability;
        label = p.className;
      }
    }

    return { isNSFW: score > 0.6, score, label };
  } finally {
    bitmap.close();
  }
}
