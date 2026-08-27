import React from 'react';

const gradients = {
  indigo: 'from-primary to-primary-light',
  teal: 'from-teal to-teal-dark',
  amber: 'from-amber to-amber-dark',
  red: 'from-danger to-danger-dark',
};

export default function HighlightCard({ icon, title, items, color = 'indigo', emptyText }) {
  return (
    <div className="rounded-card p-5 bg-cardbg dark:bg-[#1C1B3A] border border-cardborder dark:border-[#2A2953] shadow-soft">
      <div
        className={`inline-flex items-center gap-2 text-white text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${gradients[color]}`}
      >
        <span>{icon}</span>
        {title}
      </div>
      <ul className="mt-3 space-y-1.5">
        {items && items.length > 0 ? (
          items.map((item, i) => (
            <li key={i} className="text-sm text-body dark:text-gray-200 leading-snug">
              • {item}
            </li>
          ))
        ) : (
          <li className="text-sm text-muted italic">{emptyText || 'Nothing listed'}</li>
        )}
      </ul>
    </div>
  );
}
