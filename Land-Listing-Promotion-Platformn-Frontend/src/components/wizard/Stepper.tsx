import React from 'react';
import { Check } from 'lucide-react';
import { STEPS } from '@/types/addProperty';

interface StepperProps {
  currentStep: number;
  furthestStep: number;
  onStepClick: (index: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, furthestStep, onStepClick }) => {
  return (
    <div className="flex items-center w-full mb-8">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isClickable = index <= furthestStep;

        return (
          <React.Fragment key={step.key}>
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(index)}
              className={`flex items-center gap-2 ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  isCompleted || isActive
                    ? 'bg-green-500'
                    : 'bg-white border-2 border-[#CBD5E1]'
                }`}
              >
                {isCompleted && <Check size={10} className="text-white" strokeWidth={3} />}
              </span>
              <span
                className={`text-sm whitespace-nowrap ${
                  isActive ? 'text-[#0F172A] font-semibold' : isCompleted ? 'text-[#334155]' : 'text-[#94A3B8]'
                }`}
              >
                {step.label}
              </span>
            </button>
            {index < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-3 ${index < currentStep ? 'bg-green-500' : 'bg-[#E2E8F0]'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
