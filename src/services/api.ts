// src/services/api.ts
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

interface Photo {
  id: number;
  url: string;
}

interface CreateEventData {
  name: string;
  description?: string;
}

interface Event {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  hostEmail: string;
  status: "draft" | "active" | "ended";
  photoCount: number;
  sessionCode?: string;
}

interface EventPhoto {
  fileName: string;
  fullKey: string;
  isGuestPhoto: boolean;
  guestId?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    // Demo mode - return mock data
    if (this.isDemo()) {
      return this.getMockResponse(endpoint, options) as T;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  }

  private getMockResponse(endpoint: string, _options: RequestInit): any {
    // Mock responses for demo mode
    if (endpoint.includes("/api/photos/")) {
      return [];
    }
    if (endpoint.includes("/api/events")) {
      return [];
    }
    return {};
  }

  // Photo operations
  async getPresignedUrl(params: {
    eventId: string;
    fileName: string;
    contentType: string;
    isGuestPhoto?: boolean;
  }) {
    return this.request<string>("/api/photos/upload-url", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async getSignedPhotoUrl(eventId: string, fileName: string, guestId?: string) {
    if (this.isDemo()) {
      return `demo://${fileName}`;
    }
    return this.request<string>("/api/photos/signed-url", {
      method: "POST",
      body: JSON.stringify({ eventId, fileName, guestId }),
    });
  }

  getPhotoUrl(eventId: string, fileName: string, guestId?: string): string {
    if (this.isDemo()) {
      return `demo://${fileName}`;
    }
    const base = "https://d3boq06xf0z9b1.cloudfront.net";
    const path = guestId
      ? `events/${eventId}/guests/${guestId}/${fileName}`
      : `events/${eventId}/photos/${fileName}`;
    return `${base}/${path}`;
  }

  getEventPhotoUrl(eventId: string, photo: EventPhoto): string {
    if (this.isDemo()) {
      return `demo://${photo.fileName}`;
    }
    return this.getPhotoUrl(eventId, photo.fileName, photo.guestId);
  }

  async listPhotos(eventId: string): Promise<string[]> {
    return this.request<string[]>(`/api/photos/${eventId}`);
  }

  async listAllEventPhotos(eventId: string): Promise<EventPhoto[]> {
    return this.request<EventPhoto[]>(`/api/photos/${eventId}/all`);
  }

  async deleteMultipleFiles(
    eventId: string,
    fileNames: string[],
    guestId?: string,
  ) {
    return this.request<void>("/api/photos/delete", {
      method: "DELETE",
      body: JSON.stringify({ eventId, fileNames, guestId }),
    });
  }

  // Event operations
  async createEvent(data: CreateEventData) {
    return this.request<Event>("/api/events", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getUserEvents() {
    return this.request<Event[]>("/api/events");
  }

  async getEventBySessionCode(sessionCode: string) {
    return this.request<Event | null>(`/api/events/session/${sessionCode}`);
  }

  async updateEvent(eventId: string, updates: Partial<Event>) {
    return this.request<Event>(`/api/events/${eventId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  async deleteEvent(eventId: string) {
    return this.request<void>(`/api/events/${eventId}`, {
      method: "DELETE",
    });
  }

  // Demo mode helpers
  isDemo(): boolean {
    return import.meta.env.VITE_DEMO_MODE === "true";
  }

  // Guest ID management
  getGuestId(): string {
    let guestId = localStorage.getItem("spevents-guest-id");
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("spevents-guest-id", guestId);
    }
    return guestId;
  }

  // Local storage helpers
  storeTempPhotos(eventId: string, photos: Photo[]) {
    const key = `temp-photos-${eventId}`;
    sessionStorage.setItem(key, JSON.stringify(photos));
  }

  getTempPhotos(eventId: string): Photo[] {
    const key = `temp-photos-${eventId}`;
    return JSON.parse(sessionStorage.getItem(key) || "[]");
  }

  storeUploadedPhoto(eventId: string, fileName: string, isGuestPhoto = false) {
    const guestId = isGuestPhoto ? this.getGuestId() : undefined;
    const key = `uploaded-photos-${eventId}`;
    const storedPhotos = JSON.parse(localStorage.getItem(key) || "[]");

    storedPhotos.push({
      name: fileName,
      url: this.getPhotoUrl(eventId, fileName, guestId),
      created_at: new Date().toISOString(),
      guestId: isGuestPhoto ? guestId : undefined,
    });

    localStorage.setItem(key, JSON.stringify(storedPhotos));
  }
}

export const apiService = new ApiService();

// Export individual functions for easier migration
export const {
  getPresignedUrl,
  getSignedPhotoUrl,
  getPhotoUrl,
  getEventPhotoUrl,
  listPhotos,
  listAllEventPhotos,
  deleteMultipleFiles,
  storeTempPhotos,
  getTempPhotos,
  storeUploadedPhoto,
  getGuestId,
} = apiService;

// Event service compatibility
export const eventService = {
  createEvent: apiService.createEvent.bind(apiService),
  getUserEvents: apiService.getUserEvents.bind(apiService),
  getEventBySessionCode: apiService.getEventBySessionCode.bind(apiService),
  updateEvent: apiService.updateEvent.bind(apiService),
  deleteEvent: apiService.deleteEvent.bind(apiService),
};

export type { EventPhoto };
