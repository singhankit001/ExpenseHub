import React, { InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, type = 'text', id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === 'password';
    const resolvedType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold text-surface-700">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={resolvedType}
            id={id}
            className={`w-full px-3.5 py-2.5 text-sm bg-surface-100 border text-white placeholder-surface-500 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
              isPasswordField ? 'pr-10' : ''
            } ${
              error
                ? 'border-red-500/60 focus:ring-red-500/20 focus:border-red-500'
                : 'border-surface-200/70 focus:border-brand-500 focus:ring-brand-500/20'
            } ${className}`}
            {...props}
          />
          {isPasswordField && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-surface-500 hover:text-surface-700 transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
        {!error && helperText && <span className="text-xs text-surface-600">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
