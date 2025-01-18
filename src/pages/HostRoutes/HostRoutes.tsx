// src/pages/host/HostRoutes.tsx
import { Routes, Route } from 'react-router-dom';
import GalleryPage from '../GalleryPage';
import SlideshowPage from '../SlideshowPage';

export const HostRoutes = () => {
  return (
    <Routes>
      <Route index element={<GalleryPage />} />
      <Route path="slideshow" element={<SlideshowPage />} />
    </Routes>
  );
};