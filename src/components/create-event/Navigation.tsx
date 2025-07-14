// File: src/components/create-event/Navigation.tsx

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { colors, Step } from "@/types/eventTypes";

interface NavigationProps {
  currentStep: number;
  steps: Step[];
  onNext: () => void;
  onBack: () => void;
  isNextDisabled: boolean;
}

export function Navigation({
  currentStep,
  steps,
  onNext,
  onBack,
  isNextDisabled,
}: NavigationProps) {
  return (
    <div className="flex justify-between pt-6">
      <Button
        variant="outline"
        onClick={onBack}
        style={{
          borderColor: colors.lightGreen,
          color: colors.darkGreen,
        }}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {currentStep === 0 ? "Dashboard" : "Back"}
      </Button>
      <Button
        onClick={onNext}
        disabled={isNextDisabled}
        style={{ backgroundColor: colors.green }}
      >
        {currentStep === steps.length - 1 ? "Create Event" : "Continue"}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
