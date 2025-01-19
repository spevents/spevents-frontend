// src/pages/guest/GuestRoutes.tsx
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { GuestLanding } from './GuestLanding';
import CameraPage from '../CameraPage';
import PhotoReviewPage from '../PhotoReviewPage';
import { GuestDashboard } from '../../components/guest/GuestDashboard';
import { CollageCreatorWrapper } from '../../components/guest/CollageCreatorWrapper';
import FeedbackPage from '../../components/guest/FeedbackPage';
import { SessionValidator } from '../../components/session/SessionValidator';

// Mobile detection utility
const isMobileDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor;
  return /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());
};

// Mobile check wrapper component
const MobileCheck = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  useEffect(() => {
    alert(`MobileCheck: Accessing ${location.pathname}
    Is Mobile: ${isMobileDevice()}`);
    
    if (!isMobileDevice()) {
      sessionStorage.setItem('attempted-url', location.pathname);
    }
  }, [location]);

  if (!isMobileDevice()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const GuestRoutes = () => {
  const location = useLocation();
  const { eventId } = useParams();
  
  useEffect(() => {
    alert(`GuestRoutes:
    Path: ${location.pathname}
    Event ID: ${eventId}`);
  }, [location, eventId]);

  // If no eventId, show landing
  if (!eventId) {
    return (
      <Routes>
        <Route path="/" element={<GuestLanding />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Guest routes with validators */}
      <Route path="guest" element={
        <SessionValidator>
          <MobileCheck>
            <Routes>
              <Route path="camera" element={<CameraPage />} />
              <Route index element={<GuestDashboard />} />
              <Route path="review" element={<PhotoReviewPage />} />
              <Route path="collage" element={<CollageCreatorWrapper />} />
              <Route path="feedback" element={<FeedbackPage />} />
            </Routes>
          </MobileCheck>
        </SessionValidator>
      } />
      
      {/* Default redirect */}
      <Route path="*" element={
        isMobileDevice() ? (
          <Navigate to={`/${eventId}/guest/camera`} replace />
        ) : (
          <Navigate to="/" replace />
        )
      } />
    </Routes>
  );
};