// File: src/components/create-event/EventDetailsStep.tsx

import { useState } from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { EventData, colors } from "@/types/eventTypes";

// Simple components for missing shadcn components
const Popover = ({ children }: { children: React.ReactNode }) => (
  <div className="relative">{children}</div>
);

const PopoverTrigger = ({
  children,
}: {
  asChild?: boolean;
  children: React.ReactNode;
}) => <div>{children}</div>;

const PopoverContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
  align?: string;
}) => (
  <div
    className={`absolute z-50 bg-white border rounded-lg shadow-lg p-4 ${
      className || ""
    }`}
  >
    {children}
  </div>
);

const Calendar = ({
  selected,
  onSelect,
}: {
  mode: string;
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  captionLayout?: string;
}) => {
  return (
    <div className="relative">
      <input
        type="date"
        value={selected ? selected.toISOString().split("T")[0] : ""}
        onChange={(e) =>
          onSelect(e.target.value ? new Date(e.target.value) : undefined)
        }
        className="w-full p-2 border rounded"
        min={new Date().toISOString().split("T")[0]}
      />
    </div>
  );
};

const formatDate = (date: Date, format: string): string => {
  if (format === "PPP") {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (format === "yyyy-MM-dd") {
    return date.toISOString().split("T")[0];
  }

  return date.toLocaleDateString();
};

interface EventDetailsStepProps {
  eventData: EventData;
  setEventData: React.Dispatch<React.SetStateAction<EventData>>;
}

export function EventDetailsStep({
  eventData,
  setEventData,
}: EventDetailsStepProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [eventDuration, setEventDuration] = useState([4]);

  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(":");
    const hour = Number.parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration * 60;
    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMins
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <Label
            className="text-sm font-medium"
            style={{ color: colors.green }}
          >
            Event Name *
          </Label>
          <Input
            placeholder="e.g., Sarah & Mike's Wedding"
            value={eventData.name}
            onChange={(e) =>
              setEventData((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            className="mt-2"
            style={{
              borderColor: `${colors.lightGreen}30`,
              backgroundColor: colors.eggshell,
            }}
          />
        </div>

        <div>
          <Label
            className="text-sm font-medium"
            style={{ color: colors.green }}
          >
            Date *
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal mt-2 bg-transparent"
                style={{
                  borderColor: `${colors.lightGreen}30`,
                  backgroundColor: colors.eggshell,
                }}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  formatDate(selectedDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setEventData((prev) => ({
                    ...prev,
                    date: date ? formatDate(date, "yyyy-MM-dd") : "",
                  }));
                }}
                captionLayout="dropdown"
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label
            className="text-sm font-medium"
            style={{ color: colors.green }}
          >
            Event Duration
          </Label>
          <div className="mt-2 space-y-3">
            <div className="flex items-center gap-4">
              <Clock className="w-4 h-4" style={{ color: colors.green }} />
              <span
                className="text-sm font-medium"
                style={{ color: colors.darkGreen }}
              >
                {formatTime(eventData.startTime)} -{" "}
                {formatTime(
                  calculateEndTime(eventData.startTime, eventDuration[0]),
                )}
              </span>
            </div>
            <div className="space-y-2">
              <div
                className="flex justify-between text-sm"
                style={{ color: colors.darkGreen }}
              >
                <span>Duration: {eventDuration[0]} hours</span>
                <span>1h - 12h</span>
              </div>
              <Slider
                value={eventDuration}
                onValueChange={(value) => {
                  setEventDuration(value);
                  setEventData((prev) => ({
                    ...prev,
                    duration: value[0],
                  }));
                }}
                max={12}
                min={1}
                step={0.5}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label
            className="text-sm font-medium"
            style={{ color: colors.green }}
          >
            Location
          </Label>
          <Input
            placeholder="e.g., Grand Ballroom, City Hall"
            value={eventData.location}
            onChange={(e) =>
              setEventData((prev) => ({
                ...prev,
                location: e.target.value,
              }))
            }
            className="mt-2"
            style={{
              borderColor: `${colors.lightGreen}30`,
              backgroundColor: colors.eggshell,
            }}
          />
        </div>

        <div>
          <Label
            className="text-sm font-medium"
            style={{ color: colors.green }}
          >
            Description
          </Label>
          <Textarea
            placeholder="Tell your guests about the event..."
            value={eventData.description}
            onChange={(e) =>
              setEventData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="mt-2"
            rows={3}
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
