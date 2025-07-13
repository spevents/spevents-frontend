// src/pages/SlideshowQRCode.tsx

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useSession } from "@/contexts/SessionContext";
import { eventService } from "@/services/api";

export default function SlideshowQRCode() {
  const eventId = import.meta.env.VITE_EVENT_ID;
  const { isValidSession } = useSession();
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Get the session code for this event
  useEffect(() => {
    const getEventSessionCode = async () => {
      if (!eventId) {
        setLoading(false);
        return;
      }

      try {
        const event = await eventService.getEvent(eventId);
        if (event && event.sessionCode) {
          setSessionCode(event.sessionCode);
        }
      } catch (error) {
        console.error("Error getting event session code:", error);
      } finally {
        setLoading(false);
      }
    };

    getEventSessionCode();
  }, [eventId]);

  // Validate session
  useEffect(() => {
    const validateSession = async () => {
      if (eventId) {
        const isValid = await isValidSession(eventId);
        if (!isValid) {
          console.error("Invalid session");
        }
      }
    };
    validateSession();
  }, [eventId, isValidSession]);

  const getScanUrl = () => {
    if (!sessionCode) return "";
    // Use the sessionCode instead of the full eventId
    return `https://join.spevents.live/${sessionCode}/guest/camera`;
  };

  if (loading) {
    return (
      <div className="flex px-4 py-3 justify-end">
        <div className="bg-white rounded-lg overflow-hidden flex flex-col">
          <div className="bg-[#101827] w-full flex items-center justify-center px-6 py-2">
            <span className="text-white text-sm">Loading...</span>
          </div>
          <div className="w-full flex items-center justify-center p-3">
            <div className="w-32 h-32 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!eventId || !sessionCode) {
    return null;
  }

  return (
    <div className="flex px-4 py-3 justify-end">
      <div className="bg-white rounded-lg overflow-hidden flex flex-col">
        <div className="bg-[#101827] w-full flex items-center justify-center px-6 py-2">
          <span className="text-white text-sm">Scan to Join</span>
        </div>
        <div className="w-full flex items-center justify-center p-3">
          <QRCodeSVG
            id="event-qr-code"
            value={getScanUrl()}
            size={128}
            level="H"
          />
        </div>
        {/* Debug info - remove in production */}
        <div className="px-3 pb-2 text-xs text-gray-500">
          Code: {sessionCode}
        </div>
      </div>
    </div>
  );
}
