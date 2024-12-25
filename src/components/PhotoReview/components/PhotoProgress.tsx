import { motion } from "framer-motion";

interface PhotoProgressProps {
  total: number;
  current: number;
}

export const PhotoProgress: React.FC<PhotoProgressProps> = ({ total, current }) => {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2">
      <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-white rounded-full"
          initial={{ width: 0 }}
          animate={{ 
            width: `${((current + 1) / total) * 100}%`
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
      <div className="text-white/70 text-sm font-medium">
        {current + 1} of {total}
      </div>
    </div>
  );
};