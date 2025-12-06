import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // 1. BASE STYLES
  // - rounded-full: Pill Shape
  // - transition-colors: Only animate color changes (not size)
  // - Removed: active:scale-95 (No longer shrinks on click)
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-base font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // 2. PRIMARY (NETFLIX RED)
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_30px_-10px_rgba(229,9,20,0.6)] border-0",
        
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        
        // 3. OUTLINE
        outline:
          "border border-white/20 bg-transparent hover:bg-white/10 hover:text-white hover:border-white",
        
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-14 px-8 py-2 text-lg", 
        sm: "h-9 rounded-full px-3",
        lg: "h-16 rounded-full px-10 text-xl",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }