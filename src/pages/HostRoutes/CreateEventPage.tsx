// File: src/pages/HostRoutes/CreateEventPage.tsx

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  Users,
  Palette,
  Settings,
  Copy,
  Check,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/create-event/Header";
import { ProgressBar } from "@/components/create-event/ProgressBar";
import { EventDetailsStep } from "@/components/create-event/EventDetailsStep";
import { GuestSettingsStep } from "@/components/create-event/GuestSettingsStep";
import { DisplayViewsStep } from "@/components/create-event/DisplayViewsStep/DisplayViewsStep";
import { FinalSettingsStep } from "@/components/create-event/FinalSettingsStep";
import { Navigation } from "@/components/create-event/Navigation";
import { EventData, colors, Step } from "@/types/eventTypes";
import { useEventContext } from "@/contexts/EventContext";

const icons = [CalendarIcon, Users, Palette, Settings];

export function CreateEventPage() {
  const navigate = useNavigate();
  const {
    createEvent,
    selectEvent,
    isLoading: contextLoading,
  } = useEventContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDate, _setSelectedDate] = useState<Date>();
  const [eventData, setEventData] = useState<EventData>({
    name: "",
    date: "",
    startTime: "19:00", // Default 7pm
    endTime: "23:00", // Default 11pm
    duration: 4,
    location: "",
    description: "",
    expectedGuests: "",
    theme: "modern",
    allowDownloads: true,
    moderatePhotos: false,
    customLink: "",
    sessionCode: "",
    colors: {
      primary: colors.green,
      secondary: colors.lightGreen,
    },
    customColors: {
      primary: "#22c55e", // Default green
      secondary: "#86efac", // Default light green
    },
    slideshowViews: [
      {
        id: 1,
        name: "Main Display",
        type: "slideshow",
        preset: "classic",
        isDefault: true,
      },
    ],
  });

  // Get active colors based on theme selection
  const getActiveColors = () => {
    if (eventData.theme === "custom") {
      return {
        primary: eventData.customColors.primary,
        secondary: eventData.customColors.secondary,
      };
    }
    return eventData.colors;
  };

  const activeColors = getActiveColors();
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSessionCode, setCopiedSessionCode] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<any>(null);

  const steps: Step[] = [
    {
      title: "Event Details",
      subtitle: "Tell us about your event",
      date: "test",
    },
    {
      title: "Guest Settings",
      subtitle: "Configure guest permissions",
      date: "test",
    },
    {
      title: "Display Views",
      subtitle: "Customize slideshow displays",
      date: "test",
    },
    {
      title: "Final Settings",
      subtitle: "Review and launch",
      date: "test",
    },
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - create the event with basic data, store advanced settings separately
      setIsLoading(true);
      try {
        const newEvent = await createEvent({
          name: eventData.name.trim(),
          description: eventData.description.trim() || "",
        });

        // Store advanced settings in localStorage until backend supports them
        const advancedData = {
          eventId: newEvent.id,
          date: eventData.date,
          startTime: eventData.startTime,
          endTime: eventData.endTime,
          location: eventData.location.trim(),
          expectedGuests: eventData.expectedGuests,
          theme: eventData.theme,
          allowDownloads: eventData.allowDownloads,
          moderatePhotos: eventData.moderatePhotos,
          customLink: eventData.customLink.trim(),
          colors: eventData.colors,
          customColors: eventData.customColors,
          slideshowViews: eventData.slideshowViews,
        };

        localStorage.setItem(
          `event-advanced-${newEvent.id}`,
          JSON.stringify(advancedData),
        );

        // Store the created event to show session code
        setCreatedEvent(newEvent);
        selectEvent(newEvent.id);

        console.log(
          "Advanced event created with session code:",
          newEvent.sessionCode,
        );
      } catch (error) {
        console.error("Failed to create advanced event:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      navigate("/host/dashboard");
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const copySessionCode = async () => {
    if (createdEvent?.sessionCode) {
      try {
        await navigator.clipboard.writeText(createdEvent.sessionCode);
        setCopiedSessionCode(true);
        setTimeout(() => setCopiedSessionCode(false), 2000);
      } catch (err) {
        console.error("Failed to copy session code:", err);
      }
    }
  };

  const proceedToGallery = () => {
    if (createdEvent) {
      navigate(`/host/event/${createdEvent.id}/gallery`);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <EventDetailsStep eventData={eventData} setEventData={setEventData} />
        );
      case 1:
        return (
          <GuestSettingsStep
            eventData={eventData}
            setEventData={setEventData}
          />
        );
      case 2:
        return (
          <>
            <DisplayViewsStep
              eventData={eventData}
              setEventData={setEventData}
            />

            {/* Custom Color Picker Section */}
            {eventData.theme === "custom" && (
              <div
                className="mt-6 p-6 border rounded-xl"
                style={{
                  borderColor: `${activeColors.primary}30`,
                  backgroundColor: `${activeColors.secondary}10`,
                }}
              >
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: colors.darkGreen }}
                >
                  Custom Color Theme
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: colors.green }}
                    >
                      Primary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={eventData.customColors.primary}
                        onChange={(e) =>
                          setEventData((prev) => ({
                            ...prev,
                            customColors: {
                              ...prev.customColors,
                              primary: e.target.value,
                            },
                          }))
                        }
                        className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={eventData.customColors.primary}
                        onChange={(e) =>
                          setEventData((prev) => ({
                            ...prev,
                            customColors: {
                              ...prev.customColors,
                              primary: e.target.value,
                            },
                          }))
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: colors.green }}
                    >
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={eventData.customColors.secondary}
                        onChange={(e) =>
                          setEventData((prev) => ({
                            ...prev,
                            customColors: {
                              ...prev.customColors,
                              secondary: e.target.value,
                            },
                          }))
                        }
                        className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={eventData.customColors.secondary}
                        onChange={(e) =>
                          setEventData((prev) => ({
                            ...prev,
                            customColors: {
                              ...prev.customColors,
                              secondary: e.target.value,
                            },
                          }))
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="mt-4 p-3 rounded-lg"
                  style={{ backgroundColor: `${activeColors.primary}10` }}
                >
                  <p className="text-sm" style={{ color: colors.green }}>
                    💡 Preview: Your custom colors are being applied to the
                    interface elements above.
                  </p>
                </div>
              </div>
            )}
          </>
        );
      case 3:
        return (
          <FinalSettingsStep
            eventData={eventData}
            selectedDate={selectedDate}
          />
        );
      default:
        return null;
    }
  };

  // Check required fields: Event Name, Date, Start Time, End Time
  const isNextDisabled =
    currentStep === 0 &&
    (!eventData.name ||
      !eventData.date ||
      !eventData.startTime ||
      !eventData.endTime);

  // Use loading state from context or local state
  const loading = isLoading || contextLoading;

  // Show success screen with session code after creation
  if (createdEvent) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: colors.eggshell }}
      >
        <Header />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border-0 p-8"
          >
            <div className="text-center mb-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${activeColors.primary}20` }}
              >
                <Check
                  className="w-8 h-8"
                  style={{ color: activeColors.primary }}
                />
              </div>
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: colors.darkGreen }}
              >
                "{createdEvent.name}" Created!
              </h2>
              <p style={{ color: colors.green }}>
                Your advanced event is ready with all custom settings applied.
              </p>
            </div>

            <div className="space-y-6">
              <div
                className="rounded-xl p-6 text-center"
                style={{ backgroundColor: `${activeColors.secondary}40` }}
              >
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: colors.darkGreen }}
                >
                  Guest Session Code
                </h3>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <code
                    className="text-3xl font-mono font-bold px-4 py-2 rounded-lg border-2 tracking-wider"
                    style={{
                      backgroundColor: "white",
                      borderColor: `${activeColors.primary}30`,
                      color: colors.darkGreen,
                    }}
                  >
                    {createdEvent.sessionCode}
                  </code>
                  <button
                    onClick={copySessionCode}
                    className="p-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: `${activeColors.primary}20`,
                      color: activeColors.primary,
                    }}
                    title="Copy session code"
                  >
                    {copiedSessionCode ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-sm" style={{ color: `${colors.green}B0` }}>
                  Share this code with guests so they can join your event
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4
                    className="font-semibold"
                    style={{ color: colors.darkGreen }}
                  >
                    Event Details
                  </h4>
                  <p style={{ color: colors.green }}>📅 {eventData.date}</p>
                  <p style={{ color: colors.green }}>
                    🕒 {eventData.startTime} - {eventData.endTime}
                  </p>
                  {eventData.location && (
                    <p style={{ color: colors.green }}>
                      📍 {eventData.location}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <h4
                    className="font-semibold"
                    style={{ color: colors.darkGreen }}
                  >
                    Settings Applied
                  </h4>
                  <p style={{ color: colors.green }}>
                    🎨 {eventData.theme} theme
                  </p>
                  <p style={{ color: colors.green }}>
                    📥 Downloads{" "}
                    {eventData.allowDownloads ? "allowed" : "disabled"}
                  </p>
                  <p style={{ color: colors.green }}>
                    🛡️ Moderation{" "}
                    {eventData.moderatePhotos ? "enabled" : "disabled"}
                  </p>
                </div>
              </div>

              <div
                className="border rounded-lg p-4"
                style={{
                  backgroundColor: `${activeColors.secondary}20`,
                  borderColor: `${activeColors.primary}30`,
                }}
              >
                <p className="text-sm" style={{ color: colors.green }}>
                  💡 <strong>Your custom colors are active:</strong> Primary and
                  secondary colors have been applied to your event interface.
                </p>
              </div>

              <button
                onClick={proceedToGallery}
                className="w-full py-3 px-4 rounded-xl text-white hover:shadow-lg transition-all"
                style={{
                  background: `linear-gradient(to right, ${activeColors.primary}, ${activeColors.secondary})`,
                }}
              >
                Go to Event Gallery
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.eggshell }}>
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressBar currentStep={currentStep} totalSteps={steps.length} />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: activeColors.primary }}
                  >
                    {(() => {
                      const IconComponent = icons[currentStep];
                      return <IconComponent className="w-6 h-6 text-white" />;
                    })()}
                  </div>
                  <div>
                    <CardTitle
                      className="text-2xl"
                      style={{ color: activeColors.primary }}
                    >
                      {steps[currentStep].title}
                    </CardTitle>
                    <CardDescription style={{ color: colors.darkGreen }}>
                      {steps[currentStep].subtitle}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {renderStepContent()}

                <Navigation
                  currentStep={currentStep}
                  steps={steps}
                  onNext={handleNext}
                  onBack={handleBack}
                  isNextDisabled={isNextDisabled}
                  isLoading={loading}
                />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
