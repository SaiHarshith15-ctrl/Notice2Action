import React, { useEffect, useState } from 'react';
import ResultCard from '../components/ResultCard';
import { fetchHistory } from '../api/notices';

export default function History() {
  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      fetchHistory(search)
        .then(setNotices)
        .finally(() => setLoading(false));
    }, 250); // debounce search-as-you-type
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl font-extrabold text-navy dark:text-white">Notice History</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title…"
          className="rounded-full border border-cardborder dark:border-[#2A2953] bg-cardbg dark:bg-[#1C1B3A] px-4 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {loading ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : notices.length === 0 ? (
        <p className="text-muted text-sm">No notices yet — process one from the Home page.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {notices.map((n) => (
            <ResultCard key={n.id} notice={n} />
          ))}
        </div>
      )}
    </div>
  );
}
