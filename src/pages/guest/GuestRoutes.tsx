// src/pages/guest/GuestRoutes.tsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { GuestLanding } from './GuestLanding';
import CameraPage from '../CameraPage';
import PhotoReviewPage from '../PhotoReviewPage';
import { GuestDashboard } from '../../components/guest/GuestDashboard';
import { CollageCreatorWrapper } from '../../components/guest/CollageCreatorWrapper';
import FeedbackPage from '../../components/guest/FeedbackPage';

// Debug component for catch-all route
const DebugRoute = () => {
  useEffect(() => {
    console.log('No route match, falling back to catch-all');
  }, []);

  return <Navigate to="/" replace />;
};

export const GuestRoutes = () => {
  const location = useLocation();
  
  useEffect(() => {
    console.log('Current path:', location.pathname);
  }, [location]);

  return (
    <Routes>
      {/* Landing page when no event ID */}
      <Route path="/" element={<GuestLanding />} />
      
      {/* Event specific routes */}
      <Route path=":eventId">
        {/* Direct camera access */}
        <Route path="guest/camera" element={<CameraPage />} />
        
        {/* Guest dashboard and features */}
        <Route path="guest">
          <Route index element={<GuestDashboard />} />
          <Route path="collage" element={<CollageCreatorWrapper />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="review" element={<PhotoReviewPage />} />
        </Route>
        
        {/* Default redirect to camera for mobile */}
        <Route index element={
          <Navigate to="guest/camera" replace />
        } />
      </Route>
      
      {/* Catch all redirect */}
      <Route path="*" element={<DebugRoute />} />
    </Routes>
  );
};