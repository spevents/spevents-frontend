// src/contexts/SessionContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

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
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);

  const generateSessionCode = useCallback(() => {
    const code = Math.random().toString(36).substring(2, 8);
    setSessionCode(code);
    // Store in localStorage for persistence
    localStorage.setItem('spevents-session', code);
  }, []);

  const setCustomSessionCode = useCallback((code: string) => {
    setSessionCode(code);
    localStorage.setItem('spevents-session', code);
  }, []);

  const isValidSession = useCallback(async (code: string): Promise<boolean> => {
    // Check if the code matches the stored session code
    const storedCode = localStorage.getItem('spevents-session');
    
    // If we're in host mode, update the session code
    if (isHost && code !== storedCode) {
      setCustomSessionCode(code);
      return true;
    }

    // For guest mode, validate against stored code
    return code === storedCode || code === 'mshaadi-2025'; // Hardcoded valid session
  }, [isHost, setCustomSessionCode]);

  return (
    <SessionContext.Provider value={{
      sessionCode,
      generateSessionCode,
      setCustomSessionCode,
      isValidSession,
      setIsHost,
      isHost
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}