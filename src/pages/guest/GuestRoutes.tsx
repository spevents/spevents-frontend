// src/pages/guest/GuestRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { GuestLanding } from './GuestLanding';
import CameraPage from '../CameraPage';
import PhotoReviewPage from '../PhotoReviewPage';
import { GuestDashboard } from '../../components/guest/GuestDashboard';

export const GuestRoutes = () => {
  return (
    <Routes>
      {/* Add root route for GuestLanding */}
      <Route path="/" element={<GuestLanding />} />
      
      {/* Event specific routes */}
      <Route path="/:eventId/camera" element={<CameraPage />} />
      <Route path="/:eventId/review" element={<PhotoReviewPage />} />
      <Route path="/:eventId/guest" element={<GuestDashboard />} />
      
      {/* Catch all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};