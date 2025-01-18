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
  // Debug logs
  console.log('Current domain:', window.location.hostname);
  console.log('Is guest domain?', isGuestDomain());
  console.log('Is host domain?', isHostDomain());
  console.log('Current path:', window.location.pathname);

  // Guest domain handling (join.spevents.live or /guest/ paths)
  if (isGuestDomain()) {
    return (
      <SessionProvider>
        <BrowserRouter>
          <GuestRoutes />
        </BrowserRouter>
      </SessionProvider>
    );
  }

  // Host domain handling (app.spevents.live or localhost without /guest/)
  if (isHostDomain()) {
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

  // Default landing page for main domain (spevents.live)
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}