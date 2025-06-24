// src/pages/HostRoutes/HostRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { EventProvider } from "../../contexts/EventContext";
import { EventDashboard } from "./EventDashboard";
import { EventGallery } from "./EventGallery";
import { EventSlideshow } from "./EventSlideshow";
import { EventQRCode } from "./EventQRCode";

export const HostRoutes = () => {
  return (
    <EventProvider>
      <Routes>
        {/* Main events dashboard */}
        <Route index element={<EventDashboard />} />

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
