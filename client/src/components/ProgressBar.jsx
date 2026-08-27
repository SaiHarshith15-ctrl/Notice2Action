import React from 'react';

export default function ProgressBar({ done, total, percent }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-navy dark:text-white">Action Checklist</span>
        <span className="text-xs font-bold text-muted">
          {done} of {total} done ({percent}%)
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-cardborder dark:bg-[#2A2953] overflow-hidden">
        <div
          className="progress-bar-fill h-full rounded-full bg-gradient-to-r from-primary to-teal"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
