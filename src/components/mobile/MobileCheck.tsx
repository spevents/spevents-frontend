// src/components/MobileCheck.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const isMobileDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor;
  return /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());
};

interface MobileCheckProps {
  children: React.ReactNode;
}

export function MobileCheck({ children }: MobileCheckProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isMobileDevice()) {
      navigate("/");
    }
  }, [navigate]);

  if (!isMobileDevice()) {
    return null;
  }

  return <>{children}</>;
}
