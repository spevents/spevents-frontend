// src/pages/guest/GuestRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { GuestLanding } from './GuestLanding';
import CameraPage from '../CameraPage';
import PhotoReviewPage from '../PhotoReviewPage';
import { GuestDashboard } from '../../components/guest/GuestDashboard';
import { CollageCreatorWrapper } from '../../components/guest/CollageCreatorWrapper';
import FeedbackPage from '../../components/guest/FeedbackPage';

export const GuestRoutes = () => {
  return (
    <Routes>
      {/* Landing page when no event ID */}
      <Route path="/" element={<GuestLanding />} />
      
      {/* Event specific routes */}
      <Route path="/:eventId">
        {/* Direct camera access */}
        <Route path="guest/camera" element={<CameraPage />} />
        
        {/* Guest dashboard and features */}
        <Route path="guest" element={<GuestDashboard />} />
        <Route path="guest/collage" element={<CollageCreatorWrapper />} />
        <Route path="guest/feedback" element={<FeedbackPage />} />
        <Route path="guest/review" element={<PhotoReviewPage />} />
        
        {/* Default redirect to camera for mobile */}
        <Route index element={
          <Navigate to="guest/camera" replace />
        } />
      </Route>
      
      {/* Catch all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};