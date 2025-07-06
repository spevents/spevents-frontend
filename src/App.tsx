// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionProvider } from "./contexts/SessionContext";
import { AuthProvider } from "./components/auth/AuthProvider";
import { AuthGuard } from "./components/auth/AuthGuard";
import { HostRoutes } from "./pages/HostRoutes/HostRoutes";
import { GuestRoutes } from "./pages/guest/GuestRoutes";
import { LandingPage } from "./pages/landing/LandingPage";
import { SignInPage } from "./components/auth/SignInPage";
import { isHostDomain, isGuestDomain } from "./components/config/routes";
import { GuestLanding } from "./pages/guest/GuestLanding";

export default function App() {
  const currentDomain = window.location.hostname;
  // const currentPath = window.location.pathname;
  // const isGuest = isGuestDomain();
  // const isHost = isHostDomain();

  // Guest domain handling
  if (isGuestDomain()) {
    return (
      <AuthProvider>
        {" "}
        <SessionProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<GuestLanding />} />
              <Route path="/:sessionCode/*" element={<GuestRoutes />} />
              <Route path="*" element={<GuestLanding />} />
            </Routes>
          </BrowserRouter>
        </SessionProvider>
      </AuthProvider>
    );
  }

  // Host domain handling
  if (isHostDomain() && currentDomain !== "localhost") {
    return (
      <AuthProvider>
        {" "}
        <SessionProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<SignInPage />} />{" "}
              {/* Use new SignInPage */}
              <Route element={<AuthGuard />}>
                <Route path="/host/*" element={<HostRoutes />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SessionProvider>
      </AuthProvider>
    );
  }

  // Default/localhost handling
  return (
    <AuthProvider>
      {" "}
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/guest/*" element={<GuestRoutes />} />
            <Route element={<AuthGuard />}>
              <Route path="/host/*" element={<HostRoutes />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </AuthProvider>
  );
}
