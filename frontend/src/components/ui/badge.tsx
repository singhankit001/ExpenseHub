import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}

export const Badge = ({ children, className = '', variant = 'primary', ...props }: BadgeProps) => {
  const baseStyle =
    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold';

  const variants = {
    primary: 'bg-brand-50 text-brand-700',
    secondary: 'bg-surface-200 text-surface-900',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
