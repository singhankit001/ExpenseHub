import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, TrendingUp, TrendingDown, Info } from 'lucide-react';

interface InsightCardProps {
  type: 'warning' | 'success' | 'danger' | 'info';
  message: string;
  delay?: number;
}

export const InsightCard: React.FC<InsightCardProps> = ({ type, message, delay = 0 }) => {
  const config = {
    warning: { icon: AlertCircle, color: 'text-accent-gold', bg: 'bg-accent-gold/10' },
    success: { icon: TrendingDown, color: 'text-accent-emerald', bg: 'bg-accent-emerald/10' },
    danger: { icon: TrendingUp, color: 'text-red-400', bg: 'bg-red-400/10' },
    info: { icon: Info, color: 'text-brand-400', bg: 'bg-brand-500/10' }
  };

  const { icon: Icon, color, bg } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5, type: 'spring' }}
      whileHover={{ scale: 1.02 }}
      className="flex items-start gap-3 p-4 rounded-xl border border-surface-200/50 bg-surface-100/50 backdrop-blur-md cursor-pointer hover:bg-surface-200/50 transition-colors"
    >
      <div className={`p-2 rounded-lg ${bg} ${color} shrink-0 mt-0.5`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xs text-surface-600 leading-relaxed font-medium">
        {message}
      </p>
    </motion.div>
  );
};
