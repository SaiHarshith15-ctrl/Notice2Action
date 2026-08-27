import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';

export default function ResultCard({ notice }) {
  return (
    <Link
      to={`/result/${notice.id}`}
      className="block rounded-card border border-cardborder dark:border-[#2A2953] bg-white dark:bg-[#1C1B3A] p-5 shadow-soft hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-navy dark:text-white">{notice.title}</h3>
          <p className="text-xs text-muted mt-1">
            Processed {formatDate(notice.createdAt)}
            {notice.earliestDeadline && ` • Deadline: ${formatDate(notice.earliestDeadline)}`}
          </p>
        </div>
        {notice.noticeType === 'lost_found' && (
          <span
            className={`shrink-0 text-[10px] font-extrabold px-2 py-1 rounded-full ${
              notice.itemStatus === 'found_handed_over'
                ? 'bg-teal/15 text-teal-dark'
                : 'bg-amber/15 text-amber-dark'
            }`}
          >
            {notice.itemStatus === 'found_handed_over' ? 'FOUND' : 'LOST'}
          </span>
        )}
      </div>

      {notice.progress?.total > 0 && (
        <div className="mt-3">
          <div className="h-1.5 w-full rounded-full bg-cardborder dark:bg-[#2A2953] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-teal"
              style={{ width: `${notice.progress.percent}%` }}
            />
          </div>
          <p className="text-[11px] text-muted mt-1">
            {notice.progress.done}/{notice.progress.total} tasks done
          </p>
        </div>
      )}
    </Link>
  );
}
