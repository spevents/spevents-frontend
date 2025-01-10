// src/pages/FeedbackPage.tsx
import { ArrowLeft, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function FeedbackPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 backdrop-blur-lg z-10 px-4 py-4 flex items-center"
      >
        <button
          onClick={() => navigate(`/guest`)}
          className="p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
      </motion.div>

      {/* Content */}
      <div className="px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
              <Gift className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white">
              Win a $10 Gift Card
            </h1>
            <p className="text-white/60 text-sm">Help us improve Spevents</p>
          </div>

          {/* Description */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 space-y-4">
            <p className="text-white/80 text-center">
              Spevents is an early-stage startup created by a Vanderbilt
              student. Share your thoughts and help shape the future of event
              photography!
            </p>

            <p className="text-white/60 text-sm text-center">
              Winners announced by January 18, 2025
            </p>
          </div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <a
              href="https://forms.gle/8jFfkEZytdBzfHmV9"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-white text-gray-900 text-center py-4 rounded-full 
                font-medium active:bg-white/90 transition-colors shadow-lg"
            >
              Share Feedback
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
