// src/components/session/SessionValidator.tsx
import { useEffect, useState, createContext, useContext } from "react";
import { useParams } from "react-router-dom";
import { useSession } from "../../contexts/SessionContext";
import { eventService } from "../../lib/eventService";

interface SessionValidatorProps {
  children: React.ReactNode;
}

// Create context to provide actual eventId to child components
const EventIdContext = createContext<string | null>(null);

export const useActualEventId = () => {
  return useContext(EventIdContext);
};

export function SessionValidator({ children }: SessionValidatorProps) {
  const { eventId: sessionCode } = useParams(); // This is actually sessionCode from URL
  const { isValidSession } = useSession();
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [actualEventId, setActualEventId] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      if (!sessionCode) {
        console.log("No sessionCode provided");
        setIsValid(false);
        setIsChecking(false);
        return;
      }

      try {
        console.log("Checking session for sessionCode:", sessionCode);

        // Get the actual event using sessionCode
        const event = await eventService.getEventBySessionCode(sessionCode);

        if (event) {
          console.log(
            "Found event:",
            event.id,
            "for sessionCode:",
            sessionCode,
          );
          setActualEventId(event.id);
          setIsValid(true);
        } else {
          console.log("No event found for sessionCode:", sessionCode);
          setIsValid(false);
        }
      } catch (error) {
        console.error("Session validation error:", error);
        setIsValid(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkSession();
  }, [sessionCode, isValidSession]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!isValid || !actualEventId) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Invalid Session</h1>
          <p className="text-white/60">
            This session code is not valid or has expired. Please scan a valid
            QR code to join an event.
          </p>
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

  return (
    <EventIdContext.Provider value={actualEventId}>
      {children}
    </EventIdContext.Provider>
  );
}
