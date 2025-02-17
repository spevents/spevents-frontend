// src/contexts/SessionContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";

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

  const isValidSession = useCallback(async (code: string): Promise<boolean> => {
    try {
      const storedCode = localStorage.getItem("spevents-session");
      const envEventId = import.meta.env.VITE_EVENT_ID;

      // Enhanced debugging
      console.log("Session Validation Check:", {
        receivedCode: code,
        storedCode,
        envEventId,
        receivedCodeType: typeof code,
        envEventIdType: typeof envEventId,
        exactMatch: code === envEventId,
        trimmedMatch: code.trim() === envEventId.trim(),
        decodedMatch: decodeURIComponent(code) === envEventId,
      });

      // Try multiple matching strategies
      const isMatch =
        code === envEventId ||
        code.trim() === envEventId.trim() ||
        decodeURIComponent(code) === envEventId ||
        code === storedCode;

      console.log("Final match result:", isMatch);

      return isMatch;
    } catch (error) {
      console.error("Error in isValidSession:", error);
      return false;
    }
  }, []);

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
