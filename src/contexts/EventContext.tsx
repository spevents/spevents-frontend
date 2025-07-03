// src/contexts/EventContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Event, CreateEventData } from "../types/event";
// import { eventService } from "../lib/eventService";
import { eventService } from "../services/api";

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
    eventId: "mock-event-1", // Added missing eventId
    name: "Mock Event 1",
    description: "Test event for development",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hostEmail: "dev@spevents.local",
    status: "active",
    photoCount: 0,
    sessionCode: "MOCK01",
    timestamp: Date.now(), // Added missing timestamp
  },
];

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === "true";

  // Helper function to ensure API events match our Event type
  const normalizeEvent = (event: any): Event => {
    return {
      ...event,
      eventId: event.eventId || event.id, // Use eventId if available, fallback to id
      timestamp: event.timestamp || Date.now(), // Use timestamp if available, fallback to current time
      description: event.description || "", // Ensure description is always defined
    };
  };

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
      // Normalize events to match our Event type
      const normalizedEvents = userEvents.map(normalizeEvent);
      setEvents(normalizedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setIsLoading(false);
    }
  }, [BYPASS_AUTH]);

  const createEvent = useCallback(
    async (data: CreateEventData): Promise<Event> => {
      if (BYPASS_AUTH) {
        const eventId = `mock-${Date.now()}`;
        const newEvent: Event = {
          id: eventId,
          eventId: eventId, // Added missing eventId
          name: data.name,
          description: data.description || "", // Ensure description is defined
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          hostEmail: "dev@spevents.local",
          status: "draft",
          photoCount: 0,
          sessionCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          timestamp: Date.now(), // Added missing timestamp
        };
        setEvents((prev) => [newEvent, ...prev]);
        return newEvent;
      }

      setIsLoading(true);
      setError(null);
      try {
        // Ensure description is defined for API call
        const eventData = {
          ...data,
          description: data.description || "",
        };
        const apiEvent = await eventService.createEvent(eventData);
        // Normalize the event returned from API
        const newEvent = normalizeEvent(apiEvent);
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
        const apiEvent = await eventService.updateEvent(eventId, updates);
        // Normalize the updated event
        const updatedEvent = normalizeEvent(apiEvent);
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
