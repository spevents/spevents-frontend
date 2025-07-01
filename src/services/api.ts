// src/services/api.ts

const BACKEND_URL =
  "https://spevents-backend-hhr6yiea4-fbablus-projects.vercel.app";

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

// Event photo interfaces
export interface EventPhoto {
  fileName: string;
  fullKey: string;
  isGuestPhoto: boolean;
  guestId?: string;
  url: string;
}

export async function listAllEventPhotos(
  eventId: string
): Promise<EventPhoto[]> {
  try {
    const response = await getEventPhotos(eventId);
    return response.photos || [];
  } catch (error) {
    console.error("Error listing event photos:", error);
    return [];
  }
}

// Legacy functions for backward compatibility
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

  // If it's an EventPhoto object, use the fullKey for the complete path
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

// Delete function (Note: This would need backend implementation)
export async function deleteMultipleFiles(
  eventId: string,
  fileNames: string[],
  guestId?: string
): Promise<void> {
  // For now, just log - you'll need to implement the delete endpoint in your backend
  console.log("Delete files:", { eventId, fileNames, guestId });

  // TODO: Implement backend delete endpoint
  // const response = await fetch(`${BACKEND_URL}/api/upload`, {
  //   method: "DELETE",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ eventId, fileNames, guestId }),
  // });

  // if (!response.ok) {
  //   throw new Error(`Failed to delete files: ${response.status}`);
  // }
}

// ===============================
// EVENT MANAGEMENT
// ===============================

interface Event {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  hostEmail: string;
  status: "draft" | "active" | "ended";
  photoCount: number;
  sessionCode: string;
}

interface CreateEventData {
  name: string;
  description?: string;
}

export async function createEvent(eventData: CreateEventData) {
  const response = await fetch(`${BACKEND_URL}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create event: ${response.status}`);
  }

  return response.json();
}

export async function getEvent(eventId: string) {
  const response = await fetch(`${BACKEND_URL}/api/events?eventId=${eventId}`);

  if (!response.ok) {
    throw new Error(`Failed to get event: ${response.status}`);
  }

  return response.json();
}

export async function updateEvent(eventId: string, updates: any) {
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

// Event service object for contexts
export const eventService = {
  async getEventBySessionCode(sessionCode: string): Promise<Event | null> {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/events?sessionCode=${sessionCode}`
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
    try {
      const response = await fetch(`${BACKEND_URL}/api/events`);
      if (!response.ok) {
        throw new Error(`Failed to get user events: ${response.status}`);
      }
      const data = await response.json();
      return data.events || [];
    } catch (error) {
      console.error("Error getting user events:", error);
      return [];
    }
  },

  async createEvent(data: CreateEventData): Promise<Event> {
    return createEvent(data);
  },

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event> {
    return updateEvent(eventId, updates);
  },

  async deleteEvent(eventId: string): Promise<void> {
    const response = await fetch(`${BACKEND_URL}/api/events`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete event: ${response.status}`);
    }
  },
};

// ===============================
// LOCAL STORAGE FUNCTIONS
// ===============================
// These handle temp photos during review process and don't need backend

interface Photo {
  id: number;
  url: string;
}

// Temp Photos (used during camera/review workflow)
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

// Uploaded Photos tracking (local record of what's been uploaded)
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
