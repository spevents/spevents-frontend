// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SessionProvider } from './contexts/SessionContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { HostRoutes } from './pages/HostRoutes/HostRoutes';
import { GuestRoutes } from './pages/guest/GuestRoutes';
import { LandingPage } from './pages/landing/LandingPage';
import { isHostDomain, isGuestDomain } from './components/config/routes';

export default function App() {
  // Determine which routes to show based on domain
  if (isHostDomain()) {
    return (
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/*"
              element={
                <AuthGuard>
                  <HostRoutes />
                </AuthGuard>
              }
            />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    );
  }

  if (isGuestDomain()) {
    return (
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/:eventId/*" element={<GuestRoutes />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    );
  }

  // Default landing page
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}