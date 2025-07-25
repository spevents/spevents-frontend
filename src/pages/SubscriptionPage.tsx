// src/pages/SubscriptionPage.tsx

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Calendar,
  Camera,
  Check,
  Star,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../components/auth/AuthProvider";
import { eventService } from "@/eventService";

interface PlanLimits {
  eventsLimit: number;
  photosPerEventLimit: number;
  price: number;
  features: string[];
}

interface UsageStats {
  eventsUsed: number;
  currentMonthPhotos: number;
}

const PRICING_TIERS: Record<string, PlanLimits> = {
  free: {
    eventsLimit: 3,
    photosPerEventLimit: 100,
    price: 0,
    features: [
      "Up to 3 events per month",
      "100 photos per event",
      "Basic display modes",
      "QR code sharing",
      "24/7 support",
    ],
  },
  pro: {
    eventsLimit: 25,
    photosPerEventLimit: 1000,
    price: 29,
    features: [
      "Up to 25 events per month",
      "1,000 photos per event",
      "All display modes",
      "Custom branding",
      "Advanced analytics",
      "Priority support",
      "Photo collage tools",
    ],
  },
  enterprise: {
    eventsLimit: -1, // unlimited
    photosPerEventLimit: -1,
    price: 99,
    features: [
      "Unlimited events",
      "Unlimited photos",
      "White-label solution",
      "Custom integrations",
      "Dedicated support",
      "Advanced security",
      "Team management",
      "API access",
    ],
  },
};

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    loadUsageData();
  }, [user]);

  const loadUsageData = async () => {
    if (!user) return;

    try {
      const events = await eventService.getUserEvents();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const thisMonthEvents = events.filter((event) => {
        const eventDate = new Date(event.createdAt);
        return (
          eventDate.getMonth() === currentMonth &&
          eventDate.getFullYear() === currentYear
        );
      });

      const totalPhotosThisMonth = thisMonthEvents.reduce(
        (sum, event) => sum + (event.photoCount || 0),
        0,
      );

      setUsage({
        eventsUsed: thisMonthEvents.length,
        currentMonthPhotos: totalPhotosThisMonth,
      });

      // Get current plan from user data (would come from Firestore)
      // setCurrentPlan(user.subscription?.tier || "free");
    } catch (error) {
      console.error("Failed to load usage data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId);

    try {
      // Integrate with Stripe/payment processor here
      // const session = await createCheckoutSession(planId);
      // window.location.href = session.url;

      // For demo purposes:
      setTimeout(() => {
        setCurrentPlan(planId);
        setUpgrading(null);
        // Show success message
      }, 2000);
    } catch (error) {
      console.error("Failed to upgrade:", error);
      setUpgrading(null);
    }
  };

  const getUsagePercentage = (used: number, limit: number): number => {
    if (limit === -1) return 0; // unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const isAtLimit = (used: number, limit: number): boolean => {
    if (limit === -1) return false; // unlimited
    return used >= limit;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sp_eggshell dark:bg-sp_darkgreen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sp_green"></div>
      </div>
    );
  }

  const currentPlanData = PRICING_TIERS[currentPlan];

  return (
    <div className="min-h-screen bg-sp_eggshell dark:bg-sp_darkgreen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-sp_darkgreen dark:text-sp_eggshell mb-2">
            Subscription & Billing
          </h1>
          <p className="text-sp_green dark:text-sp_eggshell/70">
            Manage your spevents subscription and view usage statistics
          </p>
        </div>

        {/* Current Plan & Usage */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Current Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-sp_midgreen rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-sp_darkgreen dark:text-sp_eggshell">
                Current Plan
              </h2>
              {currentPlan !== "free" && (
                <Crown className="w-6 h-6 text-yellow-500" />
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-sp_darkgreen dark:text-sp_eggshell capitalize">
                  {currentPlan}
                </h3>
                {currentPlan !== "free" && (
                  <span className="bg-sp_green text-white px-2 py-1 rounded-full text-sm">
                    Active
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-sp_green">
                ${currentPlanData.price}
                <span className="text-sm font-normal text-sp_green/70">
                  {currentPlan === "free" ? "" : "/month"}
                </span>
              </p>
            </div>

            <div className="space-y-3">
              {currentPlanData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-sp_darkgreen dark:text-sp_eggshell">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Usage Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-sp_midgreen rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-sp_darkgreen dark:text-sp_eggshell mb-6">
              Usage This Month
            </h2>

            <div className="space-y-6">
              {/* Events Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sp_green" />
                    <span className="text-sm font-medium text-sp_darkgreen dark:text-sp_eggshell">
                      Events
                    </span>
                  </div>
                  <span className="text-sm text-sp_darkgreen dark:text-sp_eggshell">
                    {usage?.eventsUsed || 0} /{" "}
                    {currentPlanData.eventsLimit === -1
                      ? "∞"
                      : currentPlanData.eventsLimit}
                  </span>
                </div>

                <div className="w-full bg-sp_eggshell/50 dark:bg-sp_darkgreen/50 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isAtLimit(
                        usage?.eventsUsed || 0,
                        currentPlanData.eventsLimit,
                      )
                        ? "bg-red-500"
                        : "bg-sp_green"
                    }`}
                    style={{
                      width: `${getUsagePercentage(
                        usage?.eventsUsed || 0,
                        currentPlanData.eventsLimit,
                      )}%`,
                    }}
                  />
                </div>

                {isAtLimit(
                  usage?.eventsUsed || 0,
                  currentPlanData.eventsLimit,
                ) && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600 dark:text-red-400">
                      You've reached your event limit
                    </span>
                  </div>
                )}
              </div>

              {/* Photos Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-sp_green" />
                    <span className="text-sm font-medium text-sp_darkgreen dark:text-sp_eggshell">
                      Photos
                    </span>
                  </div>
                  <span className="text-sm text-sp_darkgreen dark:text-sp_eggshell">
                    {usage?.currentMonthPhotos || 0} total
                  </span>
                </div>

                <p className="text-xs text-sp_green/70 dark:text-sp_eggshell/70">
                  {currentPlanData.photosPerEventLimit === -1
                    ? "Unlimited photos per event"
                    : `Up to ${currentPlanData.photosPerEventLimit} photos per event`}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Pricing Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-sp_midgreen rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-sp_darkgreen dark:text-sp_eggshell mb-6 text-center">
            Choose Your Plan
          </h2>

          <div className="grid gap-6 lg:grid-cols-3">
            {Object.entries(PRICING_TIERS).map(([planId, plan]) => (
              <div
                key={planId}
                className={`relative rounded-xl border-2 p-6 transition-all duration-200 ${
                  currentPlan === planId
                    ? "border-sp_green bg-sp_green/5 dark:bg-sp_green/10"
                    : "border-sp_eggshell/30 dark:border-sp_lightgreen/20 hover:border-sp_green/50"
                } ${
                  planId === "pro" ? "ring-2 ring-sp_green ring-opacity-20" : ""
                }`}
              >
                {planId === "pro" && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-sp_green text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-sp_darkgreen dark:text-sp_eggshell capitalize mb-2">
                    {planId}
                  </h3>
                  <div className="text-3xl font-bold text-sp_green mb-1">
                    ${plan.price}
                    <span className="text-sm font-normal text-sp_green/70">
                      {planId === "free" ? "" : "/month"}
                    </span>
                  </div>
                  <p className="text-sm text-sp_green/70 dark:text-sp_eggshell/70">
                    {planId === "free" && "Perfect for trying out spevents"}
                    {planId === "pro" && "Great for regular event hosts"}
                    {planId === "enterprise" &&
                      "For professional event companies"}
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-sp_darkgreen dark:text-sp_eggshell">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(planId)}
                  disabled={currentPlan === planId || upgrading === planId}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    currentPlan === planId
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                      : planId === "pro"
                        ? "bg-sp_green hover:bg-sp_green/90 text-white"
                        : "border-2 border-sp_green text-sp_green hover:bg-sp_green hover:text-white"
                  }`}
                >
                  {upgrading === planId ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : currentPlan === planId ? (
                    "Current Plan"
                  ) : planId === "free" ? (
                    "Downgrade"
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Upgrade to {planId}
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Billing Info */}
        {currentPlan !== "free" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white dark:bg-sp_midgreen rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-sp_darkgreen dark:text-sp_eggshell mb-4">
              Billing Information
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-sp_green/70 dark:text-sp_eggshell/70">
                  Next billing date
                </p>
                <p className="font-medium text-sp_darkgreen dark:text-sp_eggshell">
                  {new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000,
                  ).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-sp_green/70 dark:text-sp_eggshell/70">
                  Payment method
                </p>
                <p className="font-medium text-sp_darkgreen dark:text-sp_eggshell">
                  •••• •••• •••• 4242
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-sp_eggshell/30 dark:border-sp_lightgreen/20">
              <button className="text-sp_green hover:text-sp_green/80 text-sm">
                Update payment method
              </button>
              <span className="mx-2 text-sp_eggshell/30">•</span>
              <button className="text-sp_green hover:text-sp_green/80 text-sm">
                Download invoices
              </button>
              <span className="mx-2 text-sp_eggshell/30">•</span>
              <button className="text-red-600 hover:text-red-700 text-sm">
                Cancel subscription
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
