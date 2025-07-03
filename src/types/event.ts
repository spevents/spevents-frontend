// spevents-frontend/src/types/event.ts

export interface Event {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  hostEmail: string;
  status: string;
  photoCount: number;
  sessionCode: string;
  eventId: string;
  timestamp: number;
}

export interface CreateEventData {
  name: string;
  description?: string;
}
