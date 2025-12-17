'use client';

import { motion } from 'framer-motion';

// CARBON MOTION TOKENS
const carbonDuration = 0.4; // 400ms

// FIX: Added ': [number, number, number, number]' to satisfy Framer Motion types
const carbonEaseIn: [number, number, number, number] = [0, 0, 0.3, 1]; 

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}  
      exit={{ opacity: 0, y: -20 }}   
      transition={{
        duration: carbonDuration,
        ease: carbonEaseIn, 
      }}
      style={{ width: '100%' }} 
    >
      {children}
    </motion.div>
  );
}