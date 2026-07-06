
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Wallet } from 'lucide-react';
import { BackgroundSystem } from '@/components/ui/background';

export const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-surface-400">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex lg:grid lg:grid-cols-12 relative selection:bg-brand-500/30 selection:text-white">
      <BackgroundSystem />
      
      {/* Visual branding column - Hidden on Mobile */}
      <div className="hidden lg:flex lg:col-span-5 bg-surface-100/40 backdrop-blur-sm text-white flex-col justify-between p-10 relative overflow-hidden border-r border-surface-200/40 shadow-[10px_0_30px_rgba(0,0,0,0.3)]">
        {/* Soft atmospheric gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-accent-violet)_0%,transparent_60%)] opacity-20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-brand-600 to-accent-violet rounded-lg shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">ExpenseFlow</span>
        </div>

        <div className="relative z-10 flex flex-col gap-5">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight gradient-text-primary">
            Master your spending. <span className="gradient-text-accent">Shape your future.</span>
          </h1>
          <p className="text-sm text-surface-600 leading-relaxed text-balance">
            Track expenses, understand category-level trends, and analyze your cash flow on our clean personal finance platform.
          </p>
        </div>

        <div className="relative z-10 text-[10px] text-surface-500">
          &copy; {new Date().getFullYear()} ExpenseFlow Platform. All rights reserved.
        </div>
      </div>

      {/* Main Form Center column */}
      <div className="flex-1 lg:col-span-7 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md flex flex-col gap-6 animate-in">
          {/* Logo showing only on mobile */}
          <div className="flex lg:hidden items-center justify-center gap-2.5 mb-2">
            <div className="p-2 bg-gradient-to-tr from-brand-600 to-accent-violet rounded-lg shadow-md">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">ExpenseFlow</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
};
