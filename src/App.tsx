// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionProvider } from "./contexts/SessionContext";
import { AuthGuard } from "./components/auth/AuthGuard";
import { HostRoutes } from "./pages/HostRoutes/HostRoutes";
import { GuestRoutes } from "./pages/guest/GuestRoutes";
import { LandingPage } from "./pages/landing/LandingPage";
import { LoginPage } from "./components/auth/LoginPage";
import { isHostDomain, isGuestDomain } from "./components/config/routes";
import { GuestLanding } from "./pages/guest/GuestLanding";

export default function App() {
  // Debug logs for troubleshooting
  const currentDomain = window.location.hostname;
  const currentPath = window.location.pathname;
  const isGuest = isGuestDomain();
  const isHost = isHostDomain();

  console.log(`🌐 App Debug Info:`, {
    domain: currentDomain,
    path: currentPath,
    isGuestDomain: isGuest,
    isHostDomain: isHost,
    userAgent: navigator.userAgent.substring(0, 50) + "...",
  });

  // Guest domain handling (join.spevents.live)
  if (isGuestDomain()) {
    console.log(`🎯 Guest domain detected - Setting up guest routes`);

    return (
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<GuestLanding />} />
            {/* Handle session codes directly in the URL */}
            <Route path="/:sessionCode/*" element={<GuestRoutes />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    );
  }

  // Host domain handling (app.spevents.live) - excluding localhost
  if (isHostDomain() && currentDomain !== "localhost") {
    console.log(`🏢 Host domain detected - Setting up host routes`);

    return (
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route element={<AuthGuard />}>
              <Route path="/host/*" element={<HostRoutes />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    );
  }

  // Localhost handling - support both host and guest routes for development
  console.log(`🛠️ Localhost detected - Setting up development routes`);

  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AuthGuard />}>
            <Route path="/host/*" element={<HostRoutes />} />
          </Route>
          {/* Guest routes for localhost development - support both patterns */}
          <Route path="/:sessionCode/guest/*" element={<GuestRoutes />} />
          <Route path="/guest/:sessionCode/*" element={<GuestRoutes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}
