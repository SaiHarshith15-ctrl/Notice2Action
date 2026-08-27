import React from 'react';
import { formatDate, daysUntil, statusStyles } from '../utils/dateUtils';

export default function DeadlineBadge({ deadline }) {
  const status = deadline.status || 'unknown';
  const style = statusStyles[status];
  const days = daysUntil(deadline.date);

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-cardborder dark:border-[#2A2953] bg-white dark:bg-[#1C1B3A] p-4">
      <div>
        <p className="font-semibold text-navy dark:text-white text-sm">{deadline.label}</p>
        <p className="text-xs text-muted mt-0.5">
          {deadline.date ? formatDate(deadline.date) : deadline.rawText || 'Date not specified'}
        </p>
      </div>
      <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
        {status === 'due_soon' && days !== null ? `${days}d left` : style.label}
      </span>
    </div>
  );
}
