// src/components/CameraInterface.tsx
import React, { useState, useRef, useEffect } from "react";
import { Upload as UploadIcon, Repeat } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNgrok } from "../contexts/NgrokContext";

const PHOTO_LIMIT = 5;

interface CameraInterfaceProps {
  initialMode: "qr" | "camera";
}

const CameraInterface: React.FC<CameraInterfaceProps> = ({ initialMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { baseUrl } = useNgrok();
  const [_hasPermission, setHasPermission] = useState(false);
  const [photos, setPhotos] = useState<Array<{ id: number; url: string }>>([]);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  const isDemoMode = location.pathname.startsWith("/demo");
  const basePrefix = isDemoMode ? "/demo" : "";

  const getConstraints = (facing: "environment" | "user") => ({
    video: {
      facingMode: facing,
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
    audio: false,
  });

  useEffect(() => {
    if (initialMode === "camera") {
      startCamera();
    }
    return () => cleanup();
  }, [initialMode]);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const startCamera = async (facing?: "environment" | "user") => {
    cleanup();
    const currentFacing = facing || facingMode;

    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        getConstraints(currentFacing)
      );
      if (videoRef.current) {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        setFacingMode(currentFacing);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasPermission(false);
    }
  };

  const flipCamera = () => {
    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    startCamera(newFacingMode);
  };

  const triggerCaptureEffect = () => {
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
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || photos.length >= PHOTO_LIMIT) return;

    triggerCaptureEffect();

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

    const sessionPhotos = JSON.parse(
      sessionStorage.getItem("temp-photos") || "[]"
    );
    sessionPhotos.push(newPhoto);
    sessionStorage.setItem("temp-photos", JSON.stringify(sessionPhotos));

    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const navigateWithBaseUrl = (path: string) => {
    // If we're on mobile and using ngrok, use the full ngrok URL
    if (window.innerWidth <= 768 && baseUrl) {
      window.location.href = `${baseUrl}${path}`;
    } else {
      // On desktop or without ngrok, use regular navigation
      navigate(path);
    }
  };

  return (
    <div className="relative h-screen bg-black">
      <div
        ref={flashRef}
        className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-150 z-20"
        style={{ opacity: 0 }}
      />

      <AnimatePresence>
        <motion.div
          key={photos.length}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full z-10"
        >
          <span
            className={`text-sm font-medium ${
              photos.length >= PHOTO_LIMIT ? "text-red-500" : "text-white"
            }`}
          >
            {photos.length} / {PHOTO_LIMIT}
          </span>
        </motion.div>
      </AnimatePresence>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`h-full w-full object-cover ${
          facingMode === "user" ? "scale-x-[-1]" : ""
        }`}
      />

      <AnimatePresence>
        {photos.length >= PHOTO_LIMIT && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-full text-sm"
          >
            Maximum photos reached
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-24 inset-x-0 p-8">
        <div className="flex justify-between items-center max-w-lg mx-auto px-6">
          {photos.length > 0 ? (
            <motion.button
              onClick={() => navigateWithBaseUrl(`${basePrefix}/review`)}
              whileTap={{ scale: 0.95 }}
              className="relative bg-white/20 backdrop-blur-lg p-4 rounded-full text-white"
            >
              <UploadIcon className="w-6 h-6" />
              <motion.span
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -top-1 -right-1 bg-white text-black text-xs w-5 h-5 rounded-full flex items-center justify-center"
              >
                {photos.length}
              </motion.span>
            </motion.button>
          ) : (
            <div className="w-14" />
          )}

          <motion.button
            onClick={capturePhoto}
            disabled={photos.length >= PHOTO_LIMIT}
            animate={{
              scale: isCapturing ? 0.9 : 1,
              backgroundColor: isCapturing
                ? "rgba(255, 255, 255, 0.8)"
                : "rgba(255, 255, 255, 1)",
            }}
            transition={{ duration: 0.15 }}
            className={`w-20 h-20 rounded-full transform relative
              ${
                photos.length >= PHOTO_LIMIT
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
          >
            <span className="absolute inset-2 rounded-full border-2 border-gray-200" />
          </motion.button>

          <motion.button
            onClick={flipCamera}
            whileTap={{ scale: 0.95 }}
            className="bg-white/20 backdrop-blur-lg p-4 rounded-full text-white"
          >
            <Repeat className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CameraInterface;
