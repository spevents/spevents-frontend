// src/contexts/EventContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { eventService } from "../services/api";
import { auth } from "../components/config/firebase";
import { onAuthStateChanged } from "firebase/auth";

// ===============================
// TYPES & INTERFACES
// ===============================

export interface Event {
  id: string;
  eventId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  hostEmail: string;
  status: "draft" | "active" | "paused" | "ended";
  photoCount: number;
  guestCount: number;
  sessionCode: string;
  timestamp: number;
}

export interface CreateEventData {
  name: string;
  description?: string;
}

interface EventContextType {
  events: Event[];
  currentEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  loadEvents: () => Promise<void>;
  createEvent: (data: CreateEventData) => Promise<Event>;
  selectEvent: (eventId: string) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  startEvent: (eventId: string) => Promise<void>;
  endEvent: (eventId: string) => Promise<void>;
  isAuthenticated: boolean;
}

// ===============================
// CONTEXT CREATION
// ===============================

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEventContext must be used within an EventProvider");
  }
  return context;
};

// Legacy alias for backwards compatibility
export const useEvent = useEventContext;

// ===============================
// UTILITY FUNCTIONS
// ===============================

const normalizeEvent = (event: any): Event => {
  return {
    id: event.id,
    eventId: event.eventId || event.id,
    name: event.name || "",
    description: event.description || "",
    createdAt: event.createdAt || new Date().toISOString(),
    updatedAt: event.updatedAt || new Date().toISOString(),
    hostEmail: event.hostEmail || "",
    status: event.status || "draft",
    photoCount: event.photoCount || 0,
    guestCount: event.guestCount || 0,
    sessionCode: event.sessionCode || "",
    timestamp: event.timestamp || Date.now(),
  };
};

// ===============================
// EVENT PROVIDER COMPONENT
// ===============================

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (!user) {
        setEvents([]);
        setCurrentEvent(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load events when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    }
  }, [isAuthenticated]);

  // Restore current event from localStorage
  useEffect(() => {
    const savedEventId = localStorage.getItem("spevents-current-event");
    if (savedEventId && events.length > 0) {
      const event = events.find((e) => e.id === savedEventId);
      if (event) {
        setCurrentEvent(event);
      }
    }
  }, [events]);

  const loadEvents = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const apiEvents = await eventService.getEvents();
      const normalizedEvents = apiEvents.map(normalizeEvent);
      setEvents(normalizedEvents);
    } catch (err) {
      console.error("Error loading events:", err);
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const createEvent = useCallback(
    async (data: CreateEventData): Promise<Event> => {
      if (!isAuthenticated) {
        throw new Error("Not authenticated");
      }

      setIsLoading(true);
      setError(null);

      try {
        const eventData = {
          ...data,
          description: data.description || "",
        };

        const apiEvent = await eventService.createEvent(eventData);
        const newEvent = normalizeEvent(apiEvent);
        setEvents((prev) => [newEvent, ...prev]);
        return newEvent;
      } catch (err) {
        console.error("Error creating event:", err);
        setError(err instanceof Error ? err.message : "Failed to create event");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated],
  );

  const selectEvent = useCallback(
    (eventId: string) => {
      const event = events.find((e) => e.id === eventId);
      if (event) {
        setCurrentEvent(event);
        localStorage.setItem("spevents-current-event", eventId);
      }
    },
    [events],
  );

  const updateEvent = useCallback(
    async (eventId: string, updates: Partial<Event>) => {
      if (!isAuthenticated) {
        throw new Error("Not authenticated");
      }

      setError(null);

      try {
        const apiEvent = await eventService.updateEvent(eventId, updates);
        const updatedEvent = normalizeEvent(apiEvent);

        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? updatedEvent : e)),
        );

        if (currentEvent?.id === eventId) {
          setCurrentEvent(updatedEvent);
        }
      } catch (err) {
        console.error("Error updating event:", err);
        setError(err instanceof Error ? err.message : "Failed to update event");
        throw err;
      }
    },
    [isAuthenticated, currentEvent],
  );

  const deleteEvent = useCallback(
    async (eventId: string) => {
      if (!isAuthenticated) {
        throw new Error("Not authenticated");
      }

      setError(null);

      try {
        await eventService.deleteEvent(eventId);
        setEvents((prev) => prev.filter((e) => e.id !== eventId));

        if (currentEvent?.id === eventId) {
          setCurrentEvent(null);
          localStorage.removeItem("spevents-current-event");
        }
      } catch (err) {
        console.error("Error deleting event:", err);
        setError(err instanceof Error ? err.message : "Failed to delete event");
        throw err;
      }
    },
    [isAuthenticated, currentEvent],
  );

  const startEvent = useCallback(
    async (eventId: string) => {
      await updateEvent(eventId, { status: "active" });
    },
    [updateEvent],
  );

  const endEvent = useCallback(
    async (eventId: string) => {
      await updateEvent(eventId, { status: "ended" });
    },
    [updateEvent],
  );

  const contextValue: EventContextType = {
    events,
    currentEvent,
    isLoading,
    error,
    loadEvents,
    createEvent,
    selectEvent,
    updateEvent,
    deleteEvent,
    startEvent,
    endEvent,
    isAuthenticated,
  };

  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
};
