// src/pages/HostRoutes/EventSlideshow.tsx

import { useParams, Navigate } from "react-router-dom";
import { useEvent } from "@/contexts/EventContext";
import { useEffect, useState } from "react";
import { PhotoSlideshow } from "@/components";
import { QRCodeSVG } from "qrcode.react";
import { eventService, guestService } from "@/services/api";

export function EventSlideshow() {
  const { eventId } = useParams<{ eventId: string }>();
  const { currentEvent, selectEvent } = useEvent();
  const [showQR, setShowQR] = useState(true);
  const [_debugInfo, setDebugInfo] = useState<any>(null);
  const [sessionCode, setSessionCode] = useState<string | null>(null);

  useEffect(() => {
    if (eventId && (!currentEvent || currentEvent.id !== eventId)) {
      selectEvent(eventId);
    }
  }, [eventId, currentEvent, selectEvent]);

  // Debug session code
  useEffect(() => {
    const debugSession = async () => {
      if (!eventId) return;

      try {
        const event = await eventService.getEvent(eventId);
        setDebugInfo({
          eventId,
          event,
          hasSessionCode: !!event?.sessionCode,
          sessionCode: event?.sessionCode,
        });
        setSessionCode(event?.sessionCode || null);

        // Test session validation
        if (event?.sessionCode) {
          const validatedEvent = await guestService.getEventBySessionCode(
            event.sessionCode
          );
          setDebugInfo((prev: any) => ({
            ...prev,
            validationTest: {
              sessionCode: event.sessionCode,
              validatedEvent,
              isValid: !!validatedEvent,
            },
          }));
        }
      } catch (error: any) {
        setDebugInfo({ error: error.message });
      }
    };

    debugSession();
  }, [eventId]);

  useEffect(() => {
    const fixSessionCode = async () => {
      if (!eventId) return;

      try {
        // Get current event
        const event = await eventService.getEvent(eventId);

        // If no session code or not active, activate it
        if (!event.sessionCode || event.status !== "active") {
          console.log("Activating event to generate session code...");
          await eventService.updateEvent(eventId, { status: "active" });

          // Refresh the event
          selectEvent(eventId);
        }
      } catch (error: any) {
        console.error("Error fixing session code:", error);
      }
    };

    fixSessionCode();
  }, [eventId]);

  if (!eventId) {
    return <Navigate to="/host" replace />;
  }

  const getScanUrl = () => {
    if (!sessionCode) return "";
    return `https://join.spevents.live/${sessionCode}/guest/camera`;
  };

  return (
    <div className="relative h-screen">
      <PhotoSlideshow eventId={eventId} />

      {/* QR Code Panel */}
      {showQR && sessionCode && (
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
              Code: {sessionCode}
            </div>
          </div>
        </div>
      )}

      {/* Show QR button when hidden */}
      {!showQR && sessionCode && (
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
