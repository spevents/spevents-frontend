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
  const currentDomain = window.location.hostname;
  const currentPath = window.location.pathname;
  const isGuest = isGuestDomain();
  const isHost = isHostDomain();

  // Enhanced debug logging
  console.log(`🌐 App Debug:`, {
    domain: currentDomain,
    path: currentPath,
    isGuestDomain: isGuest,
    isHostDomain: isHost,
    fullURL: window.location.href,
  });

  // Guest domain handling with enhanced error boundary
  if (isGuestDomain()) {
    console.log(`🎯 Guest domain - routing path: ${currentPath}`);

    // Debug path parsing
    const pathParts = currentPath.split("/").filter(Boolean);
    console.log(`📂 Path parts:`, pathParts);

    return (
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<GuestLanding />} />
            <Route path="/:sessionCode/*" element={<GuestRoutes />} />
            {/* Fallback for any unmatched routes */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-gray-900 text-white p-6">
                  <div className="max-w-md mx-auto text-center">
                    <h2 className="text-xl mb-4">Route Debug Info</h2>
                    <div className="bg-gray-800 p-4 rounded text-left text-sm">
                      <p>Path: {currentPath}</p>
                      <p>Parts: {JSON.stringify(pathParts)}</p>
                      <p>Expected: /SESSION_CODE/guest/camera</p>
                    </div>
                    <button
                      onClick={() => (window.location.href = "/")}
                      className="mt-4 bg-blue-600 px-4 py-2 rounded"
                    >
                      Go Home
                    </button>
                  </div>
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    );
  }

  // Host domain handling
  if (isHostDomain() && currentDomain !== "localhost") {
    console.log(`🏢 Host domain detected`);

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

  // Default/localhost handling
  console.log(`🏠 Default domain routing`);

  return (
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
  );
}
