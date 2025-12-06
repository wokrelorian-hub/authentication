import "material-symbols"; // Import the CSS for symbols
import { cn } from "@/lib/utils";

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string; // The name of the icon from Google Fonts
  size?: number; // Optional size (default 24px)
  filled?: boolean; // Should the icon be solid or outlined?
}

export function Icon({ name, size = 24, filled = false, className, ...props }: IconProps) {
  return (
    <span
      className={cn("material-symbols-rounded select-none", className)}
      style={{
        fontSize: `${size}px`,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
      }}
      {...props}
    >
      {name}
    </span>
  );
}