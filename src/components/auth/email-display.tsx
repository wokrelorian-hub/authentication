"use client";

import Link from "next/link";

interface EmailDisplayProps {
  email: string;
  href?: string; // Where the "Change" link directs to (default: /login)
}

export function EmailDisplay({ email, href = "/login" }: EmailDisplayProps) {
  return (
    <div className="w-full flex items-center justify-between bg-[#333333] px-4 h-14 rounded-[4px] mb-4">
      {/* Email Text: 16px, White, Truncated if too long */}
      <span className="text-white text-[16px] font-normal truncate pr-4">
        {email}
      </span>
      
      {/* Change Link: Distinct styling, vertically centered */}
      <Link 
        href={href}
        className="text-[#b3b3b3] hover:text-white hover:underline text-[13px] font-medium shrink-0 transition-colors"
      >
        Change
      </Link>
    </div>
  );
}