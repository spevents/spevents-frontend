// file: src/pages/HostRoutes/OnboardingPage.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Users,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";

export function OnboardingPage() {
  const { user, firebaseUser, markOnboardingComplete } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: firebaseUser?.displayName?.split(" ")[0] || "",
    lastName: firebaseUser?.displayName?.split(" ").slice(1).join(" ") || "",
    email: firebaseUser?.email || "",
    company: "",
    eventTypes: [] as string[],
  });

  const steps = [
    {
      title: "Welcome to spevents! 👋",
      subtitle: "Let's get you set up in just 2 quick steps",
      icon: Sparkles,
    },
    {
      title: "Tell us about yourself",
      subtitle: "Help us personalize your experience",
      icon: Users,
    },
    {
      title: "What events do you host?",
      subtitle: "We'll suggest the best templates for you",
      icon: Sparkles,
    },
  ];

  const eventTypes = [
    {
      name: "Weddings",
      svg: (
        <svg viewBox="0 0 64 64" className="w-8 h-8">
          <path
            fill="#ff69b4"
            d="M32 52c-2.2 0-4-1.8-4-4V32c0-8.8 7.2-16 16-16s16 7.2 16 16-7.2 16-16 16h-8v4c0 2.2-1.8 4-4 4z"
          />
          <path
            fill="#ff1493"
            d="M20 32c0-8.8 7.2-16 16-16s16 7.2 16 16c0 4.4-1.8 8.4-4.7 11.3L32 58.7l-15.3-15.4C18.8 40.4 17 36.4 17 32h3z"
          />
          <circle fill="#fff" cx="32" cy="30" r="3" />
        </svg>
      ),
    },
    {
      name: "Corporate Events",
      svg: (
        <svg viewBox="0 0 64 64" className="w-8 h-8">
          <rect fill="#4a90e2" x="12" y="16" width="40" height="32" rx="2" />
          <rect fill="#357abd" x="16" y="20" width="32" height="2" />
          <rect fill="#357abd" x="16" y="26" width="32" height="2" />
          <rect fill="#357abd" x="16" y="32" width="20" height="2" />
          <circle fill="#357abd" cx="44" cy="32" r="4" />
        </svg>
      ),
    },
    {
      name: "Birthday Parties",
      svg: (
        <svg viewBox="0 0 64 64" className="w-8 h-8">
          <rect fill="#ffa500" x="20" y="30" width="24" height="20" rx="2" />
          <rect fill="#ff6347" x="18" y="28" width="28" height="4" rx="2" />
          <line
            stroke="#ff1493"
            strokeWidth="2"
            x1="32"
            y1="20"
            x2="32"
            y2="28"
          />
          <ellipse fill="#ff1493" cx="32" cy="18" rx="2" ry="4" />
          <circle fill="#ffff00" cx="26" cy="38" r="2" />
          <circle fill="#00ff00" cx="32" cy="42" r="2" />
          <circle fill="#ff69b4" cx="38" cy="38" r="2" />
        </svg>
      ),
    },
    {
      name: "Conferences",
      svg: (
        <svg viewBox="0 0 64 64" className="w-8 h-8">
          <rect fill="#666" x="16" y="20" width="32" height="20" rx="1" />
          <rect fill="#333" x="18" y="42" width="28" height="8" />
          <circle fill="#4a90e2" cx="32" cy="30" r="6" />
          <rect fill="#fff" x="28" y="26" width="8" height="2" />
          <rect fill="#fff" x="28" y="30" width="8" height="2" />
          <rect fill="#fff" x="28" y="34" width="8" height="2" />
        </svg>
      ),
    },
    {
      name: "Festivals",
      svg: (
        <svg viewBox="0 0 64 64" className="w-8 h-8">
          <path fill="#ff6347" d="M32 12l4 8h8l-6 6 2 8-8-4-8 4 2-8-6-6h8z" />
          <path fill="#ffa500" d="M20 24l3 6h6l-4 4 1 6-6-3-6 3 1-6-4-4h6z" />
          <path fill="#32cd32" d="M44 24l3 6h6l-4 4 1 6-6-3-6 3 1-6-4-4h6z" />
          <rect fill="#8b4513" x="30" y="40" width="4" height="12" />
          <ellipse fill="#228b22" cx="32" cy="52" rx="8" ry="2" />
        </svg>
      ),
    },
    {
      name: "Graduations",
      svg: (
        <svg viewBox="0 0 64 64" className="w-8 h-8">
          <path fill="#000" d="M32 16l-16 8 16 8 16-8z" />
          <rect fill="#4169e1" x="28" y="24" width="8" height="16" />
          <path fill="#000" d="M20 32v8c0 4 5.4 8 12 8s12-4 12-8v-8" />
          <circle fill="#ffd700" cx="40" cy="20" r="3" />
          <rect fill="#ffd700" x="38" y="16" width="4" height="2" />
        </svg>
      ),
    },
    {
      name: "Baby Showers",
      svg: (
        <svg viewBox="0 0 64 64" className="w-8 h-8">
          <circle fill="#ffb6c1" cx="32" cy="28" r="12" />
          <circle fill="#fff" cx="28" cy="24" r="2" />
          <circle fill="#fff" cx="36" cy="24" r="2" />
          <path fill="#ff69b4" d="M28 32c2 2 6 2 8 0" />
          <ellipse fill="#87ceeb" cx="32" cy="45" rx="8" ry="3" />
          <rect fill="#87ceeb" x="28" y="42" width="8" height="6" />
        </svg>
      ),
    },
    {
      name: "Networking Events",
      svg: (
        <svg viewBox="0 0 64 64" className="w-8 h-8">
          <circle fill="#4a90e2" cx="20" cy="24" r="6" />
          <circle fill="#32cd32" cx="44" cy="24" r="6" />
          <circle fill="#ff6347" cx="32" cy="40" r="6" />
          <line stroke="#666" strokeWidth="2" x1="24" y1="28" x2="28" y2="36" />
          <line stroke="#666" strokeWidth="2" x1="40" y1="28" x2="36" y2="36" />
          <line stroke="#666" strokeWidth="2" x1="26" y1="22" x2="38" y2="22" />
        </svg>
      ),
    },
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save user data and complete onboarding
      const userData = {
        ...formData,
        completedOnboarding: true,
        userId: user?.id,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem("spevents_user_data", JSON.stringify(userData));
      markOnboardingComplete();
      navigate("/host");
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
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
            <div className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-center space-y-6 pb-6 p-8">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-600 dark:bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <CurrentStepIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {steps[currentStep].title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
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
                          label: "Capture",
                          desc: "Easy photo collection",
                          color:
                            "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700",
                        },
                        {
                          label: "Engage",
                          desc: "Keep guests involved",
                          color:
                            "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700",
                        },
                        {
                          label: "Display",
                          desc: "Real-time galleries",
                          color:
                            "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700",
                        },
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.2 }}
                          className={`text-center p-6 rounded-xl border ${item.color}`}
                        >
                          <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-sm">
                            <span className="text-2xl">
                              {index === 0 ? "📸" : index === 1 ? "👥" : "✨"}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-white mb-1">
                            {item.label}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.desc}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                      <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
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
                          htmlFor="firstName"
                          className="block text-gray-700 dark:text-gray-300 font-medium"
                        >
                          First Name *
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              firstName: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 h-12 px-3 rounded-md text-base outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="lastName"
                          className="block text-gray-700 dark:text-gray-300 font-medium"
                        >
                          Last Name *
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              lastName: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 h-12 px-3 rounded-md text-base outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="company"
                        className="block text-gray-700 dark:text-gray-300 font-medium"
                      >
                        Company/Organization
                      </label>
                      <input
                        id="company"
                        type="text"
                        placeholder="Optional"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            company: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 h-12 px-3 rounded-md text-base outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">
                        Select the types of events you host:
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {eventTypes.map((type) => (
                        <motion.button
                          key={type.name}
                          onClick={() => toggleEventType(type.name)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden ${
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
                    disabled={
                      currentStep === 1 &&
                      (!formData.firstName || !formData.lastName)
                    }
                    className="bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 h-12 px-8 text-base font-semibold text-white rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {currentStep === steps.length - 1
                      ? "Complete Setup"
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
