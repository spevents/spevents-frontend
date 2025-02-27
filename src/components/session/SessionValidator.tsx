// src/components/session/SessionValidator.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSession } from "../../contexts/SessionContext";

interface SessionValidatorProps {
  children: React.ReactNode;
}

export function SessionValidator({ children }: SessionValidatorProps) {
  const { eventId } = useParams();
  const { isValidSession } = useSession();
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      // Get environment variable
      const envEventId = import.meta.env.VITE_EVENT_ID;

      // Store debug info
      const debug = {
        eventId,
        envEventId,
        eventIdType: typeof eventId,
        // envEventIdType: typeof envEventId,
        // eventIdLength: eventId?.length,
        // envEventIdLength: envEventId?.length,
        exact: eventId === envEventId,
      };

      setDebugInfo(debug);
      console.log("Session Debug Info:", debug);

      if (!eventId) {
        console.log("No eventId provided");
        setIsValid(false);
        setIsChecking(false);
        return;
      }

      try {
        // Decode URI component in case of special characters
        const decodedEventId = decodeURIComponent(eventId);
        const valid = await isValidSession(decodedEventId);
        console.log("Session validation result:", {
          decodedEventId,
          valid,
          envMatch: decodedEventId === envEventId,
        });
        setIsValid(valid);
      } catch (error) {
        console.error("Session validation error:", error);
        setIsValid(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkSession();
  }, [eventId, isValidSession]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Invalid Session</h1>
          <p className="text-white/60">
            This session code is not valid or has expired. Please scan a valid
            QR code to join an event.
          </p>
          <button
            onClick={() => {
              // Show both the typical debug info and our enhanced debug info
              console.log("Enhanced Debug Info:", debugInfo);
              alert(
                JSON.stringify(
                  {
                    eventId,
                    isValid,
                    isChecking,
                    ...debugInfo,
                  },
                  null,
                  2,
                ),
              );
            }}
            className="px-6 py-3 bg-white/10 text-white rounded-full hover:bg-white/20"
          >
            Debug Info
          </button>
          <a
            href="/"
            className="block px-6 py-3 bg-white/10 text-white rounded-full hover:bg-white/20"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
