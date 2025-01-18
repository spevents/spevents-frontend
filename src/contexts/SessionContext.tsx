// src/contexts/SessionContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface SessionContextType {
  sessionCode: string | null;
  isHost: boolean;
  generateSessionCode: () => void;
  setIsHost: (isHost: boolean) => void;
  setCustomSessionCode: (code: string) => void;
}

const SessionContext = createContext<SessionContextType>({
  sessionCode: null,
  isHost: false,
  generateSessionCode: () => {},
  setIsHost: () => {},
  setCustomSessionCode: () => {},
});

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessionCode, setSessionCode] = useState<string | null>(() => {
    // Try to get session code from localStorage on init
    const stored = localStorage.getItem('session_code');
    return stored || null;
  });
  const [isHost, setIsHost] = useState(false);

  // Save session code to localStorage whenever it changes
  useEffect(() => {
    if (sessionCode) {
      localStorage.setItem('session_code', sessionCode);
    }
  }, [sessionCode]);

  const generateSessionCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setSessionCode(code);
  };

  const setCustomSessionCode = (code: string) => {
    setSessionCode(code);
  };

  return (
    <SessionContext.Provider 
      value={{ 
        sessionCode, 
        isHost, 
        generateSessionCode, 
        setIsHost,
        setCustomSessionCode 
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);