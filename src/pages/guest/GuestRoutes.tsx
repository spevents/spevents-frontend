//src/pages/guest/GuestRoutes.tsx
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { GuestLanding } from './GuestLanding';
import CameraPage from '../CameraPage';
import PhotoReviewPage from '../PhotoReviewPage';
import { GuestDashboard } from '../../components/guest/GuestDashboard';
import { CollageCreatorWrapper } from '../../components/guest/CollageCreatorWrapper';
import FeedbackPage from '../../components/guest/FeedbackPage';

export const GuestRoutes = () => {
  const location = useLocation();
  const { eventId } = useParams();
  
  useEffect(() => {
    console.log('Current path:', location.pathname);
    console.log('Event ID:', eventId);
  }, [location, eventId]);

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
      {/* Event specific routes */}
      <Route path="guest">
        <Route index element={<GuestDashboard />} />
        <Route path="camera" element={<CameraPage />} />
        <Route path="review" element={<PhotoReviewPage />} />
        <Route path="collage" element={<CollageCreatorWrapper />} />
        <Route path="feedback" element={<FeedbackPage />} />
      </Route>
      
      {/* Redirect root to camera for mobile */}
      <Route index element={
        <Navigate to={`/${eventId}/guest/camera`} replace />
      } />
      
      {/* Catch all redirect */}
      <Route path="*" element={
        <Navigate to={`/${eventId}/guest/`} replace />
      } />
    </Routes>
  );
};