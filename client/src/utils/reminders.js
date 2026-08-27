// FREE FEATURE: Browser-native deadline reminders using the Notification API.
// No backend, no push service, no cost — works while the user has the tab/app open
// (or via a scheduled check when they revisit).

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

export function notifyIfDueSoon(notice) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  (notice.deadlines || []).forEach((d) => {
    if (d.status === 'due_soon') {
      new Notification(`Deadline coming up: ${notice.title}`, {
        body: `${d.label} — ${d.date || d.rawText}`,
        icon: '/vite.svg',
      });
    }
  });
}
