// src/components/auth/AuthGuard.tsx
import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { isHostDomain } from "../config/routes";

const ALLOWED_EMAIL = import.meta.env.VITE_ALLOWED_EMAIL;

export const AuthGuard = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for auth bypass
  const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === "true";

  useEffect(() => {
    if (BYPASS_AUTH) {
      console.log("Auth bypassed via VITE_BYPASS_AUTH");
      setIsAuthorized(true);
      setIsLoading(false);
      return;
    }

    if (!isHostDomain()) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === ALLOWED_EMAIL) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [BYPASS_AUTH]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
