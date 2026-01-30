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
import CameraInterface from "@/components/camera/CameraInterface";
import PhotoReview from "@/components/PhotoReview/PhotoReview";
import { GuestDashboard } from "@/components/guest/GuestDashboard";
import FeedbackPage from "@/components/guest/FeedbackPage";
import { CollageCreator } from "@/components/guest/CollageCreator";
import { SessionValidator } from "@/components/session/SessionValidator";
import { ScavengerHuntPage } from "./ScavengerHuntPage";

const isMobileDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor;
  return /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());
};

export const GuestRoutes = () => {
  const location = useLocation();
  const params = useParams();
  const sessionCode = params.sessionCode || params.eventId;

  useEffect(() => {
    console.log(`🔄 GuestRoutes Debug:`, {
      path: location.pathname,
      sessionCode,
      isMobile: isMobileDevice(),
      fullLocation: location,
    });
  }, [location, sessionCode]);

  // Mobile check with better error message
  if (!isMobileDevice()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sp_darkgreen via-sp_green to-sp_darkgreen text-sp_eggshell flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl mb-4 font-semibold">Desktop Not Supported</h2>
          <p className="text-sp_lightgreen mb-4">
            Please use a mobile device to join events
          </p>
          <a
            href="https://app.spevents.live"
            className="text-sp_eggshell underline hover:text-sp_lightgreen transition-colors"
          >
            Host? Sign in here
          </a>
        </div>
      </div>
    );
  }

  // Session code validation
  if (!sessionCode) {
    console.log("❌ No session code in URL params");
    return (
      <Routes>
        <Route path="/" element={<GuestLanding />} />
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-gradient-to-br from-sp_darkgreen via-sp_green to-sp_darkgreen text-sp_eggshell flex items-center justify-center p-6">
              <div className="text-center">
                <h2 className="text-xl mb-4 font-semibold">Invalid QR Code</h2>
                <p className="text-sp_lightgreen mb-4">
                  Please scan a valid event QR code
                </p>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="bg-sp_midgreen hover:bg-sp_lightgreen text-sp_eggshell hover:text-sp_darkgreen px-4 py-2 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          }
        />
      </Routes>
    );
  }

  console.log(`🎯 Processing session code: ${sessionCode}`);

  return (
    <Routes>
      <Route
        path="guest/*"
        element={
          <SessionValidator sessionCode={sessionCode}>
            <Routes>
              <Route
                path="camera"
                element={<CameraInterface initialMode="camera" />}
              />
              <Route index element={<GuestDashboard />} />
              <Route path="review" element={<PhotoReview />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="create" element={<CollageCreator />} />
              <Route path="hunt" element={<ScavengerHuntPage />} />
            </Routes>
          </SessionValidator>
        }
      />

      <Route
        path="/"
        element={<Navigate to={`/${sessionCode}/guest`} replace />}
      />
      <Route
        path="*"
        element={<Navigate to={`/${sessionCode}/guest`} replace />}
      />
    </Routes>
  );
};
