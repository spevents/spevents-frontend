import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";

const springConfig = {
  type: "spring" as const,
  stiffness: 250,
  damping: 25,
  mass: 0.8,
  restDelta: 0.001,
};

export const ReviewComplete: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-lg flex flex-col items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={springConfig}
        className="w-full max-w-xs space-y-6 text-center"
      >
        <h2 className="text-white text-xl font-medium">
          All photos reviewed!
        </h2>
        
        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/guest")}
            className="w-full px-6 py-3 bg-white text-gray-900 rounded-full font-medium 
              transition-colors hover:bg-white/90"
          >
            Guest Dashboard
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/camera")}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 
              bg-white/10 text-white rounded-full font-medium 
              transition-colors hover:bg-white/20"
          >
            <Camera className="w-5 h-5" />
            <span>Take More</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};