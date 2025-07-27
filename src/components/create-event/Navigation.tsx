// File: src/components/create-event/Navigation.tsx

import { ArrowLeft, ArrowRight } from "lucide-react";
import { colors } from "@/types/eventTypes";

interface NavigationProps {
  currentStep: number;
  steps: any[];
  onNext: () => void;
  onBack: () => void;
  isNextDisabled?: boolean;
  nextButtonText?: string;
}

export function Navigation({
  currentStep,
  steps,
  onNext,
  onBack,
  isNextDisabled = false,
  nextButtonText,
}: NavigationProps) {
  const isLastStep = currentStep === steps.length - 1;
  const defaultNextText = isLastStep ? "Create Event" : "Next";
  const buttonText = nextButtonText || defaultNextText;

  return (
    <div className="flex justify-between pt-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {currentStep === 0 ? "Back to Dashboard" : "Back"}
      </button>

      <button
        onClick={onNext}
        disabled={isNextDisabled}
        className="flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: isNextDisabled ? colors.lightGreen : colors.green,
        }}
      >
        {buttonText}
        {!isLastStep && <ArrowRight className="w-4 h-4" />}
      </button>
    </div>
  );
}
