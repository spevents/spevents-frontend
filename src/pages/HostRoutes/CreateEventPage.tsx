// src/pages/HostRoutes/CreateEventPage.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  Palette,
  Settings,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Plus,
  X,
} from "lucide-react";

// Color palette constants
const colors = {
  eggshell: "#dad7cd",
  lightGreen: "#a3b18a",
  green: "#3a5a40",
  darkGreen: "#344e41",
};

const icons = [Calendar, Users, Palette, Settings];

export function CreateEventPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [eventData, setEventData] = useState({
    name: "",
    date: "",
    time: "",
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
      { id: 1, name: "Main Display", type: "slideshow", isDefault: true },
    ],
  });

  const steps = [
    {
      title: "Event Details",
      subtitle: "Tell us about your event",
    },
    {
      title: "Guest Settings",
      subtitle: "Configure guest permissions",
    },
    {
      title: "Display Views",
      subtitle: "Customize slideshow displays",
    },
    {
      title: "Final Settings",
      subtitle: "Review and launch",
    },
  ];

  const themes = [
    { id: "modern", name: "Modern", colors: [colors.green, colors.lightGreen] },
    { id: "elegant", name: "Elegant", colors: ["#7c3aed", "#a855f7"] },
    { id: "warm", name: "Warm", colors: ["#ea580c", "#fb923c"] },
    { id: "cool", name: "Cool", colors: ["#0284c7", "#0ea5e9"] },
  ];

  const slideshowPresets = [
    {
      id: "classic",
      name: "Classic Grid",
      description: "Traditional photo grid layout",
    },
    {
      id: "mosaic",
      name: "Dynamic Mosaic",
      description: "Mixed size photo arrangement",
    },
    {
      id: "carousel",
      name: "Rotating Carousel",
      description: "Continuous photo rotation",
    },
    {
      id: "collage",
      name: "Creative Collage",
      description: "Artistic photo collage",
    },
  ];

  const generateSessionCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setEventData((prev) => ({ ...prev, sessionCode: code }));
  };

  const addSlideshowView = () => {
    const newView = {
      id: Date.now(),
      name: `Display ${eventData.slideshowViews.length + 1}`,
      type: "slideshow",
      isDefault: false,
    };
    setEventData((prev) => ({
      ...prev,
      slideshowViews: [...prev.slideshowViews, newView],
    }));
  };

  const removeSlideshowView = (id: number) => {
    if (eventData.slideshowViews.length > 1) {
      setEventData((prev) => ({
        ...prev,
        slideshowViews: prev.slideshowViews.filter((view) => view.id !== id),
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Create event and redirect to gallery setup
      navigate("/host/setup-gallery", { state: { eventData } });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.eggshell }}>
      {/* Header */}
      <header
        className="bg-white border-b"
        style={{ borderColor: `${colors.lightGreen}20` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/host/dashboard")}
                className="flex items-center gap-3"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.green }}
                >
                  <img src="/icon.svg" alt="spevents" className="w-5 h-5" />
                </div>
                <h1
                  className="text-2xl font-bold"
                  style={{ color: colors.green }}
                >
                  spevents
                </h1>
              </button>
            </div>
            <button
              onClick={() => navigate("/host/dashboard")}
              className="border border-opacity-30 text-sm px-3 py-1 rounded-md hover:bg-opacity-10"
              style={{
                borderColor: colors.lightGreen,
                color: colors.darkGreen,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold" style={{ color: colors.green }}>
              Create New Event
            </h2>
            <span className="text-sm" style={{ color: colors.darkGreen }}>
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div
            className="w-full rounded-full h-2"
            style={{ backgroundColor: `${colors.lightGreen}30` }}
          >
            <motion.div
              className="h-2 rounded-full"
              style={{ backgroundColor: colors.green }}
              initial={{ width: 0 }}
              animate={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="border bg-white/95 backdrop-blur-sm rounded-lg"
              style={{ borderColor: `${colors.lightGreen}20` }}
            >
              <div className="p-6 pb-3">
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
                    <h3
                      className="text-2xl font-semibold"
                      style={{ color: colors.green }}
                    >
                      {steps[currentStep].title}
                    </h3>
                    <p style={{ color: colors.darkGreen }}>
                      {steps[currentStep].subtitle}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {currentStep === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: colors.green }}
                        >
                          Event Name *
                        </label>
                        <input
                          placeholder="e.g., Sarah & Mike's Wedding"
                          value={eventData.name}
                          onChange={(e) =>
                            setEventData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="w-full border rounded-lg px-3 py-2"
                          style={{
                            borderColor: `${colors.lightGreen}30`,
                            backgroundColor: colors.eggshell,
                            color: colors.darkGreen,
                          }}
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: colors.green }}
                        >
                          Date *
                        </label>
                        <input
                          type="date"
                          value={eventData.date}
                          onChange={(e) =>
                            setEventData((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                          className="w-full border rounded-lg px-3 py-2"
                          style={{
                            borderColor: `${colors.lightGreen}30`,
                            backgroundColor: colors.eggshell,
                            color: colors.darkGreen,
                          }}
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: colors.green }}
                        >
                          Time
                        </label>
                        <input
                          type="time"
                          value={eventData.time}
                          onChange={(e) =>
                            setEventData((prev) => ({
                              ...prev,
                              time: e.target.value,
                            }))
                          }
                          className="w-full border rounded-lg px-3 py-2"
                          style={{
                            borderColor: `${colors.lightGreen}30`,
                            backgroundColor: colors.eggshell,
                            color: colors.darkGreen,
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: colors.green }}
                        >
                          Location
                        </label>
                        <input
                          placeholder="e.g., Grand Ballroom, City Hall"
                          value={eventData.location}
                          onChange={(e) =>
                            setEventData((prev) => ({
                              ...prev,
                              location: e.target.value,
                            }))
                          }
                          className="w-full border rounded-lg px-3 py-2"
                          style={{
                            borderColor: `${colors.lightGreen}30`,
                            backgroundColor: colors.eggshell,
                            color: colors.darkGreen,
                          }}
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: colors.green }}
                        >
                          Description
                        </label>
                        <textarea
                          placeholder="Tell your guests about the event..."
                          value={eventData.description}
                          onChange={(e) =>
                            setEventData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="w-full border rounded-lg px-3 py-2"
                          rows={3}
                          style={{
                            borderColor: `${colors.lightGreen}30`,
                            backgroundColor: colors.eggshell,
                            color: colors.darkGreen,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: colors.green }}
                      >
                        Expected Number of Guests
                      </label>
                      <select
                        value={eventData.expectedGuests}
                        onChange={(e) =>
                          setEventData((prev) => ({
                            ...prev,
                            expectedGuests: e.target.value,
                          }))
                        }
                        className="w-full border rounded-lg px-3 py-2"
                        style={{
                          borderColor: `${colors.lightGreen}30`,
                          backgroundColor: colors.eggshell,
                          color: colors.darkGreen,
                        }}
                      >
                        <option value="">Select guest count</option>
                        <option value="1-25">1-25 guests</option>
                        <option value="26-50">26-50 guests</option>
                        <option value="51-100">51-100 guests</option>
                        <option value="101-200">101-200 guests</option>
                        <option value="200+">200+ guests</option>
                      </select>
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: colors.green }}
                      >
                        Session Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          value={eventData.sessionCode}
                          onChange={(e) =>
                            setEventData((prev) => ({
                              ...prev,
                              sessionCode: e.target.value.toUpperCase(),
                            }))
                          }
                          placeholder="AUTO-GENERATED"
                          className="flex-1 border rounded-lg px-3 py-2"
                          style={{
                            borderColor: `${colors.lightGreen}30`,
                            backgroundColor: colors.eggshell,
                            color: colors.darkGreen,
                          }}
                        />
                        <button
                          onClick={generateSessionCode}
                          className="px-4 py-2 text-white rounded-lg hover:opacity-90"
                          style={{ backgroundColor: colors.green }}
                        >
                          Generate
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: colors.green }}
                      >
                        Custom Link (Optional)
                      </label>
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
                        <input
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
                          className="flex-1 rounded-l-none border px-3 py-2"
                          style={{
                            borderColor: `${colors.lightGreen}30`,
                            backgroundColor: colors.eggshell,
                            color: colors.darkGreen,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4
                          className="text-lg font-semibold"
                          style={{ color: colors.green }}
                        >
                          Slideshow Views
                        </h4>
                        <p
                          className="text-sm"
                          style={{ color: colors.darkGreen }}
                        >
                          Create multiple display screens for your event
                        </p>
                      </div>
                      <button
                        onClick={addSlideshowView}
                        className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
                        style={{ backgroundColor: colors.green }}
                      >
                        <Plus className="w-4 h-4" />
                        Add View
                      </button>
                    </div>

                    <div className="space-y-3">
                      {eventData.slideshowViews.map((view, _index) => (
                        <div
                          key={view.id}
                          className="border rounded-lg p-4"
                          style={{ borderColor: `${colors.lightGreen}30` }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <input
                                value={view.name}
                                onChange={(e) => {
                                  const updated = eventData.slideshowViews.map(
                                    (v) =>
                                      v.id === view.id
                                        ? { ...v, name: e.target.value }
                                        : v,
                                  );
                                  setEventData((prev) => ({
                                    ...prev,
                                    slideshowViews: updated,
                                  }));
                                }}
                                className="font-medium text-lg border-none bg-transparent outline-none"
                                style={{ color: colors.green }}
                              />
                              {view.isDefault && (
                                <span
                                  className="text-xs px-2 py-1 rounded-full"
                                  style={{
                                    backgroundColor: `${colors.lightGreen}20`,
                                    color: colors.darkGreen,
                                  }}
                                >
                                  Default
                                </span>
                              )}
                            </div>
                            {!view.isDefault && (
                              <button
                                onClick={() => removeSlideshowView(view.id)}
                                className="p-1 text-gray-400 hover:text-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                            {slideshowPresets.map((preset) => (
                              <button
                                key={preset.id}
                                className="p-3 text-left border rounded-lg hover:border-opacity-80 transition-colors"
                                style={{
                                  borderColor: `${colors.lightGreen}30`,
                                  backgroundColor: `${colors.eggshell}50`,
                                }}
                              >
                                <p
                                  className="text-sm font-medium"
                                  style={{ color: colors.green }}
                                >
                                  {preset.name}
                                </p>
                                <p
                                  className="text-xs mt-1"
                                  style={{ color: colors.darkGreen }}
                                >
                                  {preset.description}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4
                        className="text-lg font-semibold mb-4"
                        style={{ color: colors.green }}
                      >
                        Choose Theme
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {themes.map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() =>
                              setEventData((prev) => ({
                                ...prev,
                                theme: theme.id,
                              }))
                            }
                            className={`p-4 rounded-lg border-2 transition-all ${
                              eventData.theme === theme.id
                                ? `border-opacity-100`
                                : `border-opacity-30 hover:border-opacity-60`
                            }`}
                            style={{
                              borderColor:
                                eventData.theme === theme.id
                                  ? colors.green
                                  : colors.lightGreen,
                              backgroundColor:
                                eventData.theme === theme.id
                                  ? `${colors.green}10`
                                  : "transparent",
                            }}
                          >
                            <div className="flex gap-2 mb-2">
                              {theme.colors.map((color, index) => (
                                <div
                                  key={index}
                                  className="w-6 h-6 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <p
                              className="text-sm font-medium"
                              style={{ color: colors.green }}
                            >
                              {theme.name}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div
                      className="p-6 rounded-lg border"
                      style={{
                        backgroundColor: `${colors.lightGreen}10`,
                        borderColor: `${colors.lightGreen}20`,
                      }}
                    >
                      <h4
                        className="text-lg font-semibold mb-4"
                        style={{ color: colors.green }}
                      >
                        Event Summary
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p style={{ color: colors.darkGreen }}>Event Name</p>
                          <p
                            className="font-medium"
                            style={{ color: colors.green }}
                          >
                            {eventData.name || "Untitled Event"}
                          </p>
                        </div>
                        <div>
                          <p style={{ color: colors.darkGreen }}>Date & Time</p>
                          <p
                            className="font-medium"
                            style={{ color: colors.green }}
                          >
                            {eventData.date
                              ? new Date(eventData.date).toLocaleDateString()
                              : "Not set"}
                            {eventData.time && ` at ${eventData.time}`}
                          </p>
                        </div>
                        <div>
                          <p style={{ color: colors.darkGreen }}>
                            Session Code
                          </p>
                          <p
                            className="font-medium"
                            style={{ color: colors.green }}
                          >
                            {eventData.sessionCode || "Will be generated"}
                          </p>
                        </div>
                        <div>
                          <p style={{ color: colors.darkGreen }}>
                            Slideshow Views
                          </p>
                          <p
                            className="font-medium"
                            style={{ color: colors.green }}
                          >
                            {eventData.slideshowViews.length} configured
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3 mb-3">
                        <QrCode className="w-6 h-6 text-blue-600" />
                        <h4 className="text-lg font-semibold text-blue-800">
                          Next Steps
                        </h4>
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
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 border border-opacity-30 px-4 py-2 rounded-lg hover:bg-opacity-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      borderColor: colors.lightGreen,
                      color: colors.darkGreen,
                    }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentStep === 0 && !eventData.name}
                    className="flex items-center gap-2 text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: colors.green }}
                  >
                    {currentStep === steps.length - 1
                      ? "Create Event"
                      : "Continue"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
