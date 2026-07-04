import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 p-6">
      <div className="flex flex-col items-center text-center gap-6 max-w-sm animate-in">
        <div className="p-4 bg-brand-50 rounded-2xl text-brand-600 border border-brand-100">
          <Compass className="w-12 h-12" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">Page Not Found</h1>
          <p className="text-sm text-surface-600 leading-relaxed text-balance">
            The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
          </p>
        </div>
        <Link to="/dashboard" className="w-full">
          <Button variant="primary" className="w-full">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
