// File: src/components/create-event/GuestSettingsStep.tsx

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EventData, colors } from "@/types/eventTypes";

// Simple Select components
const Select = ({
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}) => {
  return <div className="relative">{children}</div>;
};

const SelectTrigger = ({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={`w-full p-2 border rounded flex items-center justify-between cursor-pointer ${
      className || ""
    }`}
    style={style}
  >
    {children}
  </div>
);

const SelectValue = ({ placeholder }: { placeholder: string }) => (
  <span className="text-gray-500">{placeholder}</span>
);

const SelectContent = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute top-full left-0 right-0 bg-white border rounded mt-1 shadow-lg z-10">
    {children}
  </div>
);

const SelectItem = ({
  children,
  onClick,
}: {
  value: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <div className="p-2 hover:bg-gray-100 cursor-pointer" onClick={onClick}>
    {children}
  </div>
);

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
      <div>
        <Label className="text-sm font-medium" style={{ color: colors.green }}>
          Expected Number of Guests
        </Label>
        <Select
          value={eventData.expectedGuests}
          onValueChange={(value) =>
            setEventData((prev) => ({
              ...prev,
              expectedGuests: value,
            }))
          }
        >
          <SelectTrigger
            className="mt-2"
            style={{
              borderColor: `${colors.lightGreen}30`,
              backgroundColor: colors.eggshell,
            }}
          >
            <SelectValue placeholder="Select guest count" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-25">1-25 guests</SelectItem>
            <SelectItem value="26-50">26-50 guests</SelectItem>
            <SelectItem value="51-100">51-100 guests</SelectItem>
            <SelectItem value="101-200">101-200 guests</SelectItem>
            <SelectItem value="200+">200+ guests</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium" style={{ color: colors.green }}>
          Session Code
        </Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={eventData.sessionCode}
            onChange={(e) =>
              setEventData((prev) => ({
                ...prev,
                sessionCode: e.target.value.toUpperCase(),
              }))
            }
            placeholder="AUTO-GENERATED"
            className="flex-1"
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
        <div className="flex mt-2">
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
    </div>
  );
}
