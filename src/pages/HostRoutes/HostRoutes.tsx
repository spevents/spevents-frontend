// src/pages/host/HostRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import GalleryPage from '../GalleryPage';
import SlideshowPage from '../SlideshowPage';

export const HostRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/host/gallery" replace />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/slideshow" element={<SlideshowPage />} />
      <Route path="*" element={<Navigate to="/host/gallery" replace />} />
    </Routes>
  );
};