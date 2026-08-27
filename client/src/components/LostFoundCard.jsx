import React from 'react';
import { formatDate } from '../utils/dateUtils';

export default function LostFoundCard({ notice }) {
  const isFound = notice.itemStatus === 'found_handed_over';
  return (
    <div className="rounded-card border border-cardborder dark:border-[#2A2953] bg-cardbg dark:bg-[#1C1B3A] p-6 shadow-soft">
      <span
        className={`inline-block text-xs font-extrabold tracking-wide px-3 py-1.5 rounded-full ${
          isFound ? 'bg-teal/15 text-teal-dark' : 'bg-amber/15 text-amber-dark'
        }`}
      >
        {isFound ? 'FOUND & HANDED OVER' : 'LOST — REPORTED'}
      </span>

      <h2 className="text-xl font-bold text-navy dark:text-white mt-3">{notice.itemName || notice.title}</h2>

      <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        {notice.location && (
          <div>
            <dt className="text-muted text-xs uppercase font-semibold">Location</dt>
            <dd className="text-body dark:text-gray-200">{notice.location}</dd>
          </div>
        )}
        {isFound && notice.handedToLocation && (
          <div>
            <dt className="text-muted text-xs uppercase font-semibold">Handed to</dt>
            <dd className="text-body dark:text-gray-200">{notice.handedToLocation}</dd>
          </div>
        )}
        {notice.reportedDate && (
          <div>
            <dt className="text-muted text-xs uppercase font-semibold">Date</dt>
            <dd className="text-body dark:text-gray-200">{formatDate(notice.reportedDate)}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
