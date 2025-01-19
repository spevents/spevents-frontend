// src/pages/guest/GuestRoutes.tsx
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { GuestLanding } from './GuestLanding';
import CameraInterface from '../../components/CameraInterface';
import PhotoReview from '../../components/PhotoReview/PhotoReview';
import { GuestDashboard } from '../../components/guest/GuestDashboard';
import { CollageCreatorWrapper } from '../../components/guest/CollageCreatorWrapper';
import FeedbackPage from '../../components/guest/FeedbackPage';
import { SessionValidator } from '../../components/session/SessionValidator';

// Mobile detection utility
const isMobileDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor;
  return /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());
};

export const GuestRoutes = () => {
  const location = useLocation();
  const { eventId } = useParams();
  
  useEffect(() => {
    console.log(`GuestRoutes - Path: ${location.pathname}, Event ID: ${eventId}`);
    
    // Store attempted URL for mobile redirect if needed
    if (!isMobileDevice()) {
      sessionStorage.setItem('attempted-url', location.pathname);
    }
  }, [location, eventId]);

  // If not on mobile, redirect to landing
  if (!isMobileDevice()) {
    return <Navigate to="/" replace />;
  }

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
      <Route
        path="guest/*"
        element={
          <SessionValidator>
            <Routes>
              <Route path="camera" element={<CameraInterface initialMode="camera" />} />
              <Route index element={<GuestDashboard />} />
              <Route path="review" element={<PhotoReview />} />
              <Route path="collage" element={<CollageCreatorWrapper />} />
              <Route path="feedback" element={<FeedbackPage />} />
            </Routes>
          </SessionValidator>
        }
      />
      
      {/* Default redirect to guest dashboard */}
      <Route path="*" element={<Navigate to={`/${eventId}/guest`} replace />} />
    </Routes>
  );
};