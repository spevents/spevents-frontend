import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
      className="fixed inset-0 bg-black/95 backdrop-blur-lg flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={springConfig}
        className="bg-white/10 backdrop-blur-md p-8 rounded-2xl text-center"
      >
        <h2 className="text-white text-xl font-medium mb-6">
          All photos reviewed!
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={springConfig}
          onClick={() => navigate("/gallery")}
          className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
        >
          View Gallery
        </motion.button>
      </motion.div>
    </motion.div>
  );
};