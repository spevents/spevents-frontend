import { ArrowLeft, Camera, Award, Grid, WandSparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

interface TabConfig {
  id: string;
  icon: React.ReactNode;
  label: string;
}

export default function FeedbackPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const tabs: TabConfig[] = [
    { id: 'gallery', icon: <Grid className="w-6 h-6 text-white font-bold" />, label: 'Gallery' },
    { id: 'camera', icon: <Camera className="w-6 h-6 text-white font-bold" />, label: 'Camera' },
    { id: 'create', icon: <WandSparkles className="w-6 h-6 text-white font-bold" />, label: 'Create' },
    { id: 'prize', icon: <Award className="w-6 h-6 text-white font-bold" />, label: 'Prize' },
  ];

  const handleTabClick = (tabId: string) => {
    switch (tabId) {
      case 'camera':
        navigate(`/${eventId}/guest/camera`);
        break;
      case 'create':
        navigate(`/${eventId}/guest/create`);
        break;
      case 'prize':
        navigate(`/${eventId}/guest/feedback`);
        break;
      case 'gallery':
        navigate(`/${eventId}/guest`);
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-brunswick-green font-sans flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-4 flex items-center justify-between bg-hunter-green/50"
      >
        <button
          onClick={() => navigate(`/${eventId}/guest`)}
          className="p-2 rounded-full hover:bg-hunter-green/50 active:bg-hunter-green transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-timberwolf" />
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
              className="w-24 h-24 rounded-full bg-fern-green flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img 
                src="/public/icon.svg" 
                
                alt="Spevents icon" 
                className="w-24 h-24"
              />
            </motion.div>
          </div>

          {/* Title and Description */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-timberwolf">
              Win a $10 Gift Card
            </h1>
            <p className="text-sage text-lg font-black">
              Spevents is changing event photography.
            </p>
          </div>

          {/* Action Button */}
          <div className="space-y-4">
            <a
              href="https://forms.gle/8jFfkEZytdBzfHmV9"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-fern-green text-timberwolf text-lg font-medium py-4 px-6 rounded-full 
                text-center active:opacity-90 transition-all shadow-lg hover:bg-sage hover:text-brunswick-green"
            >
              Share Your Feedback
            </a>
            <p className="text-center text-sage text-sm">
              Winners announced January 31, 2025
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation - Fixed at bottom */}
      <div className="fixed bottom-0 inset-x-0 bg-hunter-green/80 backdrop-blur-lg">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`p-4 rounded-full relative ${
                  tab.id === 'prize'
                    ? 'text-timberwolf bg-fern-green/30'
                    : 'text-sage hover:text-timberwolf hover:bg-fern-green/20'
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