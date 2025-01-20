import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNgrok } from "../../contexts/NgrokContext";
import { useZoom } from "./hooks/useZoom";
import { useOrientation } from "./hooks/useOrientation";
import { ZoomControl } from "./ZoomControl";
import { PhotoCounter } from "./PhotoCounter";
import { CameraControls } from "./CameraControls";

// Types
interface CameraInterfaceProps {
  initialMode: "qr" | "camera";
}

interface Photo {
  id: number;
  url: string;
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

  // State
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);

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

  // Camera handlers
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
    [handleZoom, applyZoom]
  );

  const handleScreenTap = useCallback((event: { target: any; }) => {
    const target = event.target;
    if (
      target.closest('.capture-button') ||
      target.closest('.flip-button') ||
      target.closest('.navigate-to-review-button')
    ) {
      return; // Ignore the tap if it was on an interactive element
    }

    const now = Date.now();
    if (now - lastTapTime < DOUBLE_TAP_DELAY) {
      flipCamera();
    }
    setLastTapTime(now);
  }, [lastTapTime]);

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

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || photos.length >= PHOTO_LIMIT) return;

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
    const newPhoto = { id: Date.now(), url: photoUrl };

    setPhotos((prev) => [...prev, newPhoto]);
    const sessionPhotos = JSON.parse(sessionStorage.getItem("temp-photos") || "[]");
    sessionStorage.setItem("temp-photos", JSON.stringify([...sessionPhotos, newPhoto]));

    navigator.vibrate?.(50);
  }, [photos.length, facingMode, triggerCaptureEffect]);

  const navigateWithBaseUrl = useCallback(
    (path: string) => {
      if (window.innerWidth <= 768 && baseUrl) {
        window.location.href = `${baseUrl}${path}`;
      } else {
        navigate(path);
      }
    },
    [navigate, baseUrl]
  );

  return (
    <div
      className="relative h-screen bg-black overflow-hidden"
      onClick={handleScreenTap}
    >
      <div
        ref={flashRef}
        className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-150 z-20"
        style={{ opacity: 0 }}
      />

      <PhotoCounter 
        count={photos.length} 
        limit={PHOTO_LIMIT}
        orientation={orientation}
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
        onZoomChange={handleZoomChange} orientation={"portrait"}      />
      
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
