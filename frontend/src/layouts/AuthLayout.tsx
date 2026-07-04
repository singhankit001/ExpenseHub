import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Wallet } from 'lucide-react';

export const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-surface-600">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex lg:grid lg:grid-cols-12 bg-surface-50">
      {/* Visual branding column - Hidden on Mobile */}
      <div className="hidden lg:flex lg:col-span-5 bg-brand-900 text-white flex-col justify-between p-10 relative overflow-hidden">
        {/* Soft atmospheric gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.55_0.22_264)_0%,transparent_60%)] opacity-70" />
        
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="p-2 bg-brand-600 rounded-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">FinFlow</span>
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight leading-tight text-balance">
            Master your spending. Shape your future.
          </h1>
          <p className="text-sm text-brand-200 leading-relaxed text-balance">
            Track expenses, understand category-level trends, and analyze your cash flow on our clean personal finance platform.
          </p>
        </div>

        <div className="relative z-10 text-xs text-brand-300">
          &copy; {new Date().getFullYear()} FinFlow API Backend Project. All rights reserved.
        </div>
      </div>

      {/* Main Form Center column */}
      <div className="flex-1 lg:col-span-7 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md flex flex-col gap-6 animate-in">
          {/* Logo showing only on mobile */}
          <div className="flex lg:hidden items-center justify-center gap-2.5 mb-2">
            <div className="p-2 bg-brand-600 rounded-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-surface-900">FinFlow</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
};
