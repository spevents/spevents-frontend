// import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
  redirectTo?: string;
}

export function RouteGuard({
  children,
  requireAuth = false,
  requireOnboarding = false,
  redirectTo = "/login",
}: RouteGuardProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sp_darkgreen dark:bg-sp_eggshell">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check onboarding requirement
  if (requireOnboarding && user && !user.onboardingCompleted) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // Skip onboarding if already completed
  if (location.pathname === "/onboarding" && user?.onboardingCompleted) {
    return <Navigate to="/host" replace />;
  }

  return <>{children}</>;
}
