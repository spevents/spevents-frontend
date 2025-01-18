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
      
      {/* Event specific routes - Updated to match URL structure */}
      <Route path="/:eventId">
        {/* Redirect root event path to camera */}
        <Route index element={<Navigate to="guest/camera" replace />} />
        
        <Route path="guest">
          {/* Camera route */}
          <Route path="camera" element={<CameraPage />} />
          
          {/* Dashboard route */}
          <Route index element={<GuestDashboard />} />
          
          {/* Other guest features */}
          <Route path="collage" element={<CollageCreatorWrapper />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="review" element={<PhotoReviewPage />} />
        </Route>
      </Route>
      
      {/* Catch all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};