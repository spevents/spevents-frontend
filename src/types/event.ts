// src/types/event.ts
export interface Event {
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

export interface CreateEventData {
  name: string;
  description?: string;
}
