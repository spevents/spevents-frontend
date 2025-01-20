import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CameraPage, GalleryPage, PhotoReviewPage, SlideshowPage } from './pages';
import FeedbackPage from './components/guest/FeedbackPage';
import { GuestDashboard } from './components/guest/GuestDashboard';
import { NgrokProvider } from './contexts/NgrokContext';
import { MainLayout } from './layouts';

export default function App() {
  return (
    <NgrokProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin/Main Routes with Layout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<GalleryPage />} />
            <Route path="slideshow" element={<SlideshowPage />} />
          </Route>

          {/* Guest Routes */}
          <Route path="/guest" element={<GuestDashboard />} />
          <Route path="/camera" element={<CameraPage />} />
          <Route path="/review" element={<PhotoReviewPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          
          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </NgrokProvider>
  );
}