import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface HealthScoreProps {
  score: number;
}

export const HealthScore: React.FC<HealthScoreProps> = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = score / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [score]);

  // Determine color based on score
  const colorClass = score >= 80 ? 'text-accent-emerald' : score >= 50 ? 'text-accent-gold' : 'text-red-400';
  const glowClass = score >= 80 ? 'shadow-[0_0_30px_rgba(16,185,129,0.3)]' : score >= 50 ? 'shadow-[0_0_30px_rgba(252,211,77,0.3)]' : 'shadow-[0_0_30px_rgba(248,113,113,0.3)]';
  const strokeColor = score >= 80 ? 'var(--color-accent-emerald)' : score >= 50 ? 'var(--color-accent-gold)' : '#f87171';

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 glass-card rounded-2xl relative overflow-hidden group">
      {/* Background glow */}
      <div className={`absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700 blur-2xl ${glowClass}`} />
      
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-surface-200/50"
          />
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            stroke={strokeColor}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-4xl font-black tracking-tighter ${colorClass}`}>
            {displayScore}
          </span>
          <span className="text-[10px] font-bold text-surface-500 tracking-widest uppercase mt-0.5">
            / 100
          </span>
        </div>
      </div>
      
      <div className="mt-5 w-full space-y-3">
        <div className="flex justify-between text-xs">
          <span className="text-surface-400">Budget Control</span>
          <span className="text-white font-bold">Excellent</span>
        </div>
        <div className="w-full h-1 bg-surface-200/50 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: '90%' }} className="h-full bg-accent-emerald" transition={{ delay: 0.5, duration: 1 }} />
        </div>
        
        <div className="flex justify-between text-xs">
          <span className="text-surface-400">Saving Discipline</span>
          <span className="text-white font-bold">Good</span>
        </div>
        <div className="w-full h-1 bg-surface-200/50 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} className="h-full bg-accent-blue" transition={{ delay: 0.7, duration: 1 }} />
        </div>
      </div>
    </div>
  );
};
