// File: src/pages/HostRoutes/CreateEventPage.tsx

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CalendarIcon, Users, Palette, Settings } from "lucide-react";
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
import { useEvent } from "@/contexts/EventContext";
import { CreateEventData } from "@/types/event";

const icons = [CalendarIcon, Users, Palette, Settings];

export function CreateEventPage() {
  const navigate = useNavigate();
  const { createEvent, selectEvent } = useEvent();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDate, _setSelectedDate] = useState<Date>();
  const [isCreating, setIsCreating] = useState(false);

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

  // Add error state for UI display
  const [creationError, setCreationError] = useState<string | null>(null);

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
    console.log(
      "🔄 handleNext called, currentStep:",
      currentStep,
      "totalSteps:",
      steps.length,
    );

    if (currentStep < steps.length - 1) {
      console.log("➡️ Moving to next step:", currentStep + 1);
      setCurrentStep(currentStep + 1);
    } else {
      console.log("🎯 Final step reached, creating event...");
      // Final step - create the event with all advanced data
      await handleCreateEvent();
    }
  };

  const handleCreateEvent = async () => {
    console.log("🏗️ handleCreateEvent started");
    console.log("📋 Current eventData:", JSON.stringify(eventData, null, 2));

    // Clear previous errors
    setCreationError(null);

    // Validation check
    if (
      !eventData.name ||
      !eventData.date ||
      !eventData.startTime ||
      !eventData.endTime
    ) {
      console.error("❌ Validation failed:", {
        name: !!eventData.name,
        date: !!eventData.date,
        startTime: !!eventData.startTime,
        endTime: !!eventData.endTime,
      });
      const error =
        "Please fill in all required fields: Event Name, Date, Start Time, End Time";
      setCreationError(error);
      alert(error);
      return;
    }

    console.log("✅ Validation passed, starting creation...");
    setIsCreating(true);

    try {
      // Convert EventData to CreateEventData format
      const createData: CreateEventData = {
        name: eventData.name,
        description: eventData.description || "",
        date: eventData.date,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        duration: eventData.duration,
        location: eventData.location || "",
        expectedGuests: eventData.expectedGuests || "",
        theme: eventData.theme,
        allowDownloads: eventData.allowDownloads,
        moderatePhotos: eventData.moderatePhotos,
        customLink: eventData.customLink || "",
        colors: eventData.colors,
        slideshowViews: eventData.slideshowViews,
        liveMetrics: eventData.liveMetrics,
        venue3D: eventData.venue3D,
      };

      console.log(
        "🎯 Calling createEvent with advanced data:",
        JSON.stringify(createData, null, 2),
      );

      const newEvent = await createEvent(createData);

      console.log("✅ Advanced event created successfully:", newEvent);

      selectEvent(newEvent.id);
      console.log("🎯 Event selected, navigating to gallery...");

      // Navigate to gallery with the created event
      navigate(`/host/event/${newEvent.id}/gallery`);
    } catch (error) {
      console.error("❌ Failed to create advanced event:", error);
      console.error("❌ Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setCreationError(errorMessage);
      alert(`Failed to create event: ${errorMessage}`);
    } finally {
      console.log("🏁 Creation process finished, setting isCreating to false");
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      navigate("/host/dashboard");
    } else {
      setCurrentStep(currentStep - 1);
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
          <DisplayViewsStep eventData={eventData} setEventData={setEventData} />
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

  const isFinalStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.eggshell }}>
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressBar currentStep={currentStep} totalSteps={steps.length} />

        {/* Error Display */}
        {creationError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {creationError}
          </div>
        )}

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
                    style={{ backgroundColor: colors.green }}
                  >
                    {(() => {
                      const IconComponent = icons[currentStep];
                      return <IconComponent className="w-6 h-6 text-white" />;
                    })()}
                  </div>
                  <div>
                    <CardTitle
                      className="text-2xl"
                      style={{ color: colors.green }}
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
                  isNextDisabled={isNextDisabled || isCreating}
                  nextButtonText={
                    isFinalStep
                      ? isCreating
                        ? "Creating..."
                        : "Create Event"
                      : undefined
                  }
                />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
