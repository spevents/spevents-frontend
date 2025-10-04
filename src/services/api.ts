// src/services/api.ts

import { auth, db } from "@/components/config/firebase";
import { collection, query, where, limit, getDocs } from "firebase/firestore";

const BACKEND_URL = "https://api.spevents.live";

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
  url: string;
  uploadedAt?: string;
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
  options: RequestInit = {}
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
  try {
    const response = await makeAuthenticatedRequest("/api/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });

    return response.json();
  } catch (error) {
    console.error("Create event error:", error);
    throw error;
  }
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
    `/api/events?eventId=${eventId}`
  );
  return response.json();
}

export async function updateEvent(
  eventId: string,
  updates: Partial<Event>
): Promise<Event> {
  const response = await makeAuthenticatedRequest(
    `/api/events?eventId=${eventId}`,
    {
      method: "PUT",
      body: JSON.stringify(updates),
    }
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
  sessionCode,
}: {
  eventId?: string;
  fileName: string;
  contentType: string;
  isGuestPhoto?: boolean;
  guestId?: string;
  sessionCode?: string;
}): Promise<string> {
  // Return a marker - actual upload happens in uploadPhoto()
  return JSON.stringify({
    eventId,
    fileName,
    contentType,
    isGuestPhoto,
    guestId,
    sessionCode,
  });
}

// export async function getPresignedUrl({
//   eventId,
//   fileName,
//   contentType,
//   isGuestPhoto = false,
//   guestId,
//   sessionCode,
// }: {
//   eventId?: string;
//   fileName: string;
//   contentType: string;
//   isGuestPhoto?: boolean;
//   guestId?: string;
//   sessionCode?: string;
// }): Promise<string> {
//   try {
//     console.log(`🔗 Requesting presigned URL:`, {
//       eventId,
//       fileName,
//       contentType,
//       isGuestPhoto,
//       guestId,
//       sessionCode,
//     });

//     const response = await fetch(`${BACKEND_URL}/api/upload`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Accept: "application/json",
//       },
//       body: JSON.stringify({
//         eventId,
//         fileName,
//         contentType,
//         isGuestPhoto,
//         guestId,
//         sessionCode,
//       }),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error(`❌ Presigned URL request failed:`, {
//         status: response.status,
//         statusText: response.statusText,
//         errorText,
//       });
//       throw new Error(
//         `Failed to get presigned URL: ${response.status} - ${errorText}`
//       );
//     }

//     const { signedUrl } = await response.json();
//     console.log(`✅ Got presigned URL successfully`);
//     return signedUrl;
//   } catch (error) {
//     console.error(`❌ Error getting presigned URL:`, error);
//     throw error;
//   }
// }

// export async function uploadPhoto({
//   presignedUrl,
//   file,
//   onProgress,
// }: {
//   presignedUrl: string;
//   file: File;
//   onProgress?: (progress: number) => void;
// }): Promise<void> {
//   return new Promise((resolve, reject) => {
//     const xhr = new XMLHttpRequest();

//     xhr.upload.onprogress = (event) => {
//       if (event.lengthComputable && onProgress) {
//         const progress = (event.loaded / event.total) * 100;
//         onProgress(progress);
//       }
//     };

//     xhr.onload = () => {
//       if (xhr.status === 200) {
//         resolve();
//       } else {
//         reject(new Error(`Upload failed with status: ${xhr.status}`));
//       }
//     };

//     xhr.onerror = () => {
//       reject(new Error("Upload failed"));
//     };

//     xhr.open("PUT", presignedUrl);
//     xhr.setRequestHeader("Content-Type", file.type);
//     xhr.send(file);
//   });
// }

// ===============================
// 2. UPDATE uploadPhoto() → now uploads directly to blob
// ===============================
export async function uploadPhoto({
  presignedUrl,
  file,
  onProgress,
}: {
  presignedUrl: string;
  file: File;
  onProgress?: (progress: number) => void;
}): Promise<void> {
  try {
    const uploadParams = JSON.parse(presignedUrl);

    console.log(`🚀 Uploading to Vercel Blob:`, uploadParams);

    // Convert file to base64
    const fileData = await fileToBase64(file);

    // Upload directly to blob endpoint
    const response = await fetch(`${BACKEND_URL}/api/upload-blob`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        ...uploadParams,
        fileData,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    if (onProgress) onProgress(100);
    console.log("✅ Upload successful");
  } catch (error) {
    console.error(`❌ Upload error:`, error);
    throw error;
  }
}

// export async function getEventPhotos(eventId: string): Promise<EventPhoto[]> {
//   try {
//     // Fixed: Use the correct backend endpoint
//     const response = await makeAuthenticatedRequest(
//       `/api/photos/${eventId}/all`
//     );
//     const data = await response.json();
//     return Array.isArray(data) ? data : data.photos || [];
//   } catch (error) {
//     console.error("Get photos error:", error);
//     return [];
//   }
// }

export async function getEventPhotos(eventId: string): Promise<EventPhoto[]> {
  try {
    const response = await makeAuthenticatedRequest(
      `/api/upload-blob?eventId=${eventId}`
    );
    const data = await response.json();
    return Array.isArray(data) ? data : data.photos || [];
  } catch (error) {
    console.error("Get photos error:", error);
    return [];
  }
}

export async function listAllEventPhotos(
  eventId: string
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
  guestId?: string
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

export function getSignedPhotoUrl(eventId: string, fileName: string): string {
  const cloudFrontUrl =
    import.meta.env.VITE_CLOUDFRONT_URL || "https://your-cloudfront-url";
  return `${cloudFrontUrl}/events/${eventId}/photos/${fileName}`;
}

export function getEventPhotoUrl(
  eventId: string,
  photo: EventPhoto | string
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
    try {
      console.log(`🔍 Direct Firestore lookup for sessionCode: ${sessionCode}`);

      const q = query(
        collection(db, "events"),
        where("sessionCode", "==", sessionCode.toUpperCase()),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log(`❌ No event found for sessionCode: ${sessionCode}`);
        return null;
      }

      const doc = snapshot.docs[0];
      const event = { id: doc.id, ...doc.data() } as Event;

      console.log(
        `✅ Found event: ${event.id} for sessionCode: ${sessionCode}`
      );
      return event;
    } catch (error) {
      console.error("Error getting event by session code:", error);
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
    sessionCode?: string
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
        }
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
    file: File
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
          `Failed to get presigned URL: ${response.status} - ${errorText}`
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
          `S3 upload failed: ${uploadResponse.status} - ${errorText}`
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
  isGuest: boolean
): void => {
  try {
    const uploaded = JSON.parse(
      localStorage.getItem(`uploaded_photos_${eventId}`) || "[]"
    );
    uploaded.push({
      fileName,
      isGuest,
      uploadedAt: new Date().toISOString(),
    });
    localStorage.setItem(
      `uploaded_photos_${eventId}`,
      JSON.stringify(uploaded)
    );
  } catch (error) {
    console.error("Error storing uploaded photo info:", error);
  }
};

export const getUploadedPhotos = (
  eventId: string
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

// Helper: Convert File to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
