// src/contexts/EventContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Event, CreateEventData } from "../types/event";
import { eventService } from "../lib/eventService";

interface EventContextType {
  events: Event[];
  currentEvent: Event | null;
  isLoading: boolean;
  error: string | null;

  // Event management
  createEvent: (data: CreateEventData) => Promise<Event>;
  selectEvent: (eventId: string) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  loadEvents: () => Promise<void>;

  // Event status
  startEvent: (eventId: string) => Promise<void>;
  endEvent: (eventId: string) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

// Mock data for bypass mode
const mockEvents: Event[] = [
  {
    id: "mock-event-1",
    name: "Mock Event 1",
    description: "Test event for development",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hostEmail: "dev@spevents.local",
    status: "active",
    photoCount: 0,
    sessionCode: "MOCK01",
  },
];

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === "true";

  const loadEvents = useCallback(async () => {
    if (BYPASS_AUTH) {
      setEvents(mockEvents);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const userEvents = await eventService.getUserEvents();
      setEvents(userEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setIsLoading(false);
    }
  }, [BYPASS_AUTH]);

  const createEvent = useCallback(
    async (data: CreateEventData): Promise<Event> => {
      if (BYPASS_AUTH) {
        const newEvent: Event = {
          id: `mock-${Date.now()}`,
          name: data.name,
          description: data.description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          hostEmail: "dev@spevents.local",
          status: "draft",
          photoCount: 0,
          sessionCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        };
        setEvents((prev) => [newEvent, ...prev]);
        return newEvent;
      }

      setIsLoading(true);
      setError(null);
      try {
        const newEvent = await eventService.createEvent(data);
        setEvents((prev) => [newEvent, ...prev]);
        return newEvent;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create event");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [BYPASS_AUTH],
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
      if (BYPASS_AUTH) {
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, ...updates } : e)),
        );
        if (currentEvent?.id === eventId) {
          setCurrentEvent({ ...currentEvent, ...updates });
        }
        return;
      }

      try {
        const updatedEvent = await eventService.updateEvent(eventId, updates);
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? updatedEvent : e)),
        );
        if (currentEvent?.id === eventId) {
          setCurrentEvent(updatedEvent);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update event");
        throw err;
      }
    },
    [currentEvent, BYPASS_AUTH],
  );

  const deleteEvent = useCallback(
    async (eventId: string) => {
      if (BYPASS_AUTH) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        if (currentEvent?.id === eventId) {
          setCurrentEvent(null);
          localStorage.removeItem("spevents-current-event");
        }
        return;
      }

      try {
        await eventService.deleteEvent(eventId);
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        if (currentEvent?.id === eventId) {
          setCurrentEvent(null);
          localStorage.removeItem("spevents-current-event");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete event");
        throw err;
      }
    },
    [currentEvent, BYPASS_AUTH],
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

  // Load events on mount and restore current event
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (events.length > 0) {
      const savedEventId = localStorage.getItem("spevents-current-event");
      if (savedEventId) {
        const event = events.find((e) => e.id === savedEventId);
        if (event) {
          setCurrentEvent(event);
        }
      }
    }
  }, [events]);

  return (
    <EventContext.Provider
      value={{
        events,
        currentEvent,
        isLoading,
        error,
        createEvent,
        selectEvent,
        updateEvent,
        deleteEvent,
        loadEvents,
        startEvent,
        endEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEvent must be used within an EventProvider");
  }
  return context;
}
