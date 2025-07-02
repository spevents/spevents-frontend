// src/services/api.ts

import { auth } from "./auth";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://spevents-backend-p7dpd136j-fbablus-projects.vercel.app";

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

// Helper function to get auth token
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  return await user.getIdToken();
}

// Helper function to make authenticated requests
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

export async function updateEvent(
  eventId: string,
  updates: Partial<Event>,
): Promise<Event> {
  const response = await authenticatedFetch(
    `${BACKEND_URL}/api/events/${eventId}`,
    {
      method: "PUT",
      body: JSON.stringify(updates),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || `Failed to update event: ${response.status}`,
    );
  }

  return response.json();
}

export async function deleteEvent(eventId: string): Promise<void> {
  const response = await authenticatedFetch(
    `${BACKEND_URL}/api/events/${eventId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || `Failed to delete event: ${response.status}`,
    );
  }
}

export async function getEventBySessionCode(
  sessionCode: string,
): Promise<Event | null> {
  try {
    // This endpoint doesn't require auth since it's for guests
    const response = await fetch(
      `${BACKEND_URL}/api/events/session/${sessionCode}`,
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to get event: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error getting event by session code:", error);
    return null;
  }
}

export async function publishEvent(eventId: string): Promise<Event> {
  const response = await authenticatedFetch(
    `${BACKEND_URL}/api/events/${eventId}/publish`,
    {
      method: "PUT",
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || `Failed to publish event: ${response.status}`,
    );
  }

  return response.json();
}

export async function unpublishEvent(eventId: string): Promise<Event> {
  const response = await authenticatedFetch(
    `${BACKEND_URL}/api/events/${eventId}/unpublish`,
    {
      method: "PUT",
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || `Failed to unpublish event: ${response.status}`,
    );
  }

  return response.json();
}

// Event service object for contexts (backward compatibility)
export const eventService = {
  async getEventBySessionCode(sessionCode: string): Promise<Event | null> {
    return getEventBySessionCode(sessionCode);
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
// S3 PRESIGNED URL FUNCTION
// ===============================

interface PresignedUrlParams {
  eventId: string;
  fileName: string;
  contentType: string;
  isGuestPhoto?: boolean;
}

export async function getPresignedUrl(
  params: PresignedUrlParams,
): Promise<{ uploadUrl: string; photoUrl: string }> {
  const response = await authenticatedFetch(
    `${BACKEND_URL}/api/upload/presigned-url`,
    {
      method: "POST",
      body: JSON.stringify(params),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || `Failed to get presigned URL: ${response.status}`,
    );
  }

  return response.json();
}

// ===============================
// LOCAL STORAGE FUNCTIONS
// ===============================

interface Photo {
  id: number;
  url: string;
}

export const getTempPhotos = (eventId: string): Photo[] => {
  try {
    const stored = localStorage.getItem(`temp_photos_${eventId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveTempPhotos = (eventId: string, photos: Photo[]): void => {
  localStorage.setItem(`temp_photos_${eventId}`, JSON.stringify(photos));
};

export const clearTempPhotos = (eventId: string): void => {
  localStorage.removeItem(`temp_photos_${eventId}`);
};
