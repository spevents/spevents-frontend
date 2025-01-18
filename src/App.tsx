// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SessionProvider } from './contexts/SessionContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { HostRoutes } from './pages/HostRoutes/HostRoutes';
import { GuestRoutes } from './pages/guest/GuestRoutes';
import { LandingPage } from './pages/landing/LandingPage';
import { isHostDomain, isGuestDomain } from './components/config/routes';
import { Navigate } from 'react-router-dom';

export default function App() {

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
          {/* Remove the :eventId requirement for the root path */}
          <Routes>
            <Route path="/*" element={<GuestRoutes />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}