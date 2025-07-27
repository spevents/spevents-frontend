// File: src/components/DebugPanel.tsx

import { useState } from "react";
import { useEvent } from "@/contexts/EventContext";

interface DebugPanelProps {
  eventData?: any;
  isCreating?: boolean;
  error?: string | null;
}

export function DebugPanel({ eventData, isCreating, error }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { events, currentEvent, isLoading, error: contextError } = useEvent();

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-red-600 text-white px-3 py-2 rounded text-sm font-mono"
        >
          DEBUG
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black text-green-400 p-4 rounded-lg shadow-lg font-mono text-xs max-w-md max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-yellow-400 font-bold">Debug Panel</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-red-400 hover:text-red-300"
        >
          ×
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <div className="text-yellow-400">Context State:</div>
          <div>Events Count: {events.length}</div>
          <div>Is Loading: {isLoading ? "YES" : "NO"}</div>
          <div>Context Error: {contextError || "None"}</div>
          <div>Current Event: {currentEvent?.id || "None"}</div>
        </div>

        <div>
          <div className="text-yellow-400">Creation State:</div>
          <div>Is Creating: {isCreating ? "YES" : "NO"}</div>
          <div>Creation Error: {error || "None"}</div>
        </div>

        <div>
          <div className="text-yellow-400">Environment:</div>
          <div>BYPASS_AUTH: {import.meta.env.VITE_BYPASS_AUTH || "false"}</div>
          <div>NODE_ENV: {import.meta.env.NODE_ENV || "development"}</div>
        </div>

        {eventData && (
          <div>
            <div className="text-yellow-400">Event Data:</div>
            <div className="text-xs bg-gray-800 p-2 rounded max-h-32 overflow-auto">
              <pre>{JSON.stringify(eventData, null, 1)}</pre>
            </div>
          </div>
        )}

        <div>
          <div className="text-yellow-400">Recent Events:</div>
          {events.slice(0, 3).map((event) => (
            <div key={event.id} className="text-xs">
              {event.id}: {event.name}
            </div>
          ))}
        </div>

        <div>
          <div className="text-yellow-400">Actions:</div>
          <button
            onClick={() =>
              console.log("Full state:", {
                events,
                currentEvent,
                isLoading,
                contextError,
                eventData,
              })
            }
            className="bg-blue-600 text-white px-2 py-1 rounded mr-2 text-xs"
          >
            Log State
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-2 py-1 rounded text-xs"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}
