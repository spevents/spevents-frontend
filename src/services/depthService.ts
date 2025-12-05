// File: src/services/depthService.ts

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "https://app.spevents.live";

export interface DepthMapResult {
  depthMap: string; // base64 data URL
  success: boolean;
}

/**
 * Generate a depth map for the given image URL
 */
export async function generateDepthMap(
  imageUrl: string,
): Promise<DepthMapResult> {
  try {
    console.log("🔍 Generating depth map for:", imageUrl);

    const response = await fetch(`${BACKEND_URL}/api/depth-estimation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Depth estimation failed: ${response.status} - ${errorText}`,
      );
    }

    const result = await response.json();
    console.log("✅ Depth map generated successfully");

    return result;
  } catch (error) {
    console.error("❌ Depth map generation error:", error);
    throw error;
  }
}

/**
 * Check if depth map generation should be skipped (for speed during demo)
 */
export function shouldGenerateDepthMap(): boolean {
  // You can add conditions here, like only generating for certain events
  // or only generating after the event is over
  return true; // For now, always generate
}
