// src/pages/HostRoutes/HostRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import GalleryPage from "../GalleryPage";
import SlideshowPage from "../SlideshowPage";

export const HostRoutes = () => {
  return (
    <Routes>
      {/* Redirect /host to /host/gallery */}
      <Route index element={<Navigate to="/host/gallery" replace />} />

      {/* Host routes */}
      <Route path="gallery" element={<GalleryPage />} />
      <Route path="slideshow" element={<SlideshowPage />} />

      {/* Catch all other paths and redirect to gallery */}
      <Route path="*" element={<Navigate to="/host/gallery" replace />} />
    </Routes>
  );
};
