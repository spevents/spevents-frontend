// src/contexts/SessionContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { eventService } from "../lib/eventService";

interface SessionContextType {
  sessionCode: string | null;
  generateSessionCode: () => void;
  setCustomSessionCode: (code: string) => void;
  isValidSession: (code: string) => Promise<boolean>;
  setIsHost: (isHost: boolean) => void;
  isHost: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionCode, setSessionCode] = useState<string | null>(() =>
    localStorage.getItem("spevents-session"),
  );
  const [isHost, setIsHost] = useState(false);

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
    async (eventId: string): Promise<boolean> => {
      try {
        console.log("Validating session for eventId:", eventId);

        // Check if this event ID exists in Firestore
        const event = await eventService.getEventBySessionCode(eventId);
        const isValid = event !== null;

        console.log("Session validation result:", { eventId, isValid, event });
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
