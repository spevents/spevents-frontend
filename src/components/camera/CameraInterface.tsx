// src/components/camera/CameraInterface.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useNgrok } from "../../contexts/NgrokContext";
import { useZoom } from "./hooks/useZoom";
import { useOrientation } from "./hooks/useOrientation";
import { ZoomControl } from "./ZoomControl";
import { PhotoCounter } from "./PhotoCounter";
import { CameraControls } from "./CameraControls";
import { FlashControls } from "./FlashControls";
import { X } from "lucide-react";
import {
  ExtendedMediaTrackCapabilities,
  ExtendedMediaTrackConstraintSet,
} from "./types/media";

import { storeTempPhotos, getTempPhotos } from "../../services/api";

import { useActualEventId } from "../session/SessionValidator";

// Types
interface CameraInterfaceProps {
  initialMode: "qr" | "camera";
}

interface Photo {
  id: string;
  url: string;
  eventId: string;
  timestamp: number;
}

// Constants
const PHOTO_LIMIT = 5;
const DOUBLE_TAP_DELAY = 300;

export const CameraInterface: React.FC<CameraInterfaceProps> = ({
  initialMode,
}) => {
  // Router and context
  const navigate = useNavigate();
  const location = useLocation();
  const { baseUrl } = useNgrok();
  const isDemoMode = location.pathname.startsWith("/demo");
  const basePrefix = isDemoMode ? "/demo" : "";
  const orientation = useOrientation();

  // Get sessionCode from URL params and actual eventId from context
  const { eventId: sessionCode } = useParams();
  const actualEventId = useActualEventId();

  // Debug logs
  useEffect(() => {
    console.log("🎯 CameraInterface Debug:");
    console.log("  sessionCode from URL:", sessionCode);
    console.log("  actualEventId from context:", actualEventId);
  }, [sessionCode, actualEventId]);

  // State
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment",
  );
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [isFlashEnabled, setIsFlashEnabled] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  // Zoom hook
  const {
    zoomLevel,
    isZoomVisible,
    handleZoom,
    applyZoom,
    initializeZoom,
    toggleZoomVisibility,
  } = useZoom(facingMode);

  // Load existing photos on mount
  useEffect(() => {
    if (actualEventId) {
      console.log("📸 Loading existing photos for eventId:", actualEventId);
      const existingPhotos = getTempPhotos(actualEventId);
      console.log("📸 Found existing photos:", existingPhotos.length);
      setPhotos(existingPhotos);
    }
  }, [actualEventId]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
  }, []);

  // Effect to initialize camera
  useEffect(() => {
    if (initialMode === "camera") {
      startCamera();
    }
    return cleanup;
  }, [initialMode, cleanup]);

  // Effect to handle orientation changes
  useEffect(() => {
    startCamera(facingMode);
  }, [orientation, facingMode]);

  // Effect to prevent scroll during camera use
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const toggleFlash = useCallback(async () => {
    if (!streamRef.current) return;

    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const capabilities =
        track.getCapabilities() as ExtendedMediaTrackCapabilities;
      const newFlashState = !isFlashEnabled;

      if (facingMode === "environment" && capabilities.torch) {
        // Use device flash for rear camera if available
        await track.applyConstraints({
          advanced: [
            { torch: newFlashState } as ExtendedMediaTrackConstraintSet,
          ],
        });
      }
      // For front camera, we'll use screen flash handled in capturePhoto
      setIsFlashEnabled(newFlashState);
    } catch (error) {
      console.warn("Error toggling flash:", error);
    }
  }, [isFlashEnabled, facingMode]);

  const startCamera = async (facing?: "environment" | "user") => {
    cleanup();
    const currentFacing = facing || facingMode;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      if (videoRef.current) {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        setFacingMode(currentFacing);

        const track = stream.getVideoTracks()[0];
        await initializeZoom(track);

        // Reset flash when switching cameras
        if (isFlashEnabled) {
          const capabilities =
            track.getCapabilities() as ExtendedMediaTrackCapabilities;
          if (currentFacing === "environment" && capabilities.torch) {
            await track.applyConstraints({
              advanced: [{ torch: true } as ExtendedMediaTrackConstraintSet],
            });
          }
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const handleZoomChange = useCallback(
    (newZoom: number) => {
      if (!streamRef.current) return;

      handleZoom(newZoom);
      const track = streamRef.current.getVideoTracks()[0];
      applyZoom(track, newZoom);
    },
    [handleZoom, applyZoom],
  );

  const handleScreenTap = useCallback(
    (event: { target: any }) => {
      const target = event.target;
      if (
        target.closest(".capture-button") ||
        target.closest(".flip-button") ||
        target.closest(".navigate-to-review-button")
      ) {
        return;
      }

      const now = Date.now();
      if (now - lastTapTime < DOUBLE_TAP_DELAY) {
        flipCamera();
      }
      setLastTapTime(now);
    },
    [lastTapTime],
  );

  const flipCamera = useCallback(() => {
    startCamera(facingMode === "environment" ? "user" : "environment");
  }, [facingMode]);

  const triggerCaptureEffect = useCallback(() => {
    if (flashRef.current) {
      flashRef.current.style.opacity = "0.3";
      setTimeout(() => {
        if (flashRef.current) {
          flashRef.current.style.opacity = "0";
        }
      }, 150);
    }

    setIsCapturing(true);
    setTimeout(() => setIsCapturing(false), 150);
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || photos.length >= PHOTO_LIMIT || !actualEventId) {
      console.warn("❌ Cannot capture photo:", {
        hasVideo: !!videoRef.current,
        photoCount: photos.length,
        photoLimit: PHOTO_LIMIT,
        actualEventId,
      });
      return;
    }

    console.log("📸 Capturing photo...");
    console.log("  Using actualEventId:", actualEventId);
    console.log("  Current photos:", photos.length);

    // Handle screen flash for front camera
    if (facingMode === "user" && isFlashEnabled) {
      if (flashRef.current) {
        flashRef.current.style.opacity = "1";
        await new Promise((resolve) => setTimeout(resolve, 200));
        flashRef.current.style.opacity = "0";
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    triggerCaptureEffect();

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) return;

    if (facingMode === "user") {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }

    context.drawImage(video, 0, 0);
    const photoUrl = canvas.toDataURL("image/jpeg", 0.8);

    const newPhoto: Photo = {
      id: Date.now().toString(),
      url: photoUrl,
      eventId: actualEventId,
      timestamp: Date.now(),
    };

    setPhotos((prev) => [...prev, newPhoto]);

    // Store using actualEventId (NOT sessionCode)
    const sessionPhotos = getTempPhotos(actualEventId);
    const updatedPhotos = [...sessionPhotos, newPhoto];
    storeTempPhotos(actualEventId, updatedPhotos);

    console.log("✅ Photo stored:");
    console.log("  eventId:", actualEventId);
    console.log("  Total photos:", updatedPhotos.length);

    navigator.vibrate?.(50);
  }, [
    photos.length,
    facingMode,
    isFlashEnabled,
    triggerCaptureEffect,
    actualEventId,
  ]);

  const navigateWithBaseUrl = (path: string) => {
    // Use sessionCode for navigation (URL structure) but actualEventId for storage
    const fullPath =
      path === "/" ? `/${sessionCode}/guest` : `/${sessionCode}/guest${path}`;
    if (window.innerWidth <= 768 && baseUrl) {
      window.location.href = `${baseUrl}${fullPath}`;
    } else {
      navigate(fullPath);
    }
  };

  // Don't render if we don't have actualEventId yet
  if (!actualEventId) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="relative h-screen bg-black overflow-hidden"
      onClick={handleScreenTap}
    >
      <button
        onClick={() => navigateWithBaseUrl(`/`)}
        className="absolute top-4 left-4 z-50 p-2 rounded-full bg-black/20 backdrop-blur-sm 
          text-white hover:bg-black/30 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        ref={flashRef}
        className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-150 z-20"
        style={{ opacity: 0 }}
      />

      <PhotoCounter
        count={photos.length}
        limit={PHOTO_LIMIT}
        orientation={orientation}
      />

      <FlashControls
        isEnabled={isFlashEnabled}
        onToggle={toggleFlash}
        orientation={orientation}
        facingMode={facingMode}
      />

      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`h-full w-full object-cover ${
          facingMode === "user" ? "scale-x-[-1]" : ""
        }`}
      />

      <ZoomControl
        isVisible={isZoomVisible}
        zoomLevel={zoomLevel}
        facingMode={facingMode}
        onToggleVisibility={toggleZoomVisibility}
        onZoomChange={handleZoomChange}
        orientation={orientation}
      />

      <CameraControls
        photoCount={photos.length}
        isCapturing={isCapturing}
        disabled={photos.length >= PHOTO_LIMIT}
        orientation={orientation}
        onCapture={capturePhoto}
        onFlip={flipCamera}
        onNavigateToReview={() => navigateWithBaseUrl(`${basePrefix}/review`)}
      />
    </div>
  );
};

export default CameraInterface;
