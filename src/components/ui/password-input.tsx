"use client";

import * as React from "react";
import { Input } from "@/components/ui/input"; 
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  errorMessage?: string; 
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label = "Password", errorMessage, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const toggleVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <motion.div 
        className="relative w-full"
        // SHAKE ANIMATION LOGIC
        // Triggers whenever 'errorMessage' changes to a truthy value
        key={errorMessage ? "error" : "valid"}
        animate={errorMessage ? { x: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {/* Base Input */}
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pr-12", className)} 
          label={label}
          errorMessage={errorMessage} // Pass error to Input for display (text color, border)
          ref={ref}
          {...props}
        />

        {/* Toggle Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="
            absolute right-2 top-2 h-10 w-10 rounded-full
            text-neutral-400 
            hover:text-white 
            hover:bg-transparent 
            hover:scale-110 
            active:scale-95
            transition-all duration-200
            focus-visible:ring-0 focus-visible:outline-none
          "
          onClick={toggleVisibility}
          tabIndex={-1} 
        >
          {showPassword ? (
            <Icon name="visibility" size={24} />
          ) : (
            <Icon name="visibility_off" size={24} />
          )}
          <span className="sr-only">
            {showPassword ? "Hide password" : "Show password"}
          </span>
        </Button>
      </motion.div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };