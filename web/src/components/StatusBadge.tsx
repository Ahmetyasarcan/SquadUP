import React from 'react';
import { getRelativeTime } from '../utils/formatters';

interface StatusBadgeProps {
  datetime: string;
  currentParticipants: number;
  maxParticipants: number;
}

export default function StatusBadge({ datetime, currentParticipants, maxParticipants }: StatusBadgeProps) {
  const isFull = currentParticipants >= maxParticipants;
  const spotsLeft = maxParticipants - currentParticipants;
  const relative = getRelativeTime(datetime);

  if (isFull) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800">
        Dolu
      </span>
    );
  }

  if (spotsLeft <= 3) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800 animate-pulse-soft">
        🔥 Son {spotsLeft} kişi
      </span>
    );
  }

  if (relative === 'Bugün') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800">
        📍 Bugün
      </span>
    );
  }

  if (relative === 'Yarın') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800">
        Yarın
      </span>
    );
  }

  return null;
}
