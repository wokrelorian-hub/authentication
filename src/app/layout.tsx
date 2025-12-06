import type { Metadata } from "next";
import { Inter } from "next/font/google"; // 1. Import Inter
import "./globals.css";
import { Providers } from "./providers";

// 2. Configure Inter
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // Create a CSS variable
  display: "swap",
});

export const metadata: Metadata = {
  title: "TuboVideo",
  description: "Watch anything you want, whenever you want!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        // 3. Apply the variable to the body
        className={`${inter.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}