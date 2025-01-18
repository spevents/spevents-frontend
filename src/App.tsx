// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './contexts/SessionContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { HostRoutes } from './pages/HostRoutes/HostRoutes';
import { GuestRoutes } from './pages/guest/GuestRoutes';
import { LandingPage } from './pages/landing/LandingPage';
import { isHostDomain, isGuestDomain } from './components/config/routes';

export default function App() {
  if (isHostDomain()) {
    return (
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/host" replace />} />
            <Route
              path="/host/*"
              element={
                <AuthGuard>
                  <HostRoutes />
                </AuthGuard>
              }
            />
            {/* Redirect old routes to new structure */}
            <Route path="/gallery" element={<Navigate to="/host/gallery" replace />} />
            <Route path="/slideshow" element={<Navigate to="/host/slideshow" replace />} />
            <Route path="*" element={<Navigate to="/host" replace />} />
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