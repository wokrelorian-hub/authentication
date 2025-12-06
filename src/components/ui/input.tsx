"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/icon";
import { motion, AnimatePresence } from "framer-motion";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, errorMessage, id, ...props }, ref) => {
    
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        <div className="relative w-full group">
          <input
            type={type}
            id={inputId}
            className={cn(
              "peer block w-full rounded-sm border",
              "bg-transparent text-white",
              "h-14 px-4 pt-5 pb-2 text-base",
              "placeholder-transparent focus:ring-0 focus:outline-none transition-colors",
              
              // BORDER LOGIC:
              // 1. Error? Force Red (#E50914)
              // 2. Default? Grey (#8c8c8c) -> White on focus
              errorMessage 
                ? "border-[#E50914]! focus:border-[#E50914]!" 
                : "border-[#8c8c8c] focus:border-white",
              
              className
            )}
            placeholder=" "
            ref={ref}
            {...props}
          />
          
          <label
            htmlFor={inputId}
            className={cn(
              "absolute left-4 top-4 origin-top-left text-base transform duration-150 ease-out select-none pointer-events-none",
              
              errorMessage ? "text-[#E50914]" : "text-[#8c8c8c]",
              
              "peer-focus:-translate-y-2.5 peer-focus:scale-75",
              "peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-75"
            )}
          >
            {label}
          </label>
        </div>

        {/* Error Message Layout - Simple Slide Down */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 pt-1 text-[#E50914]">
                <Icon name="cancel" size={16} className="text-[#E50914]" /> 
                <p className="text-[13px] text-left">
                  {errorMessage}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }