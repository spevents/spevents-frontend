// src/pages/guest/GuestRoutes.tsx
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { GuestLanding } from './GuestLanding';
import CameraPage from '../CameraPage';
import PhotoReviewPage from '../PhotoReviewPage';
import { GuestDashboard } from '../../components/guest/GuestDashboard';
import { CollageCreatorWrapper } from '../../components/guest/CollageCreatorWrapper';
import FeedbackPage from '../../components/guest/FeedbackPage';

// Mobile detection utility
const isMobileDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor;
  return /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());
};

// Mobile check wrapper component
const MobileCheck = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  useEffect(() => {
    if (!isMobileDevice()) {
      // Store the attempted URL to show a message on the landing page
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
    console.log('Current path:', location.pathname);
    console.log('Event ID:', eventId);
  }, [location, eventId]);

  // If no eventId, show landing or redirect to it
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
      {/* Event specific routes - all wrapped with MobileCheck */}
      <Route path="guest" element={<MobileCheck><Routes>
        <Route index element={<GuestDashboard />} />
        <Route path="camera" element={<CameraPage />} />
        <Route path="review" element={<PhotoReviewPage />} />
        <Route path="collage" element={<CollageCreatorWrapper />} />
        <Route path="feedback" element={<FeedbackPage />} />
      </Routes></MobileCheck>} />
      
      {/* Mobile users entering root event URL go to camera */}
      <Route index element={
        isMobileDevice() 
          ? <Navigate to={`/${eventId}/guest/camera`} replace />
          : <Navigate to="/" replace />
      } />
      
      {/* Catch all redirect */}
      <Route path="*" element={
        isMobileDevice()
          ? <Navigate to={`/${eventId}/guest/`} replace />
          : <Navigate to="/" replace />
      } />
    </Routes>
  );
};