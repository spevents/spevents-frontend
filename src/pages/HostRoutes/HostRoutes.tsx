// src/pages/HostRoutes/HostRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { EventProvider } from "@/contexts/EventContext";
import { EventDashboard } from "./EventDashboard";
import { EventGallery } from "./EventGallery";
import { EventSlideshow } from "./EventSlideshow";
import { EventQRCode } from "./EventQRCode";
import { LibraryPage } from "./LibraryPage";
import { CommunityPage } from "./CommunityPage";
import { PhotosPage } from "./PhotosPage";
import { GuestPage } from "./GuestPage";

export const HostRoutes = () => {
  return (
    <EventProvider>
      <Routes>
        {/* Main dashboard route */}
        <Route index element={<EventDashboard />} />

        {/* Redirect /dashboard to /host */}
        <Route path="dashboard" element={<Navigate to="/host" replace />} />

        {/* Main navigation routes */}
        <Route path="library" element={<LibraryPage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="photos" element={<PhotosPage />} />
        <Route path="guest" element={<GuestPage />} />

        {/* Event-specific routes */}
        <Route path="event/:eventId/gallery" element={<EventGallery />} />
        <Route path="event/:eventId/slideshow" element={<EventSlideshow />} />
        <Route path="event/:eventId/qr" element={<EventQRCode />} />

        {/* Legacy redirects */}
        <Route path="gallery" element={<Navigate to="/host" replace />} />
        <Route path="slideshow" element={<Navigate to="/host" replace />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/host" replace />} />
      </Routes>
    </EventProvider>
  );
};
