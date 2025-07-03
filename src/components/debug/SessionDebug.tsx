// src/components/debug/SessionDebug.tsx

import React, { useState, useEffect } from "react";
import { eventService } from "../../services/api";

interface SessionDebugProps {
  eventId: string;
}

export const SessionDebug: React.FC<SessionDebugProps> = ({ eventId }) => {
  const [event, setEvent] = useState<any>(null);
  const [sessionValidation, setSessionValidation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const debugSession = async () => {
      try {
        // Get event details
        const eventData = await eventService.getEvent(eventId);
        setEvent(eventData);

        // Test session code validation
        if (eventData?.sessionCode) {
          const sessionEvent = await eventService.getEventBySessionCode(
            eventData.sessionCode,
          );
          setSessionValidation({
            sessionCode: eventData.sessionCode,
            validationResult: sessionEvent,
            isValid: sessionEvent !== null,
          });
        }
      } catch (error: any) {
        console.error("Debug error:", error);
        setEvent({ error: error.message });
      } finally {
        setLoading(false);
      }
    };

    debugSession();
  }, [eventId]);

  if (loading) {
    return (
      <div className="p-4 bg-yellow-100 rounded">Loading debug info...</div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg space-y-4 text-sm">
      <h3 className="font-bold">Session Debug Info</h3>

      <div>
        <strong>Event ID:</strong> {eventId}
      </div>

      <div>
        <strong>Event Data:</strong>
        <pre className="bg-white p-2 rounded text-xs overflow-auto">
          {JSON.stringify(event, null, 2)}
        </pre>
      </div>

      {sessionValidation && (
        <div>
          <strong>Session Validation:</strong>
          <pre className="bg-white p-2 rounded text-xs overflow-auto">
            {JSON.stringify(sessionValidation, null, 2)}
          </pre>
        </div>
      )}

      {event?.sessionCode && (
        <div>
          <strong>Generated URLs:</strong>
          <div className="bg-white p-2 rounded">
            <div>
              QR URL: https://join.spevents.live/{event.sessionCode}
              /guest/camera
            </div>
            <div>
              Host URL: https://app.spevents.live/host/event/{eventId}/slideshow
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
