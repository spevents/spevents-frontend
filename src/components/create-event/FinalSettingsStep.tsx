// File: src/components/create-event/FinalSettingsStep.tsx

import {
  QrCode,
  FileText,
  CalendarIcon,
  MapPin,
  Users,
  Palette,
  Eye,
  Grid3X3,
  Layers,
  RotateCcw,
  Shapes,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventData, colors } from "@/types/eventTypes";

const Badge = ({
  children,
  variant,
  className,
}: {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}) => (
  <span
    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 ${
      className || ""
    }`}
  >
    {children}
  </span>
);

const Separator = ({ className }: { className?: string }) => (
  <hr className={`border-t border-gray-200 ${className || ""}`} />
);

interface FinalSettingsStepProps {
  eventData: EventData;
  selectedDate?: Date;
}

export function FinalSettingsStep({
  eventData,
  selectedDate,
}: FinalSettingsStepProps) {
  const formatDate = (date: Date, format: string): string => {
    if (format === "EEEE, MMMM do, yyyy") {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return date.toLocaleDateString();
  };

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

  const slideshowPresets = [
    {
      id: "classic",
      name: "Classic Grid",
      description: "Traditional photo grid layout",
      icon: Grid3X3,
    },
    {
      id: "mosaic",
      name: "Dynamic Mosaic",
      description: "Mixed size photo arrangement",
      icon: Layers,
    },
    {
      id: "carousel",
      name: "Rotating Carousel",
      description: "Continuous photo rotation",
      icon: RotateCcw,
    },
    {
      id: "collage",
      name: "Creative Collage",
      description: "Artistic photo collage",
      icon: Shapes,
    },
  ];

  return (
    <div className="space-y-6">
      <Card
        className="border-2"
        style={{
          backgroundColor: `${colors.lightGreen}10`,
          borderColor: `${colors.lightGreen}40`,
        }}
      >
        <CardHeader>
          <CardTitle
            className="text-2xl flex items-center gap-3"
            style={{ color: colors.green }}
          >
            <QrCode className="w-6 h-6" />
            Event Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Event Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText
                  className="w-5 h-5 mt-0.5"
                  style={{ color: colors.green }}
                />
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: colors.darkGreen }}
                  >
                    Event Name
                  </p>
                  <p
                    className="text-lg font-semibold"
                    style={{ color: colors.green }}
                  >
                    {eventData.name || "Untitled Event"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarIcon
                  className="w-5 h-5 mt-0.5"
                  style={{ color: colors.green }}
                />
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: colors.darkGreen }}
                  >
                    Date & Time
                  </p>
                  <p
                    className="text-lg font-semibold"
                    style={{ color: colors.green }}
                  >
                    {selectedDate
                      ? formatDate(selectedDate, "EEEE, MMMM do, yyyy")
                      : "Not set"}
                  </p>
                  <p className="text-sm" style={{ color: colors.darkGreen }}>
                    {formatTime(eventData.startTime)} -{" "}
                    {formatTime(
                      calculateEndTime(eventData.startTime, eventData.duration),
                    )}{" "}
                    ({eventData.duration}h)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin
                  className="w-5 h-5 mt-0.5"
                  style={{ color: colors.green }}
                />
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: colors.darkGreen }}
                  >
                    Location
                  </p>
                  <p
                    className="text-lg font-semibold"
                    style={{ color: colors.green }}
                  >
                    {eventData.location || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Users
                  className="w-5 h-5 mt-0.5"
                  style={{ color: colors.green }}
                />
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: colors.darkGreen }}
                  >
                    Expected Guests
                  </p>
                  <p
                    className="text-lg font-semibold"
                    style={{ color: colors.green }}
                  >
                    {eventData.expectedGuests || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <QrCode
                  className="w-5 h-5 mt-0.5"
                  style={{ color: colors.green }}
                />
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: colors.darkGreen }}
                  >
                    Session Code
                  </p>
                  <p
                    className="text-lg font-semibold font-mono"
                    style={{ color: colors.green }}
                  >
                    {eventData.sessionCode || "Will be generated"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Palette
                  className="w-5 h-5 mt-0.5"
                  style={{ color: colors.green }}
                />
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: colors.darkGreen }}
                  >
                    Theme
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-1">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{
                          backgroundColor: eventData.colors.primary,
                        }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{
                          backgroundColor: eventData.colors.secondary,
                        }}
                      />
                    </div>
                    <p
                      className="text-lg font-semibold capitalize"
                      style={{ color: colors.green }}
                    >
                      {eventData.theme}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Display Views */}
          <div>
            <h4
              className="text-lg font-semibold mb-3 flex items-center gap-2"
              style={{ color: colors.green }}
            >
              <Eye className="w-5 h-5" />
              Display Views ({eventData.slideshowViews.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {eventData.slideshowViews.map((view) => {
                const preset = slideshowPresets.find(
                  (p) => p.id === view.preset,
                );
                const IconComponent = preset?.icon || Grid3X3;
                return (
                  <Card
                    key={view.id}
                    className="border"
                    style={{
                      borderColor: `${colors.lightGreen}30`,
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent
                          className="w-4 h-4"
                          style={{ color: colors.green }}
                        />
                        <p
                          className="font-medium"
                          style={{ color: colors.green }}
                        >
                          {view.name}
                        </p>
                        {view.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p
                        className="text-xs"
                        style={{ color: colors.darkGreen }}
                      >
                        {preset?.name} - {preset?.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {eventData.description && (
            <>
              <Separator />
              <div>
                <h4
                  className="text-lg font-semibold mb-2"
                  style={{ color: colors.green }}
                >
                  Description
                </h4>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: colors.darkGreen }}
                >
                  {eventData.description}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <QrCode className="w-6 h-6 text-blue-600" />
            <h4 className="text-lg font-semibold text-blue-800">Next Steps</h4>
          </div>
          <p className="text-blue-700 mb-4">
            After creating your event, you'll be able to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-blue-700">
            <li>Customize each slideshow view layout</li>
            <li>Add photo upload pins to your displays</li>
            <li>Generate QR codes for guests</li>
            <li>Test the guest experience</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
