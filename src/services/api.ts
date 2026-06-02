// src/services/api.ts

import { auth } from "@/components/config/firebase";
import { compressForUpload } from "@/lib/imageUtils";
import { upload } from "@vercel/blob/client";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "https://api.spevents.live";

// ===============================
// TYPES & INTERFACES
// ===============================

interface CreateEventData {
  name: string;
  description?: string;
}

import { Event } from "@/types/event";

export interface EventPhoto {
  fileName: string;
  fullKey: string;
  isGuestPhoto: boolean;
  guestId?: string;
  guestName?: string;
  url: string;
  uploadedAt: string;
  depthMap?: string;
  aiCaption: string;
  huntTaskId?: string;
}

interface Photo {
  id: string;
  url: string;
  eventId: string;
  timestamp: number;
}

export interface UploadResponse {
  presignedUrl: string;
  photoKey: string;
  photoUrl: string;
  guestId?: string;
}

// ===============================
// UTILITY FUNCTIONS
// ===============================

/**
 * Get the authorization header with Firebase ID token
 */
const getAuthHeader = async (): Promise<{ Authorization: string } | {}> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
  } catch (error) {
    console.error("Error getting ID token:", error);
    throw new Error("Failed to get authentication token");
  }
};

/**
 * Make authenticated API request
 */
const makeAuthenticatedRequest = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  const authHeader = await getAuthHeader();

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response;
};

// ===============================
// EVENT MANAGEMENT
// ===============================

export async function createEvent(eventData: CreateEventData): Promise<Event> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be logged in");
  }

  const token = await user.getIdToken();
  const response = await fetch(`${BACKEND_URL}/api/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export async function getUserEvents(): Promise<Event[]> {
  try {
    const response = await makeAuthenticatedRequest("/api/events");
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Get user events error:", error);
    return [];
  }
}

export async function getEvent(eventId: string): Promise<Event> {
  const response = await makeAuthenticatedRequest(
    `/api/events?eventId=${eventId}`,
  );
  return response.json();
}

export async function updateEvent(
  eventId: string,
  updates: Partial<Event>,
): Promise<Event> {
  const response = await makeAuthenticatedRequest(
    `/api/events?eventId=${eventId}`,
    {
      method: "PUT",
      body: JSON.stringify(updates),
    },
  );

  return response.json();
}

export async function deleteEvent(eventId: string): Promise<void> {
  await makeAuthenticatedRequest(`/api/events?eventId=${eventId}`, {
    method: "DELETE",
  });
}

// ===============================
// PHOTO UPLOAD & MANAGEMENT
// ===============================
export async function getPresignedUrl({
  eventId,
  fileName,
  contentType,
  isGuestPhoto = false,
  guestId,
  guestName,
  sessionCode,
  huntTaskId,
}: {
  eventId?: string;
  fileName: string;
  contentType: string;
  isGuestPhoto?: boolean;
  guestId?: string;
  guestName?: string;
  sessionCode?: string;
  huntTaskId?: string;
}): Promise<string> {
  // Return a marker - actual upload happens in uploadPhoto()
  return JSON.stringify({
    eventId,
    fileName,
    contentType,
    isGuestPhoto,
    guestId,
    guestName,
    sessionCode,
    huntTaskId,
  });
}

// Photo uploads use Vercel Blob CLIENT uploads: the browser streams the file
// bytes directly to Blob storage; the backend only mints a short-lived, scoped
// token (see api/upload-blob.ts). No base64 inflation, no routing file bytes
// through a serverless function, no 4.5 MB request-body cap, and large files
// upload via parallel multipart automatically.

export async function uploadPhoto({
  presignedUrl,
  file,
  onProgress,
}: {
  presignedUrl: string;
  file: File;
  onProgress?: (progress: number) => void;
}): Promise<{
  photoUrl: string;
  guestId: string;
  fileName: string;
  photoKey: string; // Full path for verification matching
}> {
  // `presignedUrl` is a JSON marker from getPresignedUrl() (kept for a stable
  // call signature) — it carries the upload params, not an actual URL.
  const params = JSON.parse(presignedUrl) as {
    eventId?: string;
    fileName?: string;
    contentType?: string;
    isGuestPhoto?: boolean;
    guestId?: string;
    guestName?: string;
    sessionCode?: string;
    huntTaskId?: string;
  };

  if (onProgress) onProgress(5);

  // Compress first — fewer bytes = faster upload and faster gallery load.
  const compressedFile = await compressForUpload(file);
  console.log(
    `📦 Compressed: ${file.size} -> ${compressedFile.size} bytes (${Math.round(
      (compressedFile.size / file.size) * 100,
    )}%)`,
  );

  const eventId = params.eventId;
  if (!eventId) {
    throw new Error("Missing eventId for upload");
  }

  const isGuest = !!params.isGuestPhoto;

  // Resolve a stable guestId for the path + later verification matching.
  let guestId = params.guestId || "";
  if (isGuest && !guestId) {
    guestId =
      localStorage.getItem("spevents-guest-id") ||
      `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("spevents-guest-id", guestId);
  }

  const safeName = (params.fileName || compressedFile.name || "photo.jpg")
    .replace(/[/\\]/g, "_")
    .replace(/[^\w.\-]/g, "_");

  // Client proposes the path; the backend token route validates it is scoped
  // to this event before issuing a token.
  const pathname = isGuest
    ? `events/${eventId}/guests/${guestId}/${Date.now()}-${safeName}`
    : `events/${eventId}/${Date.now()}-${safeName}`;

  // Hosts authenticate with a Firebase token forwarded to the token route;
  // guests authenticate via the sessionCode carried in clientPayload.
  let headers: Record<string, string> | undefined;
  if (!isGuest) {
    const user = auth.currentUser;
    if (user) {
      try {
        headers = { Authorization: `Bearer ${await user.getIdToken()}` };
      } catch (error) {
        console.error("Failed to get auth token:", error);
      }
    }
  }

  const blob = await upload(pathname, compressedFile, {
    access: "public",
    handleUploadUrl: `${BACKEND_URL}/api/upload-blob`,
    contentType: compressedFile.type || params.contentType || "image/jpeg",
    // Stream large files in parallel chunks with automatic per-part retry.
    multipart: compressedFile.size > 8 * 1024 * 1024,
    clientPayload: JSON.stringify({
      sessionCode: params.sessionCode,
      eventId,
      isGuestPhoto: isGuest,
      guestId: guestId || undefined,
      guestName: params.guestName,
      huntTaskId: params.huntTaskId,
    }),
    ...(headers ? { headers } : {}),
    onUploadProgress: ({ percentage }) => onProgress?.(percentage),
  });

  const fileName = blob.pathname.split("/").pop() || safeName;
  console.log(`✅ Blob client upload complete: ${blob.url}`);

  return {
    photoUrl: blob.url,
    guestId,
    fileName,
    photoKey: blob.pathname,
  };
}

export async function getEventPhotos(eventId: string): Promise<EventPhoto[]> {
  try {
    const endpoint = `/api/upload-blob?eventId=${eventId}`;

    const response = await makeAuthenticatedRequest(endpoint);
    const data = await response.json();
    return Array.isArray(data) ? data : data.photos || [];
  } catch (error) {
    console.error("Get photos error:", error);
    return [];
  }
}

export async function listAllEventPhotos(
  eventId: string,
): Promise<EventPhoto[]> {
  try {
    return await getEventPhotos(eventId);
  } catch (error) {
    console.error("Error listing event photos:", error);
    return [];
  }
}

// ===============================
// UPDATED DELETE FUNCTION
// ===============================

export async function deleteMultipleFiles(
  eventId: string,
  fileNames: string[],
  guestId?: string,
): Promise<void> {
  try {
    console.log(`🗑️ Deleting ${fileNames.length} photos for event ${eventId}`);

    // Use the event-specific endpoint for deleting photos
    await makeAuthenticatedRequest(`/api/photos/${eventId}`, {
      method: "DELETE",
      body: JSON.stringify({
        fileNames,
        guestId,
      }),
    });

    console.log(`✅ Successfully deleted ${fileNames.length} photos`);
  } catch (error) {
    console.error("Delete files error:", error);
    throw error;
  }
}

// ===============================
// PHOTO URL HELPERS
// ===============================

export function getPhotoUrl(eventId: string, fileName: string): string {
  const cloudFrontUrl =
    import.meta.env.VITE_CLOUDFRONT_URL || "https://your-cloudfront-url";
  return `${cloudFrontUrl}/events/${eventId}/photos/${fileName}`;
}

/** @deprecated Use getPhotoUrl — both functions are identical. */
export function getSignedPhotoUrl(eventId: string, fileName: string): string {
  return getPhotoUrl(eventId, fileName);
}

export function getEventPhotoUrl(
  eventId: string,
  photo: EventPhoto | string,
): string {
  const cloudFrontUrl =
    import.meta.env.VITE_CLOUDFRONT_URL || "https://your-cloudfront-url";

  if (typeof photo === "string") {
    return `${cloudFrontUrl}/events/${eventId}/photos/${photo}`;
  }

  return `${cloudFrontUrl}/${photo.fullKey}`;
}

export async function listPhotos(eventId: string): Promise<string[]> {
  try {
    const photos = await listAllEventPhotos(eventId);
    return photos.map((photo) => photo.fileName);
  } catch (error) {
    console.error("Error listing photos:", error);
    return [];
  }
}

// ===============================
// EVENT SERVICE OBJECT
// ===============================

export const eventService = {
  async getEvents(): Promise<Event[]> {
    return getUserEvents();
  },

  async getEvent(eventId: string): Promise<Event> {
    return getEvent(eventId);
  },

  async getEventBySessionCode(sessionCode: string): Promise<Event | null> {
    // Delegate to the backend API — avoids direct Firestore access from the
    // browser and ensures backend validation (active-only filter) always applies.
    try {
      return await guestService.getEventBySessionCode(sessionCode);
    } catch {
      return null;
    }
  },

  async createEvent(data: CreateEventData): Promise<Event> {
    return createEvent(data);
  },

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event> {
    return updateEvent(eventId, updates);
  },

  async deleteEvent(eventId: string): Promise<void> {
    return deleteEvent(eventId);
  },
};

// ===============================
// PHOTO SERVICE
// ===============================

export const photoService = {
  async getEventPhotos(eventId: string): Promise<EventPhoto[]> {
    return getEventPhotos(eventId);
  },

  async getUploadUrl(
    eventId: string,
    fileName: string,
    sessionCode?: string,
  ): Promise<UploadResponse> {
    const params = new URLSearchParams({
      eventId,
      fileName,
      ...(sessionCode && { sessionCode }),
    });

    const response = await makeAuthenticatedRequest(`/api/photos?${params}`, {
      method: "POST",
    });
    return response.json();
  },

  async deletePhotos(eventId: string, photoKeys: string[]): Promise<void> {
    console.log(`🗑️ Deleting ${photoKeys.length} photos for event: ${eventId}`);
    console.log("🔑 Photo keys being sent:", photoKeys); // ADD THIS LINE

    await makeAuthenticatedRequest(`/api/photos/${eventId}`, {
      method: "DELETE",
      body: JSON.stringify({ fullKeys: photoKeys }),
    });
  },
};

// ===============================
// GUEST SERVICE (Public API)
// ===============================

export const guestService = {
  async getEventBySessionCode(sessionCode: string): Promise<Event> {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/guest/event?sessionCode=${sessionCode}`,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching event by session code:", error);
      throw error;
    }
  },

  async uploadGuestPhoto(
    eventId: string,
    sessionCode: string,
    file: File,
  ): Promise<string> {
    try {
      console.log(`🚀 Starting guest photo upload:`, {
        eventId,
        sessionCode,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      // Generate unique filename
      const timestamp = Date.now();
      const uniqueFileName = `guest-${timestamp}-${file.name}`;

      // Get presigned URL using the unified endpoint
      const response = await fetch(`${BACKEND_URL}/api/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sessionCode,
          fileName: uniqueFileName,
          contentType: file.type,
          isGuestPhoto: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Failed to get presigned URL:`, {
          status: response.status,
          statusText: response.statusText,
          errorText,
        });
        throw new Error(
          `Failed to get presigned URL: ${response.status} - ${errorText}`,
        );
      }

      const { signedUrl, photoUrl } = await response.json();
      console.log(`✅ Got presigned URL, uploading to S3...`);

      // Upload to S3
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error(`❌ S3 upload failed:`, {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          errorText,
        });
        throw new Error(
          `S3 upload failed: ${uploadResponse.status} - ${errorText}`,
        );
      }

      console.log(`✅ Guest photo uploaded successfully:`, photoUrl);
      return photoUrl;
    } catch (error) {
      console.error(`❌ Guest photo upload error:`, error);
      throw error;
    }
  },
};

// ===============================
// LOCAL STORAGE FUNCTIONS
// ===============================

export const getTempPhotos = (eventId: string): Photo[] => {
  try {
    const stored = localStorage.getItem(`temp_photos_${eventId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error getting temp photos:", error);
    return [];
  }
};

export const storeTempPhotos = (eventId: string, photos: Photo[]): void => {
  try {
    localStorage.setItem(`temp_photos_${eventId}`, JSON.stringify(photos));
  } catch (error) {
    console.error("Error storing temp photos:", error);
  }
};

export const storeUploadedPhoto = (
  eventId: string,
  fileName: string,
  isGuest: boolean,
): void => {
  try {
    const uploaded = JSON.parse(
      localStorage.getItem(`uploaded_photos_${eventId}`) || "[]",
    );
    uploaded.push({
      fileName,
      isGuest,
      uploadedAt: new Date().toISOString(),
    });
    localStorage.setItem(
      `uploaded_photos_${eventId}`,
      JSON.stringify(uploaded),
    );
  } catch (error) {
    console.error("Error storing uploaded photo info:", error);
  }
};

export const getUploadedPhotos = (
  eventId: string,
): Array<{ fileName: string; isGuest: boolean; uploadedAt: string }> => {
  try {
    const stored = localStorage.getItem(`uploaded_photos_${eventId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error getting uploaded photos:", error);
    return [];
  }
};

// ===============================
// CONNECTION TEST
// ===============================

export async function testConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error("Backend connection test failed:", error);
    return false;
  }
}

