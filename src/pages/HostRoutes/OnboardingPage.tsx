// src/pages/HostRoutes/OnboardingPage.tsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  User,
  Palette,
} from "lucide-react";
import { useAuth } from "../../components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";

interface FormData {
  firstName: string;
  lastName: string;
  eventTypes: string[];
}

const EVENT_TYPES = [
  { name: "Wedding", svg: <div className="w-6 h-6 text-pink-500">💒</div> },
  { name: "Birthday", svg: <div className="w-6 h-6 text-yellow-500">🎂</div> },
  { name: "Corporate", svg: <div className="w-6 h-6 text-blue-500">🏢</div> },
  { name: "Party", svg: <div className="w-6 h-6 text-purple-500">🎉</div> },
  { name: "Conference", svg: <div className="w-6 h-6 text-gray-500">📊</div> },
  { name: "Other", svg: <div className="w-6 h-6 text-green-500">📅</div> },
];

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    eventTypes: [],
  });
  const [isCompleting, setIsCompleting] = useState(false);

  const { markOnboardingComplete, user } = useAuth();
  const navigate = useNavigate();

  const steps = [
    {
      title: "Welcome to Spevents!",
      subtitle: "Let's get you set up to create amazing events",
      icon: <User className="w-12 h-12 text-green-600 dark:text-green-400" />,
    },
    {
      title: "Tell us about yourself",
      subtitle: "We'll use this to personalize your experience",
      icon: <User className="w-12 h-12 text-green-600 dark:text-green-400" />,
    },
    {
      title: "What types of events do you host?",
      subtitle: "Select all that apply - you can change this later",
      icon: (
        <Palette className="w-12 h-12 text-green-600 dark:text-green-400" />
      ),
    },
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      setIsCompleting(true);
      try {
        await markOnboardingComplete();
        console.log("Onboarding completed, navigating to host dashboard");
        navigate("/host", { replace: true });
      } catch (error) {
        console.error("Error completing onboarding:", error);
        setIsCompleting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEventTypeToggle = (typeName: string) => {
    setFormData((prev) => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(typeName)
        ? prev.eventTypes.filter((t) => t !== typeName)
        : [...prev.eventTypes, typeName],
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName.trim() && formData.lastName.trim();
      case 2:
        return formData.eventTypes.length > 0;
      default:
        return true;
    }
  };

  if (isCompleting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Setting up your account...
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            This will just take a moment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                {steps[currentStep].icon}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {steps[currentStep].title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {steps[currentStep].subtitle}
              </p>
            </div>

            <div className="space-y-6">
              {currentStep === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                    Welcome{user?.name ? `, ${user.name}` : ""}! We're excited
                    to help you create unforgettable events. Let's take just a
                    minute to set up your profile.
                  </p>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your first name"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {EVENT_TYPES.map((type) => (
                      <motion.button
                        key={type.name}
                        onClick={() => handleEventTypeToggle(type.name)}
                        className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                          formData.eventTypes.includes(type.name)
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">{type.svg}</div>
                          <span className="font-medium">{type.name}</span>
                          {formData.eventTypes.includes(type.name) && (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 ml-auto" />
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
                  className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 h-12 px-6 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 h-12 px-8 text-base font-semibold text-white rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {currentStep === steps.length - 1
                    ? "Complete Setup"
                    : "Continue"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
