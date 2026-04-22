import React from 'react';

export default function ActivityCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-fade-in">
      {/* Top banner */}
      <div className="h-2 skeleton" />

      <div className="p-5 space-y-4">
        {/* Category badge */}
        <div className="flex items-start justify-between">
          <div className="h-7 w-20 rounded-lg skeleton" />
          <div className="h-7 w-28 rounded-lg skeleton" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 w-4/5 rounded skeleton" />
          <div className="h-4 w-3/5 rounded skeleton" />
        </div>

        {/* Meta info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded skeleton flex-shrink-0" />
            <div className="h-3 w-1/2 rounded skeleton" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded skeleton flex-shrink-0" />
            <div className="h-3 w-2/3 rounded skeleton" />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <div className="h-3 w-16 rounded skeleton" />
              <div className="h-3 w-16 rounded skeleton" />
            </div>
            <div className="h-1.5 rounded-full skeleton" />
          </div>
          <div className="flex gap-2">
            <div className="h-7 w-16 rounded-lg skeleton" />
            <div className="h-9 flex-1 rounded-xl skeleton" />
          </div>
        </div>
      </div>
    </div>
  );
}
