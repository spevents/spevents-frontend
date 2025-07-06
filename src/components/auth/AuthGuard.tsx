// src/components/auth/AuthGuard.tsx
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { isHostDomain } from "../config/routes";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
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
      console.log("AuthGuard: Auth state changed", {
        user: !!user,
        email: user?.email,
      });

      // Allow any authenticated user (removed email restriction)
      if (user?.email) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [BYPASS_AUTH]);

  if (isLoading) {
    console.log("AuthGuard: Loading...");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    console.log("AuthGuard: Not authorized, redirecting to /");
    return <Navigate to="/" replace />;
  }

  console.log("AuthGuard: Authorized, rendering children");
  return <>{children}</>;
};
