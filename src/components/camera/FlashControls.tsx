import React from 'react';
import { Zap, ZapOff } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Orientation } from './hooks/useOrientation';

interface FlashControlsProps {
  isEnabled: boolean;
  onToggle: () => void;
  orientation: Orientation;
  facingMode: "user" | "environment";
}

export const FlashControls: React.FC<FlashControlsProps> = ({
  isEnabled,
  onToggle,
  orientation,
  facingMode,
}) => {
  const positionClass = orientation === 'landscape'
    ? 'top-20 left-4'
    : 'top-20 left-4';

  // Use a different icon for front-facing camera to indicate screen flash
  const Icon = isEnabled ? Zap : ZapOff;
  const flashLabel = facingMode === 'user' ? 'Screen Flash' : 'Flash';

  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
      className={`absolute ${positionClass} z-10 px-3 py-2 rounded-full 
        bg-black/50 backdrop-blur-md text-white 
        hover:bg-black/60 transition-colors
        flex items-center gap-2`}
      title={`Toggle ${flashLabel}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{flashLabel}</span>
    </motion.button>
  );
};

export default FlashControls;