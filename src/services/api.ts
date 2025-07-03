// src/services/api.ts

const BACKEND_URL = "https://api.spevents.live";

// ===============================
// TYPES & INTERFACES
// ===============================

interface CreateEventData {
  name: string;
  description?: string;
}

// Import Event type from the existing types file
import { Event } from "../types/event";

export interface EventPhoto {
  fileName: string;
  fullKey: string;
  isGuestPhoto: boolean;
  guestId?: string;
  url: string;
}

interface Photo {
  id: string;
  url: string;
  eventId: string;
  timestamp: number;
}

// ===============================
// EVENT MANAGEMENT
// ===============================

export async function createEvent(eventData: CreateEventData): Promise<Event> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));
      throw new Error(
        error.message || `Failed to create event: ${response.status}`,
      );
    }

    return response.json();
  } catch (error) {
    console.error("Create event error:", error);
    throw error;
  }
}

export async function getUserEvents(): Promise<Event[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/events`);

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));
      throw new Error(
        error.message || `Failed to get events: ${response.status}`,
      );
    }

    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error("Get events error:", error);
    throw error;
  }
}

export async function getEvent(eventId: string): Promise<Event> {
  const response = await fetch(`${BACKEND_URL}/api/events?eventId=${eventId}`);

  if (!response.ok) {
    throw new Error(`Failed to get event: ${response.status}`);
  }

  return response.json();
}

export async function updateEvent(
  eventId: string,
  updates: Partial<Event>,
): Promise<Event> {
  const response = await fetch(`${BACKEND_URL}/api/events`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId, ...updates }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update event: ${response.status}`);
  }

  return response.json();
}

export async function deleteEvent(eventId: string): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/events`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete event: ${response.status}`);
  }
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
}: {
  eventId: string;
  fileName: string;
  contentType: string;
  isGuestPhoto?: boolean;
  guestId?: string;
}): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/api/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventId,
      fileName,
      contentType,
      isGuestPhoto,
      guestId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get presigned URL: ${response.status}`);
  }

  const { signedUrl } = await response.json();
  return signedUrl;
}

export async function uploadPhoto({
  presignedUrl,
  file,
  onProgress,
}: {
  presignedUrl: string;
  file: File;
  onProgress?: (progress: number) => void;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status: ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Upload failed"));
    };

    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

export async function getEventPhotos(eventId: string): Promise<EventPhoto[]> {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/upload?eventId=${eventId}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to get photos: ${response.status}`);
    }

    const data = await response.json();
    return data.photos || [];
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

export async function deleteMultipleFiles(
  eventId: string,
  fileNames: string[],
  guestId?: string,
): Promise<void> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/upload`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, fileNames, guestId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete files: ${response.status}`);
    }
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
  async getEventBySessionCode(sessionCode: string): Promise<Event | null> {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/events/session/${sessionCode}`,
      );
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (error) {
      console.error("Error getting event by session code:", error);
      return null;
    }
  },

  async getUserEvents(): Promise<Event[]> {
    return getUserEvents();
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
