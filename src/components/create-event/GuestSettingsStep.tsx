// File: src/components/create-event/GuestSettingsStep.tsx

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EventData, colors } from "@/types/eventTypes";

interface GuestSettingsStepProps {
  eventData: EventData;
  setEventData: React.Dispatch<React.SetStateAction<EventData>>;
}

export function GuestSettingsStep({
  eventData,
  setEventData,
}: GuestSettingsStepProps) {
  const generateSessionCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setEventData((prev) => ({ ...prev, sessionCode: code }));
  };

  return (
    <div className="space-y-6">
      <div
        className="text-center p-6 rounded-lg"
        style={{ backgroundColor: `${colors.lightGreen}10` }}
      >
        <h3
          className="text-xl font-semibold mb-2"
          style={{ color: colors.green }}
        >
          Let's Set Up Your Event Access
        </h3>
        <p className="text-sm" style={{ color: colors.darkGreen }}>
          Configure how guests will join your event
        </p>
      </div>

      <div>
        <Label className="text-sm font-medium" style={{ color: colors.green }}>
          Session Code
        </Label>
        <p className="text-xs text-gray-600 mb-2">
          Guests will use this code to join your event
        </p>
        <div className="flex gap-2">
          <Input
            value={eventData.sessionCode}
            onChange={(e) =>
              setEventData((prev) => ({
                ...prev,
                sessionCode: e.target.value.toUpperCase(),
              }))
            }
            placeholder="AUTO-GENERATED"
            className="flex-1 text-center text-lg font-mono tracking-wider"
            style={{
              borderColor: `${colors.lightGreen}30`,
              backgroundColor: colors.eggshell,
            }}
          />
          <Button
            onClick={generateSessionCode}
            style={{ backgroundColor: colors.green }}
          >
            Generate
          </Button>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium" style={{ color: colors.green }}>
          Custom Link (Optional)
        </Label>
        <p className="text-xs text-gray-600 mb-2">
          Create a memorable URL for your event
        </p>
        <div className="flex">
          <span
            className="inline-flex items-center px-3 rounded-l-md border border-r-0 text-sm"
            style={{
              borderColor: `${colors.lightGreen}30`,
              backgroundColor: `${colors.lightGreen}10`,
              color: colors.darkGreen,
            }}
          >
            spevents.live/
          </span>
          <Input
            placeholder="your-event-name"
            value={eventData.customLink}
            onChange={(e) =>
              setEventData((prev) => ({
                ...prev,
                customLink: e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, ""),
              }))
            }
            className="rounded-l-none"
            style={{
              borderColor: `${colors.lightGreen}30`,
              backgroundColor: colors.eggshell,
            }}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">
              Guest count and final settings can be configured at the end
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Focus on creating your perfect slideshow experience first!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
