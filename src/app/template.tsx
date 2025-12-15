'use client';

import { motion } from 'framer-motion';

// CARBON MOTION TOKENS
// Reference: https://carbondesignsystem.com/elements/motion/overview/

const carbonDuration = 0.4; // 400ms (duration-slow-01)

// motion(entrance, expressive): cubic-bezier(0, 0, 0.3, 1)
// FIX 1: Explicitly typed as a tuple of 4 numbers
const carbonEaseIn: [number, number, number, number] = [0, 0, 0.3, 1]; 

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}  
      exit={{ opacity: 0, y: -20 }}   
      transition={{
        duration: carbonDuration,
        ease: carbonEaseIn, // FIX 2: We use this single curve for both animations
      }}
      style={{ width: '100%' }} 
    >
      {children}
    </motion.div>
  );
}