import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton = ({ className = '', ...props }: SkeletonProps) => {
  return (
    <div
      className={`animate-pulse bg-surface-200 rounded ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-surface-200 p-5 flex flex-col gap-4 animate-pulse">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-3 w-1/2 mt-2" />
    </div>
  );
};

export const TableRowSkeleton = () => {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-surface-100 animate-pulse">
      <div className="flex items-center gap-3 w-1/3">
        <Skeleton className="w-9 h-9 rounded-full" />
        <div className="flex flex-col gap-1.5 w-full">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-2 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-4 w-12 rounded-full" />
    </div>
  );
};
