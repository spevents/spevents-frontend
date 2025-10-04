import {
  ArrowLeft,
  Camera,
  Award,
  Grid,
  WandSparkles,
  MessageCircleQuestion,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

interface TabConfig {
  id: string;
  icon: React.ReactNode;
  label: string;
}

export default function FeedbackPage() {
  const params = useParams();
  const sessionCode = params.sessionCode || params.eventId;
  const navigate = useNavigate();

  const tabs: TabConfig[] = [
    {
      id: "gallery",
      icon: <Grid className="w-6 h-6 text-white font-bold" />,
      label: "Gallery",
    },
    {
      id: "camera",
      icon: <Camera className="w-6 h-6 text-white font-bold" />,
      label: "Camera",
    },
    {
      id: "create",
      icon: <WandSparkles className="w-6 h-6 text-white font-bold" />,
      label: "Create",
    },
    {
      id: "prize",
      icon: <Award className="w-6 h-6 text-white font-bold" />,
      label: "Prize",
    },
  ];

  const handleTabClick = (tabId: string) => {
    switch (tabId) {
      case "camera":
        navigate(`/${sessionCode}/guest/camera`);
        break;
      case "create":
        navigate(`/${sessionCode}/guest/create`);
        break;
      case "prize":
        navigate(`/${sessionCode}/guest/feedback`);
        break;
      case "gallery":
        navigate(`/${sessionCode}/guest`);
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-DARKGREEN font-sans flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-4 flex items-center justify-between bg-GREEN/50"
      >
        <button
          onClick={() => navigate(`/${sessionCode}/guest`)}
          className="p-2 rounded-full hover:bg-GREEN/50 active:bg-GREEN transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-EGGSHELL" />
        </button>
      </motion.div>

      {/* Main Content - Positioned above bottom navigation */}
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Icon */}
          <div className="flex justify-center">
            <motion.div
              className="w-24 h-24 rounded-full bg-MIDGREEN flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircleQuestion className="w-10 h-10 text-white" />
            </motion.div>
          </div>

          {/* Title and Description */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-EGGSHELL">
              Win a $10 Gift Card
            </h1>
            <p className="text-LIGHTGREEN text-lg font-black">
              Spevents is changing event photography.
            </p>
          </div>

          {/* Action Button */}
          <div className="space-y-4">
            <a
              href="https://forms.gle/MX3oe8njtof85XN78"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-MIDGREEN text-EGGSHELL text-lg font-medium py-4 px-6 rounded-full 
                text-center active:opacity-90 transition-all shadow-lg hover:bg-LIGHTGREEN hover:text-DARKGREEN"
            >
              Share Your Feedback
            </a>
            <p className="text-center text-LIGHTGREEN text-sm">
              Winners announced January 31, 2025
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation - Fixed at bottom */}
      <div className="fixed bottom-0 inset-x-0 bg-GREEN/80 backdrop-blur-lg">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`p-4 rounded-full relative ${
                  tab.id === "prize"
                    ? "text-EGGSHELL bg-MIDGREEN/30"
                    : "text-LIGHTGREEN hover:text-EGGSHELL hover:bg-MIDGREEN/20"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab.icon}
                <span className="sr-only">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
