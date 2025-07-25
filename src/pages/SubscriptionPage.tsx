// src/pages/SubscriptionPage.tsx

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Users,
  Shield,
  Mail,
  Zap,
  Crown,
} from "lucide-react";
import { useAuth } from "../components/auth/AuthProvider";
import { eventService } from "@/eventService";

interface PlanLimits {
  eventsLimit: number;
  photosPerEventLimit: number;
  storageLimit: string;
  price: number;
  billing: string;
  features: string[];
  buttonText: string;
  buttonAction: "upgrade" | "contact" | "current";
}

interface UsageStats {
  eventsUsed: number;
  currentMonthPhotos: number;
}

const PRICING_TIERS: Record<string, PlanLimits> = {
  free: {
    eventsLimit: 2,
    photosPerEventLimit: 50,
    storageLimit: "500MB",
    price: 0,
    billing: "Always free",
    features: [
      "2 events per month",
      "50 photos per event",
      "500MB total storage",
      "QR code sharing",
      "Basic display modes",
      "Community support",
    ],
    buttonText: "Get started",
    buttonAction: "upgrade",
  },
  pro: {
    eventsLimit: 15,
    photosPerEventLimit: 500,
    storageLimit: "5GB",
    price: 6,
    billing: "month billed annually",
    features: [
      "15 events per month",
      "500 photos per event",
      "5GB total storage",
      "Custom branding",
      "All display modes",
      "Analytics dashboard",
      "Photo collage tools",
      "Priority support",
      "Download originals",
    ],
    buttonText: "Get Pro plan",
    buttonAction: "upgrade",
  },
  enterprise: {
    eventsLimit: -1,
    photosPerEventLimit: -1,
    storageLimit: "Unlimited",
    price: 0,
    billing: "Custom pricing",
    features: [
      "Everything in Pro, plus:",
      "Unlimited events & photos",
      "Unlimited storage",
      "White-label solution",
      "Single sign-on (SSO)",
      "Team management & roles",
      "Advanced analytics",
      "API access",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
    ],
    buttonText: "Contact sales",
    buttonAction: "contact",
  },
};

export default function SubscriptionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPlan, _setCurrentPlan] = useState<string>("free");
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error("Failed to load usage data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanAction = (planId: string, action: string) => {
    if (action === "contact") {
      window.location.href =
        "mailto:sales@spevents.com?subject=Enterprise Plan Inquiry";
    } else if (action === "upgrade") {
      // Handle Stripe checkout or upgrade logic
      console.log("Upgrading to:", planId);
    }
  };

  const handleGoBack = () => {
    navigate("/host");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sp_eggshell dark:bg-sp_darkgreen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sp_green"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-sp_eggshell dark:bg-sp_darkgreen overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 py-4 h-full flex flex-col">
        {/* Header with Back Button */}
        <div className="mb-4">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-sp_green hover:text-sp_green/80 mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </button>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-sp_darkgreen dark:text-sp_eggshell mb-1">
              Plans that grow with you
            </h1>
            <p className="text-sp_green dark:text-sp_eggshell/70 text-sm">
              Choose the perfect plan for your event hosting needs
            </p>
          </div>
        </div>

        {/* Current Usage Banner */}
        {usage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-sp_midgreen rounded-lg shadow-sm p-3 mb-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-sp_darkgreen dark:text-sp_eggshell">
                Current usage:
              </span>
              <div className="flex gap-4 text-xs">
                <span className="text-sp_green/70 dark:text-sp_eggshell/70">
                  Events: {usage.eventsUsed}/
                  {PRICING_TIERS[currentPlan].eventsLimit === -1
                    ? "∞"
                    : PRICING_TIERS[currentPlan].eventsLimit}
                </span>
                <span className="text-sp_green/70 dark:text-sp_eggshell/70">
                  Photos: {usage.currentMonthPhotos} total
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pricing Plans */}
        <div className="grid gap-3 lg:grid-cols-3 flex-1 mb-3">
          {Object.entries(PRICING_TIERS).map(([planId, plan], index) => (
            <motion.div
              key={planId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white dark:bg-sp_midgreen rounded-lg border-2 p-4 transition-all duration-200 ${
                currentPlan === planId
                  ? "border-sp_green shadow-md scale-102"
                  : "border-sp_eggshell/30 dark:border-sp_lightgreen/20 hover:border-sp_green/50 shadow-sm"
              } ${planId === "pro" ? "ring-1 ring-sp_green/20" : ""}`}
            >
              {planId === "pro" && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-sp_green text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" />
                    Popular
                  </span>
                </div>
              )}

              {currentPlan === planId && (
                <div className="absolute top-3 right-3">
                  <Crown className="w-4 h-4 text-sp_green" />
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  {planId === "free" && (
                    <Users className="w-4 h-4 text-sp_green" />
                  )}
                  {planId === "pro" && (
                    <Zap className="w-4 h-4 text-sp_green" />
                  )}
                  {planId === "enterprise" && (
                    <Shield className="w-4 h-4 text-sp_green" />
                  )}
                  <h3 className="text-lg font-bold text-sp_darkgreen dark:text-sp_eggshell capitalize">
                    {planId}
                  </h3>
                </div>

                <p className="text-xs text-sp_green/70 dark:text-sp_eggshell/70 mb-2">
                  {planId === "free" && "Perfect for trying spevents"}
                  {planId === "pro" && "For regular event hosts"}
                  {planId === "enterprise" && "For businesses at scale"}
                </p>

                <div className="mb-3">
                  {plan.price === 0 && planId === "free" ? (
                    <div className="text-2xl font-bold text-sp_green">Free</div>
                  ) : plan.price === 0 && planId === "enterprise" ? (
                    <div className="text-xl font-bold text-sp_green">
                      Custom
                    </div>
                  ) : (
                    <div>
                      <span className="text-2xl font-bold text-sp_green">
                        ${plan.price}
                      </span>
                      <span className="text-xs text-sp_green/70 ml-1">
                        / {plan.billing}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-1.5 mb-4 text-xs">
                {plan.features.slice(0, 6).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sp_darkgreen dark:text-sp_eggshell leading-tight">
                      {feature}
                    </span>
                  </li>
                ))}
                {plan.features.length > 6 && (
                  <li className="text-sp_green/70 dark:text-sp_eggshell/70 text-xs">
                    +{plan.features.length - 6} more features
                  </li>
                )}
              </ul>

              {/* Action Button */}
              <button
                onClick={() => handlePlanAction(planId, plan.buttonAction)}
                disabled={currentPlan === planId}
                className={`w-full py-2 px-3 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm ${
                  currentPlan === planId
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                    : planId === "pro"
                      ? "bg-sp_green hover:bg-sp_green/90 text-white shadow-md"
                      : planId === "enterprise"
                        ? "bg-sp_darkgreen hover:bg-sp_darkgreen/90 text-white"
                        : "border-2 border-sp_green text-sp_green hover:bg-sp_green hover:text-white"
                }`}
              >
                {currentPlan === planId ? (
                  "Current Plan"
                ) : planId === "enterprise" ? (
                  <>
                    <Mail className="w-3 h-3" />
                    {plan.buttonText}
                  </>
                ) : (
                  plan.buttonText
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Bottom Notes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-sp_green/70 dark:text-sp_eggshell/70"
        >
          <p>
            Prices exclude tax. *Usage limits apply. Need help?{" "}
            <a
              href="mailto:spevents.party@gmail.com"
              className="text-sp_green hover:underline"
            >
              Contact us
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
