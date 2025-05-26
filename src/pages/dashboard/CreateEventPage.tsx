// src/pages/dashboard/CreateEventPage.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  Palette,
  Settings,
  ArrowRight,
  ArrowLeft,
  Camera,
  QrCode,
} from "lucide-react";

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
    colors: {
      primary: "#344e41",
      secondary: "#588157",
    },
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
      title: "Theme & Style",
      subtitle: "Customize the look and feel",
    },
    {
      title: "Final Settings",
      subtitle: "Review and launch",
    },
  ];

  const themes = [
    { id: "modern", name: "Modern", colors: ["#344e41", "#588157"] },
    { id: "elegant", name: "Elegant", colors: ["#7c3aed", "#a855f7"] },
    { id: "warm", name: "Warm", colors: ["#ea580c", "#fb923c"] },
    { id: "cool", name: "Cool", colors: ["#0284c7", "#0ea5e9"] },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/dashboard/setup-gallery");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-timberwolf">
      {/* Header */}
      <header className="bg-white border-b border-sage/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brunswick-green rounded-lg flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-brunswick-green">
                  spevents
                </h1>
              </Link>
            </div>
            <Link to="/dashboard">
              <button className="border border-sage/30 text-hunter-green hover:bg-sage/10 px-4 py-2 rounded-lg transition-colors">
                Cancel
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-brunswick-green">
              Create New Event
            </h2>
            <span className="text-sm text-hunter-green">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-sage/30 rounded-full h-2">
            <motion.div
              className="bg-brunswick-green h-2 rounded-full"
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
            <div className="border border-sage/20 bg-white/95 backdrop-blur-sm rounded-lg">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-brunswick-green rounded-xl flex items-center justify-center">
                    {(() => {
                      const IconComponent = icons[currentStep];
                      return <IconComponent className="w-6 h-6 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-2xl text-brunswick-green font-bold">
                      {steps[currentStep].title}
                    </h3>
                    <p className="text-hunter-green">
                      {steps[currentStep].subtitle}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-6 px-8 pb-8">
                {currentStep === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="text-brunswick-green block mb-2"
                        >
                          Event Name *
                        </label>
                        <input
                          id="name"
                          placeholder="e.g., Sarah & Mike's Wedding"
                          value={eventData.name}
                          onChange={(e) =>
                            setEventData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="w-full border border-sage/30 focus:border-brunswick-green px-3 py-2 rounded-md focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="date"
                          className="text-brunswick-green block mb-2"
                        >
                          Date *
                        </label>
                        <input
                          id="date"
                          type="date"
                          value={eventData.date}
                          onChange={(e) =>
                            setEventData((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                          className="w-full border border-sage/30 focus:border-brunswick-green px-3 py-2 rounded-md focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="time"
                          className="text-brunswick-green block mb-2"
                        >
                          Time
                        </label>
                        <input
                          id="time"
                          type="time"
                          value={eventData.time}
                          onChange={(e) =>
                            setEventData((prev) => ({
                              ...prev,
                              time: e.target.value,
                            }))
                          }
                          className="w-full border border-sage/30 focus:border-brunswick-green px-3 py-2 rounded-md focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="location"
                          className="text-brunswick-green block mb-2"
                        >
                          Location
                        </label>
                        <input
                          id="location"
                          placeholder="e.g., Grand Ballroom, City Hall"
                          value={eventData.location}
                          onChange={(e) =>
                            setEventData((prev) => ({
                              ...prev,
                              location: e.target.value,
                            }))
                          }
                          className="w-full border border-sage/30 focus:border-brunswick-green px-3 py-2 rounded-md focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="description"
                          className="text-brunswick-green block mb-2"
                        >
                          Description
                        </label>
                        <textarea
                          id="description"
                          placeholder="Tell your guests about the event..."
                          value={eventData.description}
                          onChange={(e) =>
                            setEventData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="w-full border border-sage/30 focus:border-brunswick-green px-3 py-2 rounded-md focus:outline-none resize-none h-24"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="guests"
                        className="text-brunswick-green block mb-2"
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
                        className="w-full border border-sage/30 px-3 py-2 rounded-md focus:outline-none"
                      >
                        <option value="">Select guest count</option>
                        <option value="1-25">1-25 guests</option>
                        <option value="26-50">26-50 guests</option>
                        <option value="51-100">51-100 guests</option>
                        <option value="101-200">101-200 guests</option>
                        <option value="200+">200+ guests</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-brunswick-green">
                            Allow Photo Downloads
                          </label>
                          <p className="text-sm text-hunter-green">
                            Let guests download their photos
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={eventData.allowDownloads}
                          onChange={(e) =>
                            setEventData((prev) => ({
                              ...prev,
                              allowDownloads: e.target.checked,
                            }))
                          }
                          className="w-4 h-4"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-brunswick-green">
                            Moderate Photos
                          </label>
                          <p className="text-sm text-hunter-green">
                            Review photos before they appear
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={eventData.moderatePhotos}
                          onChange={(e) =>
                            setEventData((prev) => ({
                              ...prev,
                              moderatePhotos: e.target.checked,
                            }))
                          }
                          className="w-4 h-4"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-brunswick-green mb-4 block">
                        Choose a Theme
                      </label>
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
                                ? "border-brunswick-green bg-brunswick-green/10"
                                : "border-sage/30 hover:border-sage"
                            }`}
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
                            <p className="text-sm font-medium text-brunswick-green">
                              {theme.name}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="customLink"
                        className="text-brunswick-green block mb-2"
                      >
                        Custom Link (Optional)
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-sage/30 bg-sage/10 text-hunter-green text-sm">
                          spevents.live/
                        </span>
                        <input
                          id="customLink"
                          placeholder="your-event-name"
                          value={eventData.customLink}
                          onChange={(e) =>
                            setEventData((prev) => ({
                              ...prev,
                              customLink: e.target.value,
                            }))
                          }
                          className="flex-1 rounded-l-none border border-sage/30 focus:border-brunswick-green px-3 py-2 rounded-md focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="bg-sage/10 p-6 rounded-lg border border-sage/20">
                      <h4 className="text-lg font-semibold text-brunswick-green mb-4">
                        Event Summary
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-hunter-green">Event Name</p>
                          <p className="font-medium text-brunswick-green">
                            {eventData.name || "Untitled Event"}
                          </p>
                        </div>
                        <div>
                          <p className="text-hunter-green">Date & Time</p>
                          <p className="font-medium text-brunswick-green">
                            {eventData.date
                              ? new Date(eventData.date).toLocaleDateString()
                              : "Not set"}
                            {eventData.time && ` at ${eventData.time}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-hunter-green">Expected Guests</p>
                          <p className="font-medium text-brunswick-green">
                            {eventData.expectedGuests || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-hunter-green">Theme</p>
                          <p className="font-medium text-brunswick-green capitalize">
                            {eventData.theme}
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
                        <li>Set up your photo gallery display</li>
                        <li>Generate QR codes for guests</li>
                        <li>Customize your 3D venue model</li>
                        <li>Test the guest experience</li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2 border border-sage/30 text-hunter-green hover:bg-sage/10 px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentStep === 0 && !eventData.name}
                    className="flex items-center gap-2 bg-brunswick-green hover:bg-hunter-green text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
