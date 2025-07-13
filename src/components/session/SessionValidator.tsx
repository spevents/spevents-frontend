// src/components/session/SessionValidator.tsx

import React, { useEffect, useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import { guestService } from "@/services/api";

interface SessionValidatorProps {
  children: React.ReactNode;
  sessionCode?: string;
}

export const SessionValidator: React.FC<SessionValidatorProps> = ({
  children,
  sessionCode,
}) => {
  const { setCurrentEvent, currentEvent } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateSession = async () => {
      if (!sessionCode) {
        console.error(`❌ SessionValidator: No session code provided`);
        setError("No session code provided");
        setLoading(false);
        return;
      }

      try {
        console.log(
          `🔍 SessionValidator: Validating session code: ${sessionCode}`,
        );
        setLoading(true);
        setError(null);

        // Log current state for debugging
        console.log(`📱 Current URL: ${window.location.href}`);
        console.log(`🔐 Session code to validate: ${sessionCode}`);

        const event = await guestService.getEventBySessionCode(sessionCode);

        console.log(`✅ SessionValidator: Event found:`, event);
        console.log(
          `📊 Event details: ID=${event.id}, Status=${event.status}, PhotoCount=${event.photoCount}`,
        );

        setCurrentEvent(event);
        setLoading(false);
      } catch (err: any) {
        console.error(`❌ SessionValidator: Error validating session:`, err);
        console.error(`🔍 Error details: ${err.message}`);

        // Add more detailed error logging for mobile debugging
        if (err.message.includes("404")) {
          console.error(`🚫 Session not found: ${sessionCode}`);
          setError(`Session "${sessionCode}" not found or inactive`);
        } else if (err.message.includes("Network")) {
          console.error(`🌐 Network error when validating session`);
          setError(`Network error. Please check your connection.`);
        } else {
          console.error(`🔥 Unexpected error:`, err);
          setError(`Error loading event: ${err.message}`);
        }

        setLoading(false);
      }
    };

    validateSession();
  }, [sessionCode, setCurrentEvent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
          <p className="text-xs text-gray-400 mt-2">Session: {sessionCode}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="text-center bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Session Error
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-400 mb-4">Code: {sessionCode}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          >
            Try Again
          </button>
          <div className="mt-4 text-xs text-gray-400">
            <p>Debug info logged to console</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentEvent) {
    console.error(`❌ SessionValidator: No current event set after validation`);
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">No event data available</p>
        </div>
      </div>
    );
  }

  console.log(
    `✅ SessionValidator: Rendering children with event:`,
    currentEvent.id,
  );
  return <>{children}</>;
};

// Export the useActualEventId hook for components that need it
export { useActualEventId } from "@/contexts/SessionContext";
