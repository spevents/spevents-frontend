// spevents-frontend/src/services/api.ts

import { auth } from "../components/config/firebase";
// import { User } from "firebase/auth";

// Use your current deployment URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

// ===============================
// TYPES & INTERFACES
// ===============================

interface CreateEventData {
  name: string;
  description: string;
}

interface Event {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  hostEmail: string;
  status: string;
  photoCount: number;
  sessionCode: string;
}

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
// AUTH HELPERS
// ===============================

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  return await user.getIdToken();
}

async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = await getAuthToken();

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

// ===============================
// EVENT MANAGEMENT
// ===============================

export async function createEvent(eventData: CreateEventData): Promise<Event> {
  const response = await authenticatedFetch(`${BACKEND_URL}/api/events`, {
    method: "POST",
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || `Failed to create event: ${response.status}`,
    );
  }

  return response.json();
}

export async function getUserEvents(): Promise<Event[]> {
  const response = await authenticatedFetch(`${BACKEND_URL}/api/events`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || `Failed to get events: ${response.status}`,
    );
  }

  return response.json();
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

export async function getEventPhotos(eventId: string) {
  const response = await fetch(`${BACKEND_URL}/api/upload?eventId=${eventId}`);

  if (!response.ok) {
    throw new Error(`Failed to get photos: ${response.status}`);
  }

  return response.json();
}

export async function listAllEventPhotos(
  eventId: string,
): Promise<EventPhoto[]> {
  try {
    const response = await getEventPhotos(eventId);
    return response.photos || [];
  } catch (error) {
    console.error("Error listing event photos:", error);
    return [];
  }
}

// ===============================
// PHOTO URL GENERATION
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

export async function deleteMultipleFiles(
  eventId: string,
  fileNames: string[],
  guestId?: string,
): Promise<void> {
  // Note: This would need backend implementation
  console.log("Delete function not yet implemented on backend", {
    eventId,
    fileNames,
    guestId,
  });
}

// ===============================
// TEMP PHOTO STORAGE (LOCAL)
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
// EVENT SERVICE OBJECT
// ===============================

export const eventService = {
  createEvent,
  getUserEvents,

  async getEventBySessionCode(sessionCode: string): Promise<Event | null> {
    // This would need backend implementation
    console.log("getEventBySessionCode not yet implemented", sessionCode);
    return null;
  },

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event> {
    // This would need backend implementation
    console.log("updateEvent not yet implemented", eventId, updates);
    throw new Error("updateEvent not implemented");
  },

  async deleteEvent(eventId: string): Promise<void> {
    // This would need backend implementation
    console.log("deleteEvent not yet implemented", eventId);
    throw new Error("deleteEvent not implemented");
  },
};
