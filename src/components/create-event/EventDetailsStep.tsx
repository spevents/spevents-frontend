// File: src/components/create-event/EventDetailsStep.tsx

import { useState, useEffect, useRef, RefObject } from "react";
import { CalendarIcon, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EventData, colors } from "@/types/eventTypes";

function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

const Popover = ({ children }: { children: React.ReactNode }) => (
  <div className="relative">{children}</div>
);

const PopoverTrigger = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => <div onClick={onClick}>{children}</div>;

const PopoverContent = ({
  children,
  className,
  open,
}: {
  children: React.ReactNode;
  className?: string;
  open?: boolean;
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`absolute z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-0 mt-2 ${
          className || ""
        }`}
        style={{
          backgroundColor: colors.eggshell,
          borderColor: colors.lightGreen + "40",
        }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

interface LocationSuggestion {
  display_name: string;
  place_id: string;
  lat: string;
  lon: string;
}

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
  const [eventDuration, setEventDuration] = useState([eventData.duration || 4]);
  const [startTime, setStartTime] = useState<Date>(() => {
    const [hours, minutes] = (eventData.startTime || "19:00").split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date;
  });
  const [endTime, setEndTime] = useState<Date>(() => {
    const [hours, minutes] = (eventData.startTime || "19:00").split(":");
    const date = new Date();
    const durationMinutes = (eventData.duration || 4) * 60;
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    date.setTime(date.getTime() + durationMinutes * 60 * 1000);
    return date;
  });

  // Popover states
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  // Location state
  const [locationSuggestions, setLocationSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [locationQuery, setLocationQuery] = useState(eventData.location || "");
  const locationTimeoutRef = useRef<NodeJS.Timeout>();

  // Refs
  const startTimeRef = useRef<HTMLDivElement>(null);
  const endTimeRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  // Click outside handlers
  useOnClickOutside(startTimeRef, () => setIsStartTimeOpen(false));
  useOnClickOutside(endTimeRef, () => setIsEndTimeOpen(false));
  useOnClickOutside(calendarRef, () => setIsCalendarOpen(false));
  useOnClickOutside(locationRef, () => setIsLocationOpen(false));

  const handleTimeChange = (
    timeType: "start" | "end",
    type: "hour" | "minute" | "ampm",
    value: string,
  ) => {
    const currentTime = timeType === "start" ? startTime : endTime;
    let newTime = new Date(currentTime);

    if (type === "hour") {
      const hour = parseInt(value, 10);
      const currentHour = newTime.getHours();
      if (currentHour >= 12) {
        newTime.setHours(hour === 12 ? 12 : hour + 12);
      } else {
        newTime.setHours(hour === 12 ? 0 : hour);
      }
    } else if (type === "minute") {
      newTime.setMinutes(parseInt(value, 10));
    } else if (type === "ampm") {
      const hours = newTime.getHours();
      if (value === "AM" && hours >= 12) {
        newTime.setHours(hours - 12);
      } else if (value === "PM" && hours < 12) {
        newTime.setHours(hours + 12);
      }
    }

    if (timeType === "start") {
      setStartTime(newTime);
      const newEndTime = new Date(newTime);
      const durationMinutes = eventDuration[0] * 60;
      newEndTime.setTime(newTime.getTime() + durationMinutes * 60 * 1000);
      setEndTime(newEndTime);
    } else {
      setEndTime(newTime);
      const durationHours =
        (newTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      if (durationHours > 0 && durationHours <= 12) {
        setEventDuration([Math.round(durationHours * 2) / 2]);
      }
    }
  };

  useEffect(() => {
    const startTimeString = `${startTime
      .getHours()
      .toString()
      .padStart(2, "0")}:${startTime.getMinutes().toString().padStart(2, "0")}`;

    setEventData((prev) => ({
      ...prev,
      startTime: startTimeString,
      duration: eventDuration[0],
    }));
  }, [startTime, endTime, eventDuration, setEventData]);

  const handleDurationChange = (newDuration: number[]) => {
    setEventDuration(newDuration);
    const newEndTime = new Date(startTime);
    const durationMinutes = newDuration[0] * 60;
    newEndTime.setTime(startTime.getTime() + durationMinutes * 60 * 1000);
    setEndTime(newEndTime);
  };

  const formatTimeDisplay = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
          query,
        )}`,
      );
      const results = await response.json();
      setLocationSuggestions(results);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      setLocationSuggestions([]);
    }
  };

  useEffect(() => {
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }

    locationTimeoutRef.current = setTimeout(() => {
      if (locationQuery !== eventData.location) {
        searchLocations(locationQuery);
      }
    }, 300);

    return () => {
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }
    };
  }, [locationQuery, eventData.location]);

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    const locationName = suggestion.display_name
      .split(",")
      .slice(0, 2)
      .join(",")
      .trim();
    setLocationQuery(locationName);
    setEventData((prev) => ({
      ...prev,
      location: locationName,
    }));
    setIsLocationOpen(false);
    setLocationSuggestions([]);
  };

  const TimePickerContent = ({
    time,
    timeType,
  }: {
    time: Date;
    timeType: "start" | "end";
  }) => (
    <div className="flex divide-x">
      <ScrollArea className="w-20 h-64">
        <div className="flex flex-col p-2">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
            <Button
              key={hour}
              size="sm"
              variant={time.getHours() % 12 === hour % 12 ? "default" : "ghost"}
              className="w-full mb-1 hover:bg-gray-200 hover:text-gray-900"
              onClick={() =>
                handleTimeChange(timeType, "hour", hour.toString())
              }
            >
              {hour}
            </Button>
          ))}
        </div>
      </ScrollArea>
      <ScrollArea className="w-20 h-64">
        <div className="flex flex-col p-2">
          {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
            <Button
              key={minute}
              size="sm"
              variant={time.getMinutes() === minute ? "default" : "ghost"}
              className="w-full mb-1 hover:bg-gray-200 hover:text-gray-900"
              onClick={() =>
                handleTimeChange(timeType, "minute", minute.toString())
              }
            >
              {minute.toString().padStart(2, "0")}
            </Button>
          ))}
        </div>
      </ScrollArea>
      <ScrollArea className="w-16 h-64">
        <div className="flex flex-col p-2">
          {["AM", "PM"].map((ampm) => (
            <Button
              key={ampm}
              size="sm"
              variant={
                (ampm === "AM" && time.getHours() < 12) ||
                (ampm === "PM" && time.getHours() >= 12)
                  ? "default"
                  : "ghost"
              }
              className="w-full mb-1 hover:bg-gray-200 hover:text-gray-900"
              onClick={() => handleTimeChange(timeType, "ampm", ampm)}
            >
              {ampm}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Row 1: Basic Info */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div
          className="bg-white rounded-xl p-6 border-2 shadow-sm"
          style={{
            borderColor: `${colors.lightGreen}40`,
            backgroundColor: colors.eggshell,
          }}
        >
          <Label
            className="text-lg font-semibold block mb-3"
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
            className="text-lg py-4 px-4 border-2 transition-all duration-300 focus:shadow-lg"
            style={{
              borderColor: `${colors.lightGreen}40`,
              backgroundColor: colors.eggshell,
              fontSize: "18px",
            }}
          />
        </div>

        <div
          ref={calendarRef}
          className="bg-white rounded-xl p-6 border-2 shadow-sm"
          style={{
            borderColor: `${colors.lightGreen}40`,
            backgroundColor: colors.eggshell,
          }}
        >
          <Label
            className="text-lg font-semibold block mb-3"
            style={{ color: colors.green }}
          >
            Date *
          </Label>
          <Popover>
            <PopoverTrigger onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal py-4 px-4 text-lg border-2 hover:text-sp_midgreen"
                style={{
                  borderColor: `${colors.lightGreen}40`,
                  backgroundColor: colors.eggshell,
                  fontSize: "18px",
                }}
              >
                <CalendarIcon className="mr-3 h-5 w-5" />
                {selectedDate ? (
                  formatDate(selectedDate, "PPP")
                ) : (
                  <span className="text-gray-500">Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" open={isCalendarOpen}>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setEventData((prev) => ({
                    ...prev,
                    date: date ? formatDate(date, "yyyy-MM-dd") : "",
                  }));
                  setIsCalendarOpen(false);
                }}
                className="rounded-lg border-0"
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
                style={{ backgroundColor: colors.eggshell }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </motion.div>

      {/* Row 2: Time Controls */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl p-6 border-2 shadow-sm"
        style={{
          borderColor: `${colors.lightGreen}40`,
          backgroundColor: colors.eggshell,
        }}
      >
        <h3
          className="text-xl font-semibold mb-6"
          style={{ color: colors.green }}
        >
          Event Timing *
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
          <div ref={startTimeRef}>
            <Label
              className="text-lg font-semibold block mb-3"
              style={{ color: colors.green }}
            >
              Start Time
            </Label>
            <Popover>
              <PopoverTrigger
                onClick={() => setIsStartTimeOpen(!isStartTimeOpen)}
              >
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal py-4 px-4 text-lg border-2 hover:text-sp_midgreen"
                  style={{
                    borderColor: `${colors.lightGreen}40`,
                    backgroundColor: colors.eggshell,
                    fontSize: "18px",
                  }}
                >
                  {formatTimeDisplay(startTime)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" open={isStartTimeOpen}>
                <TimePickerContent time={startTime} timeType="start" />
              </PopoverContent>
            </Popover>
          </div>

          <div ref={endTimeRef}>
            <Label
              className="text-lg font-semibold block mb-3"
              style={{ color: colors.green }}
            >
              End Time
            </Label>
            <Popover>
              <PopoverTrigger onClick={() => setIsEndTimeOpen(!isEndTimeOpen)}>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal py-4 px-4 text-lg border-2 hover:text-sp_midgreen"
                  style={{
                    borderColor: `${colors.lightGreen}40`,
                    backgroundColor: colors.eggshell,
                    fontSize: "18px",
                  }}
                >
                  {formatTimeDisplay(endTime)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" open={isEndTimeOpen}>
                <TimePickerContent time={endTime} timeType="end" />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label
              className="text-lg font-semibold block mb-3"
              style={{ color: colors.green }}
            >
              Duration: {eventDuration[0]}h
            </Label>
            <div className="space-y-3">
              <Slider
                value={eventDuration}
                onValueChange={handleDurationChange}
                max={8}
                min={1}
                step={0.5}
                className="w-full"
              />
              <div
                className="flex justify-between text-sm"
                style={{ color: colors.darkGreen }}
              >
                <span>1h</span>
                <span>8h</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Row 3: Location and Description */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div
          ref={locationRef}
          className="bg-white rounded-xl p-6 border-2 shadow-sm"
          style={{
            borderColor: `${colors.lightGreen}40`,
            backgroundColor: colors.eggshell,
          }}
        >
          <Label
            className="text-lg font-semibold block mb-3"
            style={{ color: colors.green }}
          >
            Location
          </Label>
          <div className="relative">
            <MapPin
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10"
              style={{ color: colors.green }}
            />
            <Input
              placeholder="e.g., Grand Ballroom, City Hall"
              value={locationQuery}
              onChange={(e) => {
                setLocationQuery(e.target.value);
                setIsLocationOpen(true);
              }}
              onFocus={() => {
                if (locationSuggestions.length > 0) {
                  setIsLocationOpen(true);
                }
              }}
              className="text-lg py-4 pl-12 pr-4 border-2 transition-all duration-300 focus:shadow-lg"
              style={{
                borderColor: `${colors.lightGreen}40`,
                backgroundColor: colors.eggshell,
                fontSize: "18px",
              }}
            />

            <AnimatePresence>
              {isLocationOpen && locationSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 w-full mt-2 bg-white border-2 rounded-xl shadow-xl overflow-hidden"
                  style={{
                    backgroundColor: colors.eggshell,
                    borderColor: colors.lightGreen + "40",
                  }}
                >
                  {locationSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.place_id}
                      className="px-4 py-3 cursor-pointer transition-colors duration-200 hover:bg-white border-b border-gray-200 last:border-b-0"
                      onClick={() => handleLocationSelect(suggestion)}
                      style={{ color: colors.darkGreen }}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin
                          className="h-4 w-4 flex-shrink-0"
                          style={{ color: colors.green }}
                        />
                        <span className="text-sm">
                          {suggestion.display_name
                            .split(",")
                            .slice(0, 3)
                            .join(", ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div
          className="bg-white rounded-xl p-6 border-2 shadow-sm"
          style={{
            borderColor: `${colors.lightGreen}40`,
            backgroundColor: colors.eggshell,
          }}
        >
          <Label
            className="text-lg font-semibold block mb-3"
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
            className="text-lg py-4 px-4 border-2 transition-all duration-300 focus:shadow-lg resize-none"
            rows={6}
            style={{
              borderColor: `${colors.lightGreen}40`,
              backgroundColor: colors.eggshell,
              fontSize: "16px",
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
