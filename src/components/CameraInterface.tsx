// src/components/CameraInterface.tsx
import React, { useState, useRef, useEffect } from "react";
import { Camera, X, Image as ImageIcon } from "lucide-react";
import QRCode from "qrcode";

interface CameraInterfaceProps {
  initialMode: "qr" | "camera";
  onPhotoCapture?: (photoUrl: string) => void;
}

const CameraInterface: React.FC<CameraInterfaceProps> = ({
  initialMode,
  onPhotoCapture,
}) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cameraConstraints = {
    video: {
      facingMode: "environment",
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30 },
    },
    audio: false,
  };




  useEffect(() => {
    if (initialMode === "qr") {
      generateQR();
    } else if (initialMode === "camera") {
      startCamera();
    }
  }, [initialMode]);





  const generateQR = async () => {
    try {
      const localIP = "10.20.0.242"; // local IP address
      const url = `https://${localIP}:5173/camera`;
      console.log("QR Code URL:", url);

      const qrCode = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: "#111827",
          light: "#ffffff",
        },
      });

      setQrCodeUrl(qrCode);
    } catch (err) {
      console.error("Error generating QR code:", err);
    }
  };

  const startCamera = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia(cameraConstraints);
        if (videoRef.current) {
            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            setHasPermission(true);
        }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      setHasPermission(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0);
    const photoUrl = canvas.toDataURL("image/jpeg");

    if (onPhotoCapture) {
      onPhotoCapture(photoUrl);
    }
  };

  if (!hasPermission && initialMode === "qr") {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-8 p-6">
        <div className="bg-white p-4 rounded-lg">
          <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
        </div>
        <p className="text-white text-center">
          Scan this QR code with your phone's camera to open the photo capture
          interface
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full object-cover"
      />
      <div className="absolute bottom-0 inset-x-0 p-6 flex justify-center items-center space-x-6">
        <button onClick={stopCamera} className="bg-red-500 p-3 rounded-full">
          <X className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={capturePhoto}
          className="bg-white w-16 h-16 rounded-full border-4 border-gray-300"
        />
        <button
          onClick={() => (window.location.href = "/gallery")}
          className="bg-blue-500 p-3 rounded-full"
        >
          <ImageIcon className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

export default CameraInterface;
