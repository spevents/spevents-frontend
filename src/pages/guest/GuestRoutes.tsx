// src/pages/guest/GuestRoutes.tsx

import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { useEffect } from "react";
import { GuestLanding } from "./GuestLanding";
import CameraInterface from "../../components/camera/CameraInterface";
import PhotoReview from "../../components/PhotoReview/PhotoReview";
import { GuestDashboard } from "../../components/guest/GuestDashboard";
import FeedbackPage from "../../components/guest/FeedbackPage";
import { CollageCreator } from "../../components/guest/CollageCreator";
import { SessionValidator } from "../../components/session/SessionValidator";

// Mobile detection utility
const isMobileDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor;
  return /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());
};

export const GuestRoutes = () => {
  const location = useLocation();
  const { eventId } = useParams(); // This will now be the session code

  useEffect(() => {
    console.log(
      `🔄 GuestRoutes - Path: ${location.pathname}, Param (sessionCode): ${eventId}`,
    );
    console.log(`📱 Is mobile device: ${isMobileDevice()}`);

    if (!isMobileDevice()) {
      sessionStorage.setItem("attempted-url", location.pathname);
    }
  }, [location, eventId]);

  if (!isMobileDevice()) {
    return <Navigate to="/" replace />;
  }

  if (!eventId) {
    console.log("❌ No session code provided in URL");
    return (
      <Routes>
        <Route path="/" element={<GuestLanding />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  console.log(`🎯 Processing session code: ${eventId}`);

  return (
    <Routes>
      <Route
        path="guest/*"
        element={
          <SessionValidator sessionCode={eventId}>
            <Routes>
              <Route
                path="camera"
                element={<CameraInterface initialMode="camera" />}
              />
              <Route index element={<GuestDashboard />} />
              <Route path="review" element={<PhotoReview />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="create" element={<CollageCreator />} />
            </Routes>
          </SessionValidator>
        }
      />

      <Route path="*" element={<Navigate to={`/${eventId}/guest`} replace />} />
    </Routes>
  );
};
