// File: src/services/depthService.ts

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "https://app.spevents.live";

export interface DepthMapResult {
  depthMap: string; // base64 data URL
  success: boolean;
  metadata?: {
    minDepth: number;
    maxDepth: number;
    width: number;
    height: number;
  };
}

export interface CameraPoseResult {
  position: [number, number, number];
  rotation: [number, number, number];
  focalLength: number;
  confidence: number;
  success: boolean;
}

export interface PhotoCluster {
  clusterId: string;
  photos: string[];
  centroid: [number, number, number];
  averageDepth: number;
}

export interface VenueReconstruction {
  pointCloud?: Float32Array;
  cameraPoses: Map<string, CameraPoseResult>;
  clusters: PhotoCluster[];
  bounds: {
    min: [number, number, number];
    max: [number, number, number];
  };
}

/**
 * Generate a depth map for the given image URL with enhanced metadata
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
      body: JSON.stringify({
        imageUrl,
        includeMetadata: true,
        model: "depth-anything-v2", // or "marigold" for higher quality
      }),
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
 * Generate depth maps for multiple images in batch
 */
export async function generateDepthMapsBatch(
  imageUrls: string[],
): Promise<Map<string, DepthMapResult>> {
  try {
    console.log(`🔍 Generating ${imageUrls.length} depth maps in batch...`);

    const response = await fetch(`${BACKEND_URL}/api/depth-estimation-batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrls }),
    });

    if (!response.ok) {
      throw new Error(`Batch depth estimation failed: ${response.status}`);
    }

    const results = await response.json();
    return new Map(Object.entries(results.depthMaps));
  } catch (error) {
    console.error("❌ Batch depth map generation error:", error);
    throw error;
  }
}

/**
 * Estimate camera pose for a photo (where it was taken in 3D space)
 */
export async function estimateCameraPose(
  imageUrl: string,
  depthMap: string,
): Promise<CameraPoseResult> {
  try {
    console.log("📸 Estimating camera pose for:", imageUrl);

    const response = await fetch(`${BACKEND_URL}/api/camera-pose`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl, depthMap }),
    });

    if (!response.ok) {
      throw new Error(`Camera pose estimation failed: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Camera pose estimated");

    return result;
  } catch (error) {
    console.error("❌ Camera pose estimation error:", error);
    // Return default pose if estimation fails
    return {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      focalLength: 50,
      confidence: 0,
      success: false,
    };
  }
}

/**
 * Perform feature matching between two images to determine spatial relationship
 */
export async function matchImageFeatures(
  imageUrl1: string,
  imageUrl2: string,
): Promise<{
  matches: number;
  transformation: number[]; // 4x4 transformation matrix
  confidence: number;
}> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/feature-matching`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl1, imageUrl2 }),
    });

    if (!response.ok) {
      throw new Error(`Feature matching failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Feature matching error:", error);
    return {
      matches: 0,
      transformation: Array(16).fill(0),
      confidence: 0,
    };
  }
}

/**
 * Reconstruct venue from multiple photos
 */
export async function reconstructVenue(
  imageUrls: string[],
  progressCallback?: (progress: number) => void,
): Promise<VenueReconstruction> {
  try {
    console.log(`🏗️ Reconstructing venue from ${imageUrls.length} photos...`);

    // Step 1: Generate depth maps for all images
    progressCallback?.(10);
    const depthMaps = await generateDepthMapsBatch(imageUrls);

    // Step 2: Estimate camera poses
    progressCallback?.(40);
    const cameraPoses = new Map<string, CameraPoseResult>();
    for (const [url, depthResult] of depthMaps.entries()) {
      if (depthResult.success) {
        const pose = await estimateCameraPose(url, depthResult.depthMap);
        cameraPoses.set(url, pose);
      }
    }

    // Step 3: Cluster photos by spatial proximity
    progressCallback?.(70);
    const clusters = await clusterPhotosBySpatialProximity(
      Array.from(cameraPoses.entries()),
    );

    // Step 4: Calculate bounds
    progressCallback?.(90);
    const bounds = calculateSceneBounds(cameraPoses);

    progressCallback?.(100);
    console.log("✅ Venue reconstruction complete");

    return {
      cameraPoses,
      clusters,
      bounds,
    };
  } catch (error) {
    console.error("❌ Venue reconstruction error:", error);
    throw error;
  }
}

/**
 * Cluster photos by spatial proximity
 */
async function clusterPhotosBySpatialProximity(
  posedPhotos: [string, CameraPoseResult][],
): Promise<PhotoCluster[]> {
  const clusters: PhotoCluster[] = [];
  const CLUSTER_THRESHOLD = 5.0; // meters

  const remaining = [...posedPhotos];

  while (remaining.length > 0) {
    const [seedUrl, seedPose] = remaining.shift()!;
    const cluster: PhotoCluster = {
      clusterId: `cluster-${clusters.length}`,
      photos: [seedUrl],
      centroid: [...seedPose.position],
      averageDepth: 0,
    };

    // Find all photos within threshold
    for (let i = remaining.length - 1; i >= 0; i--) {
      const [url, pose] = remaining[i];
      const distance = Math.sqrt(
        Math.pow(pose.position[0] - seedPose.position[0], 2) +
          Math.pow(pose.position[1] - seedPose.position[1], 2) +
          Math.pow(pose.position[2] - seedPose.position[2], 2),
      );

      if (distance < CLUSTER_THRESHOLD) {
        cluster.photos.push(url);
        remaining.splice(i, 1);

        // Update centroid
        cluster.centroid[0] =
          (cluster.centroid[0] * (cluster.photos.length - 1) +
            pose.position[0]) /
          cluster.photos.length;
        cluster.centroid[1] =
          (cluster.centroid[1] * (cluster.photos.length - 1) +
            pose.position[1]) /
          cluster.photos.length;
        cluster.centroid[2] =
          (cluster.centroid[2] * (cluster.photos.length - 1) +
            pose.position[2]) /
          cluster.photos.length;
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

/**
 * Calculate scene bounds from camera poses
 */
function calculateSceneBounds(cameraPoses: Map<string, CameraPoseResult>): {
  min: [number, number, number];
  max: [number, number, number];
} {
  const positions = Array.from(cameraPoses.values()).map((p) => p.position);

  if (positions.length === 0) {
    return {
      min: [-10, -10, -10],
      max: [10, 10, 10],
    };
  }

  const min: [number, number, number] = [
    Math.min(...positions.map((p) => p[0])),
    Math.min(...positions.map((p) => p[1])),
    Math.min(...positions.map((p) => p[2])),
  ];

  const max: [number, number, number] = [
    Math.max(...positions.map((p) => p[0])),
    Math.max(...positions.map((p) => p[1])),
    Math.max(...positions.map((p) => p[2])),
  ];

  return { min, max };
}

/**
 * Convert depth map to 3D mesh data
 */
export function depthMapToMesh(
  depthMap: ImageData,
  resolution: number = 32,
): {
  vertices: Float32Array;
  indices: Uint32Array;
  uvs: Float32Array;
} {
  const width = depthMap.width;
  const height = depthMap.height;
  const stepX = Math.floor(width / resolution);
  const stepY = Math.floor(height / resolution);

  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Generate vertices
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const px = x * stepX;
      const py = y * stepY;
      const idx = (py * width + px) * 4;

      // Get depth value (assuming grayscale depth map)
      const depth = depthMap.data[idx] / 255.0;

      // Normalize to [-1, 1] range
      const xNorm = (x / resolution) * 2 - 1;
      const yNorm = (y / resolution) * 2 - 1;
      const zNorm = depth * 2 - 1; // Depth displacement

      vertices.push(xNorm, yNorm, zNorm);
      uvs.push(x / resolution, 1 - y / resolution);
    }
  }

  // Generate indices for triangles
  for (let y = 0; y < resolution - 1; y++) {
    for (let x = 0; x < resolution - 1; x++) {
      const topLeft = y * resolution + x;
      const topRight = topLeft + 1;
      const bottomLeft = topLeft + resolution;
      const bottomRight = bottomLeft + 1;

      // First triangle
      indices.push(topLeft, bottomLeft, topRight);
      // Second triangle
      indices.push(topRight, bottomLeft, bottomRight);
    }
  }

  return {
    vertices: new Float32Array(vertices),
    indices: new Uint32Array(indices),
    uvs: new Float32Array(uvs),
  };
}

/**
 * Check if depth map generation should be skipped
 */
export function shouldGenerateDepthMap(): boolean {
  return true;
}
