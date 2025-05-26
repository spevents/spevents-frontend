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
      {/* Legacy host routes */}
      <Route path="host/gallery" element={<GalleryPage />} />
      <Route path="host/slideshow" element={<SlideshowPage />} />

      {/* New dashboard routes */}
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="dashboard/create-event" element={<CreateEventPage />} />
      <Route path="dashboard/setup-gallery" element={<SetupGalleryPage />} />
      <Route path="dashboard/3d-builder" element={<ThreeDBuilderPage />} />

      {/* Default redirects */}
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="host" element={<Navigate to="/host/gallery" replace />} />

      {/* Catch all other paths and redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
