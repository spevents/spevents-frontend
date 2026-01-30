// src/contexts/SessionContext.tsx

import React, { createContext, useContext, useState, useCallback } from "react";
import { guestService } from "@/services/api";
import { Event } from "@/types/event";

interface SessionContextType {
  sessionCode: string | null;
  generateSessionCode: () => void;
  setCustomSessionCode: (code: string) => void;
  isValidSession: (code: string) => Promise<boolean>;
  setIsHost: (isHost: boolean) => void;
  isHost: boolean;

  // Event management for guests
  currentEvent: Event | null;
  setCurrentEvent: (event: Event | null) => void;
  refreshCurrentEvent: () => Promise<void>;

  // Guest identity - persists across page reloads
  guestName: string | null;
  guestId: string | null;
  setGuestIdentity: (name: string) => void;
  clearGuestIdentity: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionCode, setSessionCode] = useState<string | null>(() =>
    localStorage.getItem("spevents-session"),
  );
  const [isHost, setIsHost] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);

  // Guest identity state - loaded from localStorage on mount
  const [guestName, setGuestName] = useState<string | null>(() =>
    localStorage.getItem("spevents-guest-name"),
  );
  const [guestId, setGuestId] = useState<string | null>(() =>
    localStorage.getItem("spevents-guest-id"),
  );

  // Set guest identity (name) and generate a persistent guestId
  const setGuestIdentity = useCallback((name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    // Use existing guestId or generate a new one
    let id = localStorage.getItem("spevents-guest-id");
    if (!id) {
      id = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem("spevents-guest-id", id);
    }

    localStorage.setItem("spevents-guest-name", trimmedName);
    setGuestName(trimmedName);
    setGuestId(id);
  }, []);

  // Clear guest identity (for logout)
  const clearGuestIdentity = useCallback(() => {
    localStorage.removeItem("spevents-guest-name");
    localStorage.removeItem("spevents-guest-id");
    setGuestName(null);
    setGuestId(null);
  }, []);

  const generateSessionCode = useCallback(() => {
    const code = Math.random().toString(36).substring(2, 8);
    setSessionCode(code);
    localStorage.setItem("spevents-session", code);
  }, []);

  const setCustomSessionCode = useCallback((code: string) => {
    setSessionCode(code);
    localStorage.setItem("spevents-session", code);
  }, []);

  const isValidSession = useCallback(
    async (sessionCode: string): Promise<boolean> => {
      try {
        const event = await guestService.getEventBySessionCode(sessionCode);
        return event !== null;
      } catch (error) {
        console.error("Error in isValidSession:", error);
        return false;
      }
    },
    [],
  );

  // Refresh current event data (for polling verification status etc.)
  const refreshCurrentEvent = useCallback(async () => {
    if (!sessionCode) return;
    try {
      const event = await guestService.getEventBySessionCode(sessionCode);
      if (event) {
        setCurrentEvent(event);
      }
    } catch (error) {
      console.error("Error refreshing event:", error);
    }
  }, [sessionCode]);

  return (
    <SessionContext.Provider
      value={{
        sessionCode,
        generateSessionCode,
        setCustomSessionCode,
        isValidSession,
        setIsHost,
        isHost,
        currentEvent,
        setCurrentEvent,
        refreshCurrentEvent,
        guestName,
        guestId,
        setGuestIdentity,
        clearGuestIdentity,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

// Helper hook to get the actual event ID (for components that need it)
export function useActualEventId(): string | null {
  const { currentEvent } = useSession();
  return currentEvent?.id || null;
}
