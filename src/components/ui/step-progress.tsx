"use client";

import { Progress } from "@/components/ui/progress";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  label?: string; // Optional custom text (e.g. "Create a password")
}

export function StepProgress({ currentStep, totalSteps, label }: StepProgressProps) {
  // Calculate percentage
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full space-y-4">
      {/* 1. The Ultra-Thin Bar */}
      <Progress value={percentage} className="w-full" />
      
      {/* 2. The Meta Text */}
      <div className="flex flex-col gap-1">
        <span className="text-neutral-400 text-xs font-bold tracking-widest uppercase">
           Step {currentStep} of {totalSteps}
        </span>
        
        {/* Optional Title (like 'Create a password') */}
        {label && (
            <span className="text-white text-lg font-bold tracking-tight">
                {label}
            </span>
        )}
      </div>
    </div>
  );
}