export function formatDate(dateStr) {
  if (!dateStr) return 'Date not specified';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  if (Number.isNaN(d.getTime())) return null;
  return Math.round((d - today) / (1000 * 60 * 60 * 24));
}

export const statusStyles = {
  upcoming: { bg: 'bg-primary/10', text: 'text-primary', label: 'Upcoming' },
  due_soon: { bg: 'bg-amber/10', text: 'text-amber-dark', label: 'Due soon' },
  passed: { bg: 'bg-danger/10', text: 'text-danger-dark', label: 'Deadline passed' },
  unknown: { bg: 'bg-muted2/10', text: 'text-muted', label: 'Date unclear' },
};
