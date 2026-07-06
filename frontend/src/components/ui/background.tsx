import React from 'react';
import { motion } from 'framer-motion';

export const BackgroundSystem = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50 bg-surface-50">
      {/* Base noise texture */}
      <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay z-10" />

      {/* Mesh gradients */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-500/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent-violet/20 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-accent-emerald/15 rounded-full blur-[100px]"
        />
      </div>
    </div>
  );
};
