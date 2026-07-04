import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div
      className={`bg-white rounded-xl border border-surface-200 shadow-card hover:shadow-card-hover transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div className={`px-5 py-4 border-b border-surface-100 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', ...props }: CardProps) => {
  return (
    <h3 className={`text-base font-semibold text-surface-900 ${className}`} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className = '', ...props }: CardProps) => {
  return (
    <p className={`text-xs text-surface-600 ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div className={`px-5 py-5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div className={`px-5 py-4 border-t border-surface-100 bg-surface-50 rounded-b-xl ${className}`} {...props}>
      {children}
    </div>
  );
};
