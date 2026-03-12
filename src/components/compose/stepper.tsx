import { Check } from "lucide-react";
import { cn } from "~/lib/utils";

const STEPS = ["Content", "Audience", "Delivery", "Review"];

interface StepperProps {
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
}

export function Stepper({
  currentStep,
  completedSteps,
  onStepClick,
}: StepperProps) {
  return (
    <div className="flex items-center w-full px-4 py-6">
      {STEPS.map((label, index) => {
        const isCompleted = completedSteps.has(index);
        const isCurrent = currentStep === index;
        const isClickable = isCompleted && index !== currentStep;

        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable && !isCurrent}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-200",
                  isCompleted
                    ? "border-[#6366F1] bg-[#6366F1] text-white cursor-pointer hover:bg-[#6366F1]/90"
                    : isCurrent
                      ? "border-[#6366F1] bg-white text-[#6366F1] cursor-default"
                      : "border-gray-200 bg-white text-gray-400 cursor-not-allowed",
                )}
                aria-label={`Step ${index + 1}: ${label}`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </button>
              <span
                className={cn(
                  "text-xs font-medium whitespace-nowrap",
                  isCurrent
                    ? "text-[#6366F1]"
                    : isCompleted
                      ? "text-[#1E1B4B]"
                      : "text-gray-400",
                )}
              >
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mb-5 mx-2 transition-colors duration-300",
                  completedSteps.has(index) ? "bg-[#6366F1]" : "bg-gray-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
