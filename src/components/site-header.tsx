import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  className?: string;
}

export function SiteHeader({ className }: SiteHeaderProps) {
  return (
    <header 
      className={cn(
        "absolute top-0 left-0 w-full z-50",
        className
      )}
    >
      {/* TIGHTER PADDING:
         - py-4 md:py-6: Closer to top edge
         - px-4 md:px-8: Closer to left edge on desktop
      */}
      <div className="flex items-center justify-between px-4 py-4 md:px-8 md:py-6">
        
        <Link href="/" className="block cursor-pointer">
          <Image 
            src="/logo.png" 
            alt="Netflix" 
            width={167} 
            height={45} 
            priority 
            // Slightly smaller on mobile, full size on desktop
            className="w-[100px] h-auto md:w-[167px] object-contain"
          />
        </Link>
      </div>
    </header>
  );
}