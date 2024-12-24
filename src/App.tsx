// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CameraPage, GalleryPage, QRCodePage, PhotoReviewPage, SlideshowPage } from './pages';
import { NgrokProvider } from './contexts/NgrokContext';
import { MainLayout } from './layouts';


export default function App() {
  return (
    <NgrokProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />} />
          <Route path="qr" element={<QRCodePage />} />
          <Route path="camera" element={<CameraPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="slideshow" element={<SlideshowPage />} />
          <Route path="review" element={<PhotoReviewPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </NgrokProvider>
  );
}