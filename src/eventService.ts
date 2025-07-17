// File: src/lib/eventService.ts
// Updated to call your backend API instead of Firebase directly

import { auth } from "./components/config/firebase";
import { Event, CreateEventData } from "./types/event";
import { onAuthStateChanged, User } from "firebase/auth";

export class EventService {
  private currentUser: User | null = null;
  private baseUrl = "https://api.spevents.live";

  constructor() {
    onAuthStateChanged(auth, (user: User | null) => {
      this.currentUser = user;
    });
  }

  private async getAuthToken(): Promise<string> {
    if (!this.currentUser) {
      throw new Error("User not authenticated");
    }
    return await this.currentUser.getIdToken();
  }

  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await this.getAuthToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async createEvent(eventData: CreateEventData): Promise<Event> {
    console.log("🔍 Creating event via API:", eventData);

    return this.apiCall<Event>("/api/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  }

  async getUserEvents(): Promise<Event[]> {
    console.log("🔍 Getting events via API");

    return this.apiCall<Event[]>("/api/events", {
      method: "GET",
    });
  }

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event> {
    console.log("🔍 Updating event via API:", eventId, updates);

    return this.apiCall<Event>(`/api/events?eventId=${eventId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }
}

export const eventService = new EventService();
