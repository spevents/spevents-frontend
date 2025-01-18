// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './contexts/SessionContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { HostRoutes } from './pages/HostRoutes/HostRoutes';
import { GuestRoutes } from './pages/guest/GuestRoutes';
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { isHostDomain, isGuestDomain } from './components/config/routes';

export default function App() {
  if (isHostDomain()) {
    return (
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            {/* Show login page at root */}
            <Route path="/" element={<LoginPage />} />
            
            {/* Protected host routes */}
            <Route element={<AuthGuard />}>
              <Route path="/host/*" element={<HostRoutes />} />
            </Route>
            
            {/* Redirect old routes to login if not authenticated */}
            <Route path="/gallery" element={<Navigate to="/" replace />} />
            <Route path="/slideshow" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
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