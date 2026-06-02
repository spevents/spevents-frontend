// File: src/contexts/EventContext.tsx

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

  // BYPASS_AUTH is only honoured in dev builds.
  // Setting VITE_BYPASS_AUTH=true in a production Vercel deployment will have no effect.
  const BYPASS_AUTH =
    import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH === "true";

  const loadEvents = useCallback(async () => {
    console.log("📂 loadEvents called, BYPASS_AUTH:", BYPASS_AUTH);

    if (BYPASS_AUTH) {
      console.log("🔧 Using mock events for bypass mode");
      setEvents(mockEvents);
      setIsLoading(false);
      return;
    }

    console.log("🔄 Loading events from API...");
    setIsLoading(true);
    setError(null);
    try {
      const userEvents = await eventService.getEvents();
      console.log("✅ Loaded events:", userEvents);
      setEvents(userEvents);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load events";
      console.error("❌ Failed to load events:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [BYPASS_AUTH]);

  const createEvent = useCallback(
    async (data: CreateEventData): Promise<Event> => {
      console.log(
        "🏗️ EventContext.createEvent called with data:",
        JSON.stringify(data, null, 2),
      );
      console.log("🔧 BYPASS_AUTH:", BYPASS_AUTH);

      if (BYPASS_AUTH) {
        console.log("🔧 Using mock event creation for bypass mode");
        const newEvent: Event = {
          id: `mock-${Date.now()}`,
          name: data.name,
          description: data.description || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          hostEmail: "dev@spevents.local",
          status: "draft",
          photoCount: 0,
          sessionCode: Array.from(
            crypto.getRandomValues(new Uint8Array(6)),
            (b) => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[b % 36],
          ).join(""),
          // Include advanced fields if provided
          ...(data.date && { date: data.date }),
          ...(data.startTime && { startTime: data.startTime }),
          ...(data.endTime && { endTime: data.endTime }),
          ...(data.colors && { colors: data.colors }),
          ...(data.theme && { theme: data.theme }),
        };
        console.log("✅ Mock event created:", newEvent);
        setEvents((prev) => [newEvent, ...prev]);
        return newEvent;
      }

      console.log("🌐 Calling eventService.createEvent...");
      setIsLoading(true);
      setError(null);
      try {
        const newEvent = await eventService.createEvent(data);
        console.log("✅ Event created via API:", newEvent);
        setEvents((prev) => [newEvent, ...prev]);
        return newEvent;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create event";
        console.error("❌ Failed to create event:", errorMessage);
        console.error("❌ Error object:", err);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [BYPASS_AUTH],
  );

  const selectEvent = useCallback(
    (eventId: string) => {
      console.log("🎯 selectEvent called with eventId:", eventId);
      const event = events.find((e) => e.id === eventId);
      if (event) {
        console.log("✅ Event found and selected:", event);
        setCurrentEvent(event);
        localStorage.setItem("spevents-current-event", eventId);
      } else {
        console.warn("⚠️ Event not found in events list:", eventId);
        console.log(
          "📋 Available events:",
          events.map((e) => ({ id: e.id, name: e.name })),
        );
      }
    },
    [events],
  );

  const updateEvent = useCallback(
    async (eventId: string, updates: Partial<Event>) => {
      console.log("📝 updateEvent called:", { eventId, updates });

      if (BYPASS_AUTH) {
        console.log("🔧 Using mock event update for bypass mode");
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, ...updates } : e)),
        );
        if (currentEvent?.id === eventId) {
          setCurrentEvent({ ...currentEvent, ...updates });
        }
        return;
      }

      try {
        console.log("🌐 Calling eventService.updateEvent...");
        const updatedEvent = await eventService.updateEvent(eventId, updates);
        console.log("✅ Event updated via API:", updatedEvent);
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? updatedEvent : e)),
        );
        if (currentEvent?.id === eventId) {
          setCurrentEvent(updatedEvent);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update event";
        console.error("❌ Failed to update event:", errorMessage);
        setError(errorMessage);
        throw err;
      }
    },
    [currentEvent, BYPASS_AUTH],
  );

  const deleteEvent = useCallback(
    async (eventId: string) => {
      console.log("🗑️ deleteEvent called with eventId:", eventId);

      if (BYPASS_AUTH) {
        console.log("🔧 Using mock event deletion for bypass mode");
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        if (currentEvent?.id === eventId) {
          setCurrentEvent(null);
          localStorage.removeItem("spevents-current-event");
        }
        return;
      }

      try {
        console.log("🌐 Calling eventService.deleteEvent...");
        await eventService.deleteEvent(eventId);
        console.log("✅ Event deleted via API");
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        if (currentEvent?.id === eventId) {
          setCurrentEvent(null);
          localStorage.removeItem("spevents-current-event");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete event";
        console.error("❌ Failed to delete event:", errorMessage);
        setError(errorMessage);
        throw err;
      }
    },
    [currentEvent, BYPASS_AUTH],
  );

  const startEvent = useCallback(
    async (eventId: string) => {
      console.log("▶️ startEvent called with eventId:", eventId);
      await updateEvent(eventId, { status: "active" });
    },
    [updateEvent],
  );

  const endEvent = useCallback(
    async (eventId: string) => {
      console.log("⏹️ endEvent called with eventId:", eventId);
      await updateEvent(eventId, { status: "ended" });
    },
    [updateEvent],
  );

  // Load events on mount and restore current event
  useEffect(() => {
    console.log("🔄 EventProvider useEffect: loading events on mount");
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (events.length > 0) {
      const savedEventId = localStorage.getItem("spevents-current-event");
      if (savedEventId) {
        console.log(
          "🔄 EventProvider useEffect: restoring saved event:",
          savedEventId,
        );
        const event = events.find((e) => e.id === savedEventId);
        if (event) {
          console.log("✅ Restored saved event:", event);
          setCurrentEvent(event);
        } else {
          console.warn("⚠️ Saved event not found, clearing localStorage");
          localStorage.removeItem("spevents-current-event");
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
