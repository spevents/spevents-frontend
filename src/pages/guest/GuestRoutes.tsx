// src/pages/guest/GuestRoutes.tsx
import { Routes, Route, useParams } from 'react-router-dom';
import CameraPage from '../CameraPage';
import PhotoReviewPage from '../PhotoReviewPage';
import { GuestDashboard } from '../../components/guest/GuestDashboard';
import FeedbackPage from '../../components/guest/FeedbackPage';

export const GuestRoutes = () => {
  const { eventId } = useParams<{ eventId: string }>();

  return (
    <Routes>
      <Route path="/camera" element={<CameraPage />} />
      <Route path="/review" element={<PhotoReviewPage />} />
      <Route path="/guest" element={<GuestDashboard />} />
      <Route path="/feedback" element={<FeedbackPage />} />
    </Routes>
  );
};