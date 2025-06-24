// src/pages/HostRoutes/EventQRCode.tsx
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useEvent } from "../../contexts/EventContext";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Download, Copy, Check } from "lucide-react";
// import { motion } from "framer-motion";

export function EventQRCode() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { currentEvent, selectEvent } = useEvent();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (eventId && (!currentEvent || currentEvent.id !== eventId)) {
      selectEvent(eventId);
    }
  }, [eventId, currentEvent, selectEvent]);

  if (!eventId) {
    return <Navigate to="/host" replace />;
  }

  const getJoinUrl = () => {
    if (!currentEvent?.sessionCode) return "";
    return `https://join.spevents.live/${currentEvent.sessionCode}/guest/camera`;
  };

  const downloadQRCode = () => {
    const svg = document.getElementById("event-qr-code");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const data = new XMLSerializer().serializeToString(svg);
    const DOMURL = window.URL || window.webkitURL || window;
    const img = new Image();
    const svgBlob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
    const url = DOMURL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      DOMURL.revokeObjectURL(url);

      const imgURI = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");

      const downloadLink = document.createElement("a");
      downloadLink.download = `${currentEvent?.name || "event"}-qr.png`;
      downloadLink.href = imgURI;
      downloadLink.click();
    };

    img.src = url;
  };

  const copyToClipboard = async () => {
    const url = getJoinUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/host/event/${eventId}/gallery`)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">QR Code</h1>
              <p className="text-gray-400">
                {currentEvent?.name || "Event"} - Session:{" "}
                {currentEvent?.sessionCode}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Code */}
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <h2 className="text-xl font-semibold text-white mb-6">
              Guest Access QR Code
            </h2>

            {currentEvent?.sessionCode ? (
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-xl inline-block">
                  <QRCodeSVG
                    id="event-qr-code"
                    value={getJoinUrl()}
                    size={256}
                    level="H"
                    includeMargin
                  />
                </div>

                <div className="text-sm text-gray-400">
                  Guests scan this code to join and start sharing photos
                </div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={downloadQRCode}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>

                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-400">No session code available</div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-gray-800 rounded-xl p-8">
            <h2 className="text-xl font-semibold text-white mb-6">
              How to Use
            </h2>

            <div className="space-y-4 text-gray-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-white">Share the QR Code</h3>
                  <p className="text-sm text-gray-400">
                    Display this QR code at your event or share the link
                    directly
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-white">Guests Scan & Join</h3>
                  <p className="text-sm text-gray-400">
                    No app downloads required - works in any web browser
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-white">Photos Appear Live</h3>
                  <p className="text-sm text-gray-400">
                    Watch photos appear in real-time on your slideshow
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-900/30 rounded-lg">
              <h4 className="font-medium text-blue-300 mb-2">Join URL:</h4>
              <code className="text-xs text-blue-200 break-all">
                {getJoinUrl()}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
