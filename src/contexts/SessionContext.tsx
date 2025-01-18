// src/contexts/SessionContext.tsx
import { createContext, useContext, useState } from 'react';

interface SessionContextType {
  sessionCode: string | null;
  isHost: boolean;
  generateSessionCode: () => void;
  setIsHost: (isHost: boolean) => void;
}

const SessionContext = createContext<SessionContextType>({
  sessionCode: null,
  isHost: false,
  generateSessionCode: () => {},
  setIsHost: () => {},
});

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);

  const generateSessionCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setSessionCode(code);
  };

  return (
    <SessionContext.Provider value={{ sessionCode, isHost, generateSessionCode, setIsHost }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);