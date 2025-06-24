// src/pages/HostRoutes/EventSlideshow.tsx
import { useParams, Navigate } from "react-router-dom";
import { useEvent } from "../../contexts/EventContext";
import { useEffect, useState } from "react";
import { PhotoSlideshow } from "../../components";
import { QRCodeSVG } from "qrcode.react";

export function EventSlideshow() {
  const { eventId } = useParams<{ eventId: string }>();
  const { currentEvent, selectEvent } = useEvent();
  const [showQR, setShowQR] = useState(true);

  useEffect(() => {
    if (eventId && (!currentEvent || currentEvent.id !== eventId)) {
      selectEvent(eventId);
    }
  }, [eventId, currentEvent, selectEvent]);

  if (!eventId) {
    return <Navigate to="/host" replace />;
  }

  const getScanUrl = () => {
    if (!currentEvent?.sessionCode) return "";
    return `https://join.spevents.live/${currentEvent.sessionCode}/guest/camera`;
  };

  return (
    <div className="relative h-screen">
      <PhotoSlideshow />

      {/* QR Code Panel */}
      {showQR && currentEvent?.sessionCode && (
        <div className="absolute top-5 right-16 z-50">
          <div className="bg-white rounded-lg overflow-hidden flex flex-col">
            <div className="bg-[#101827] w-full flex items-center justify-between px-6 py-2">
              <span className="text-white text-sm">Scan to Join</span>
              <button
                onClick={() => setShowQR(false)}
                className="text-white/60 hover:text-white text-xs"
              >
                Hide
              </button>
            </div>
            <div className="w-full flex items-center justify-center p-3">
              <QRCodeSVG value={getScanUrl()} size={128} level="H" />
            </div>
            <div className="px-3 pb-2 text-xs text-gray-600 text-center">
              {currentEvent.name}
            </div>
          </div>
        </div>
      )}

      {/* Show QR button when hidden */}
      {!showQR && (
        <button
          onClick={() => setShowQR(true)}
          className="absolute top-5 right-16 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-white text-sm"
        >
          Show QR
        </button>
      )}
    </div>
  );
}
