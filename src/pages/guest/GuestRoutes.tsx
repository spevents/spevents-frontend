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

const isMobileDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor;
  return /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());
};

export const GuestRoutes = () => {
  const location = useLocation();
  const { sessionCode } = useParams(); // Renamed for clarity

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
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl mb-4">Desktop Not Supported</h2>
          <p className="text-gray-400 mb-4">
            Please use a mobile device to join events
          </p>
          <a
            href="https://app.spevents.live"
            className="text-blue-400 underline"
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
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
              <div className="text-center">
                <h2 className="text-xl mb-4">Invalid QR Code</h2>
                <p className="text-gray-400 mb-4">
                  Please scan a valid event QR code
                </p>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="bg-blue-600 px-4 py-2 rounded"
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
              <Route
                path="*"
                element={
                  <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
                    <div className="text-center">
                      <h2 className="text-xl mb-4">Page Not Found</h2>
                      <p className="text-gray-400 mb-4">
                        Available: camera, review, feedback, create
                      </p>
                      <button
                        onClick={() =>
                          (window.location.href = `/${sessionCode}/guest`)
                        }
                        className="bg-blue-600 px-4 py-2 rounded"
                      >
                        Go to Dashboard
                      </button>
                    </div>
                  </div>
                }
              />
            </Routes>
          </SessionValidator>
        }
      />

      {/* Redirect root sessionCode access to guest dashboard */}
      <Route
        path="/"
        element={<Navigate to={`/${sessionCode}/guest`} replace />}
      />

      {/* Catch-all with debug info */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
            <div className="text-center">
              <h2 className="text-xl mb-4">Routing Debug</h2>
              <div className="bg-gray-800 p-4 rounded text-left text-sm mb-4">
                <p>Session: {sessionCode}</p>
                <p>Path: {location.pathname}</p>
                <p>Expected: /{sessionCode}/guest/camera</p>
              </div>
              <button
                onClick={() =>
                  (window.location.href = `/${sessionCode}/guest/camera`)
                }
                className="bg-blue-600 px-4 py-2 rounded"
              >
                Go to Camera
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  );
};
