// File: src/components/create-event/ProgressBar.tsx

import { motion } from "framer-motion";
import { colors } from "@/types/eventTypes";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold" style={{ color: colors.green }}>
          Create New Event
        </h2>
        <span className="text-sm" style={{ color: colors.darkGreen }}>
          Step {currentStep + 1} of {totalSteps}
        </span>
      </div>
      <div
        className="w-full rounded-full h-2"
        style={{ backgroundColor: `${colors.lightGreen}30` }}
      >
        <motion.div
          className="h-2 rounded-full"
          style={{ backgroundColor: colors.green }}
          initial={{ width: 0 }}
          animate={{
            width: `${((currentStep + 1) / totalSteps) * 100}%`,
          }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
