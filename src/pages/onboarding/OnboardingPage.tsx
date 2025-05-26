// src/pages/onboarding/OnboardingPage.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Users,
  Palette,
  CheckCircle,
} from "lucide-react";

export function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "John Doe", // Pre-filled from auth provider
    company: "",
    eventTypes: [] as string[],
    description: "",
  });

  const steps = [
    {
      title: "Welcome, John! 👋",
      subtitle: "Let's get you set up in just a few steps",
      icon: Sparkles,
    },
    {
      title: "Tell us about yourself",
      subtitle: "This helps us personalize your experience",
      icon: Users,
    },
    {
      title: "What events do you host?",
      subtitle: "We'll suggest the best templates for your needs",
      icon: Palette,
    },
  ];

  const eventTypes = [
    "Weddings",
    "Corporate Events",
    "Birthday Parties",
    "Conferences",
    "Festivals",
    "Graduations",
    "Baby Showers",
    "Networking Events",
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      localStorage.setItem("spevents-onboarding-complete", "true");
      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleEventType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(type)
        ? prev.eventTypes.filter((t) => t !== type)
        : [...prev.eventTypes, type],
    }));
  };

  const CurrentStepIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen bg-timberwolf flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-brunswick-green">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-brunswick-green">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-sage/30 rounded-full h-3">
            <motion.div
              className="bg-brunswick-green h-3 rounded-full"
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
            <div className="border border-sage/30 shadow-lg bg-white/95 backdrop-blur-sm rounded-lg">
              <div className="text-center space-y-6 pb-6 p-8">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-brunswick-green rounded-3xl flex items-center justify-center shadow-lg">
                    <CurrentStepIcon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-brunswick-green">
                    {steps[currentStep].title}
                  </h1>
                  <p className="text-hunter-green text-lg">
                    {steps[currentStep].subtitle}
                  </p>
                </div>
              </div>
              <div className="space-y-8 px-8 pb-8">
                {currentStep === 0 && (
                  <div className="text-center space-y-8">
                    <div className="grid grid-cols-3 gap-6">
                      {[
                        {
                          icon: Camera,
                          label: "Capture",
                          desc: "Easy photo collection",
                        },
                        {
                          icon: Users,
                          label: "Engage",
                          desc: "Keep guests involved",
                        },
                        {
                          icon: Sparkles,
                          label: "Display",
                          desc: "Real-time galleries",
                        },
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.2 }}
                          className="text-center p-6 bg-sage/10 rounded-2xl border border-sage/20"
                        >
                          <item.icon className="w-10 h-10 text-brunswick-green mx-auto mb-3" />
                          <p className="font-semibold text-brunswick-green mb-1">
                            {item.label}
                          </p>
                          <p className="text-sm text-hunter-green">
                            {item.desc}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                    <div className="bg-sage/10 p-6 rounded-2xl border border-sage/20">
                      <p className="text-hunter-green text-lg leading-relaxed">
                        spevents makes it effortless to collect and display
                        guest photos in real-time. Let's create your first
                        amazing photo experience!
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label
                          htmlFor="name"
                          className="text-brunswick-green font-medium block"
                        >
                          Full Name
                        </label>
                        <input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="w-full border border-sage/30 focus:border-brunswick-green h-12 text-base rounded-md px-3 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="company"
                          className="text-brunswick-green font-medium block"
                        >
                          Company/Organization
                        </label>
                        <input
                          id="company"
                          placeholder="Optional"
                          value={formData.company}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              company: e.target.value,
                            }))
                          }
                          className="w-full border border-sage/30 focus:border-brunswick-green h-12 text-base rounded-md px-3 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="description"
                        className="text-brunswick-green font-medium block"
                      >
                        Tell us about your events
                      </label>
                      <textarea
                        id="description"
                        placeholder="What makes your events special? What's your style?"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="w-full border border-sage/30 focus:border-brunswick-green min-h-[120px] text-base resize-none rounded-md px-3 py-2 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-hunter-green text-lg mb-6">
                        Select all event types that apply to you:
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {eventTypes.map((type) => (
                        <motion.button
                          key={type}
                          onClick={() => toggleEventType(type)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden ${
                            formData.eventTypes.includes(type)
                              ? "border-brunswick-green bg-brunswick-green/10 text-brunswick-green"
                              : "border-sage/30 hover:border-sage text-hunter-green hover:bg-sage/5"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{type}</span>
                            {formData.eventTypes.includes(type) && (
                              <CheckCircle className="w-5 h-5 text-brunswick-green" />
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2 border border-sage/30 text-hunter-green hover:bg-sage/10 h-12 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-brunswick-green hover:bg-hunter-green h-12 px-8 text-base font-semibold text-white rounded-md"
                  >
                    {currentStep === steps.length - 1
                      ? "Get Started"
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
