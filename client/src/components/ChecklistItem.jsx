import React, { useState } from 'react';

export default function ChecklistItem({ item, index, onToggle, readOnly }) {
  const [justTicked, setJustTicked] = useState(false);

  function handleClick() {
    if (readOnly) return;
    setJustTicked(true);
    onToggle(index, !item.done);
    setTimeout(() => setJustTicked(false), 250);
  }

  return (
    <li
      onClick={handleClick}
      className={`flex items-center gap-3 rounded-xl border border-cardborder dark:border-[#2A2953] p-3.5 transition-colors ${
        readOnly ? '' : 'cursor-pointer hover:bg-cardbg dark:hover:bg-[#1C1B3A]'
      }`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
          item.done
            ? `bg-teal border-teal text-white ${justTicked ? 'tick-pop' : ''}`
            : 'border-cardborder dark:border-[#3A3966] text-transparent'
        }`}
      >
        ✓
      </span>
      <span className={`text-sm ${item.done ? 'line-through text-muted' : 'text-body dark:text-gray-200'}`}>
        {item.text}
      </span>
    </li>
  );
}
