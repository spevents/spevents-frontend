// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CameraPage, GalleryPage, PhotoReviewPage, SlideshowPage } from './pages';
import { NgrokProvider } from './contexts/NgrokContext';
import { MainLayout } from './layouts';

export default function App() {
  return (
    <NgrokProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<GalleryPage />} />
            <Route path="slideshow" element={<SlideshowPage />} />
            <Route path="camera" element={<CameraPage />} />
            <Route path="review" element={<PhotoReviewPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </NgrokProvider>
  );
}