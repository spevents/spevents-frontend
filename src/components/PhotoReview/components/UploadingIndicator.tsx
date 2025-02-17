import { motion } from "framer-motion";

export const UploadingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full z-50"
    >
      <span className="text-white text-sm font-medium">Uploading photo...</span>
    </motion.div>
  );
};
