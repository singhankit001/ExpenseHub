import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div
      className={`glass-card rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 relative overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div className={`px-6 py-4 border-b border-surface-200/50 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', ...props }: CardProps) => {
  return (
    <h3 className={`text-base font-bold text-surface-900 tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className = '', ...props }: CardProps) => {
  return (
    <p className={`text-xs text-surface-500 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div className={`px-6 py-5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div className={`px-6 py-4 border-t border-surface-200/50 bg-surface-100/35 rounded-b-xl ${className}`} {...props}>
      {children}
    </div>
  );
};
