// src/contexts/SessionContext.tsx

import React, { createContext, useContext, useState, useCallback } from "react";
import { guestService } from "../services/api";
import { Event } from "../types/event";

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
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionCode, setSessionCode] = useState<string | null>(() =>
    localStorage.getItem("spevents-session"),
  );
  const [isHost, setIsHost] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);

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
        console.log("Validating session for sessionCode:", sessionCode);

        // Check if this session code exists in Firestore
        const event = await guestService.getEventBySessionCode(sessionCode);
        const isValid = event !== null;

        console.log("Session validation result:", {
          sessionCode,
          isValid,
          event,
        });
        return isValid;
      } catch (error) {
        console.error("Error in isValidSession:", error);
        return false;
      }
    },
    [],
  );

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
