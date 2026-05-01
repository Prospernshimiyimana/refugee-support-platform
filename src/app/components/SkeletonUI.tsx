'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ 
  className = '', 
  variant = 'text', 
  width, 
  height, 
  lines = 1 
}: SkeletonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-none';
      case 'rounded':
        return 'rounded-lg';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const baseClasses = 'animate-pulse bg-slate-200';
  const variantClasses = getVariantClasses();
  const styleProps = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1rem' : undefined),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses} h-4`}
            style={{
              ...styleProps,
              width: i === lines - 1 ? '70%' : '100%', // Last line shorter
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${className}`}
      style={styleProps}
    />
  );
}

// Card skeleton for dashboard cards
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton width="120px" height="48px" variant="rectangular" />
          <Skeleton width="100px" height="16px" />
        </div>
        <Skeleton width="64px" height="64px" variant="circular" />
      </div>
    </div>
  );
}

// List skeleton for cases/news lists
export function ListItemSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton width="60%" height="24px" />
          <Skeleton lines={2} />
          <div className="flex items-center space-x-4">
            <Skeleton width="80px" height="20px" />
            <Skeleton width="100px" height="20px" />
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          <Skeleton width="32px" height="32px" variant="circular" />
          <Skeleton width="32px" height="32px" variant="circular" />
        </div>
      </div>
    </div>
  );
}

// Table skeleton for data tables
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }, (_, i) => (
            <Skeleton key={`header-${i}`} height="20px" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="border-b border-gray-100 p-4 last:border-b-0">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }, (_, colIndex) => (
              <Skeleton key={`cell-${rowIndex}-${colIndex}`} height="16px" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Form skeleton for forms
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton width="120px" height="16px" />
          <Skeleton height="48px" variant="rounded" />
        </div>
      ))}
      <Skeleton width="150px" height="48px" variant="rounded" />
    </div>
  );
}

// Loading state wrapper component
export function LoadingState({ 
  children, 
  isLoading, 
  fallback, 
  skeleton 
}: { 
  children: React.ReactNode;
  isLoading: boolean;
  fallback?: React.ReactNode;
  skeleton?: React.ReactNode;
}) {
  if (isLoading) {
    return fallback || skeleton || <Skeleton />;
  }
  
  return <>{children}</>;
}
