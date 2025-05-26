// src/pages/HostRoutes/HostRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import GalleryPage from "../GalleryPage";
import SlideshowPage from "../SlideshowPage";
import { DashboardPage } from "../dashboard/DashboardPage";
import { CreateEventPage } from "../dashboard/CreateEventPage";
import { SetupGalleryPage } from "../dashboard/SetupGalleryPage";
import { ThreeDBuilderPage } from "../dashboard/ThreeDBuilderPage";

export const HostRoutes = () => {
  return (
    <Routes>
      {/* Dashboard routes - relative to /dashboard/* */}
      <Route index element={<DashboardPage />} />
      <Route path="create-event" element={<CreateEventPage />} />
      <Route path="setup-gallery" element={<SetupGalleryPage />} />
      <Route path="3d-builder" element={<ThreeDBuilderPage />} />

      {/* Legacy host routes - relative to /host/* */}
      <Route path="../host/gallery" element={<GalleryPage />} />
      <Route path="../host/slideshow" element={<SlideshowPage />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
