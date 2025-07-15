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

const icons = [CalendarIcon, Users, Palette, Settings];

export function CreateEventPage() {
  const navigate = useNavigate();
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

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Create event and redirect to gallery setup
      navigate("/host/setup-gallery", { state: { eventData } });
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      // Go to dashboard on first step
      navigate("/dashboard");
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
                  isNextDisabled={isNextDisabled}
                />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
