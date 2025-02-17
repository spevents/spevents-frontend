// src/contexts/NgrokContext.tsx
import { createContext, useContext, useState, useEffect } from "react";

interface NgrokContextType {
  baseUrl: string;
  setBaseUrl: (url: string) => void;
}

const NgrokContext = createContext<NgrokContextType>({
  baseUrl: "",
  setBaseUrl: () => {},
});

export const NgrokProvider = ({ children }: { children: React.ReactNode }) => {
  const [baseUrl, setBaseUrl] = useState("");

  // You can set this manually when ngrok starts
  useEffect(() => {
    // Default to local during development if no ngrok URL is set
    if (!baseUrl) {
      setBaseUrl(window.location.origin);
    }
  }, []);

  return (
    <NgrokContext.Provider value={{ baseUrl, setBaseUrl }}>
      {children}
    </NgrokContext.Provider>
  );
};

export const useNgrok = () => useContext(NgrokContext);
