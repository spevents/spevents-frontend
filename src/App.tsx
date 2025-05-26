// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionProvider } from "./contexts/SessionContext";
import { NgrokProvider } from "./contexts/NgrokContext";
import { AuthGuard } from "./components/auth/AuthGuard";
import { HostRoutes } from "./pages/HostRoutes/HostRoutes";
import { GuestRoutes } from "./pages/guest/GuestRoutes";
import { LandingPage } from "./pages/landing/LandingPage";
import { LoginPage } from "./components/auth/LoginPage";
import { OnboardingPage } from "./pages/onboarding/OnboardingPage";
import { JoinEventPage } from "./pages/guest/JoinEventPage";
import { isHostDomain, isGuestDomain } from "./components/config/routes";

export default function App() {
  // Guest domain handling (join.spevents.live or /guest/ paths)
  if (isGuestDomain()) {
    return (
      <SessionProvider>
        <NgrokProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<JoinEventPage />} />
              <Route path="/:eventId/*" element={<GuestRoutes />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NgrokProvider>
      </SessionProvider>
    );
  }

  // Host domain handling (app.spevents.live only)
  if (isHostDomain() && window.location.hostname !== "localhost") {
    return (
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/signin" element={<LoginPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route element={<AuthGuard />}>
              <Route path="/host/*" element={<HostRoutes />} />
              <Route path="/dashboard/*" element={<HostRoutes />} />
            </Route>
            <Route path="/" element={<Navigate to="/signin" replace />} />
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    );
  }

  // Main domain (spevents.live) and localhost development
  return (
    <SessionProvider>
      <NgrokProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<LoginPage />} />
            <Route path="/join" element={<JoinEventPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route element={<AuthGuard />}>
              <Route path="/host/*" element={<HostRoutes />} />
              <Route path="/dashboard/*" element={<HostRoutes />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NgrokProvider>
    </SessionProvider>
  );
}
