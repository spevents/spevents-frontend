// src/services/api.ts

const BACKEND_URL =
  "https://spevents-backend-hhr6yiea4-fbablus-projects.vercel.app";

// Photo Upload Service
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

// Get Event Photos
export async function getEventPhotos(eventId: string) {
  const response = await fetch(`${BACKEND_URL}/api/upload?eventId=${eventId}`);

  if (!response.ok) {
    throw new Error(`Failed to get photos: ${response.status}`);
  }

  return response.json();
}

// Event Management
export async function createEvent(eventData: {
  name: string;
  description?: string;
  date: string;
  hostId: string;
}) {
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
