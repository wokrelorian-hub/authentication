"use client";

import { Spinner as HeroSpinner } from "@heroui/spinner";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "current" | "white" | "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  label?: string;
  className?: string;
}

export function Spinner({ size = "md", color = "danger", label, className }: SpinnerProps) {
  return (
    <HeroSpinner 
      size={size} 
      color={color} 
      label={label}
      variant="gradient" // The official "Comet Trail" style
      className={className}
    />
  );
}