import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, type = 'text', id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold text-surface-800">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          id={id}
          className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
            error
              ? 'border-red-500 focus:ring-red-200'
              : 'border-surface-300 focus:border-brand-500 focus:ring-brand-100'
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
        {!error && helperText && <span className="text-xs text-surface-600">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
