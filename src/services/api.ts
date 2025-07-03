//  src/services/api.ts

import { auth } from "./auth";

// Use your current deployment URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

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
