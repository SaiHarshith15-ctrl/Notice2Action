/**
 * icsService.js
 * FREE FEATURE: Generates a standard .ics calendar file for a notice's deadlines,
 * so users can add them straight to Google Calendar / Apple Calendar / Outlook
 * with zero extra API keys or paid services.
 */

function formatDate(dateStr) {
  // dateStr expected as YYYY-MM-DD -> returns YYYYMMDD for all-day ICS events
  return dateStr.replace(/-/g, '');
}

function escapeText(text = '') {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Builds an ICS file (VCALENDAR) containing one VEVENT per deadline that has a resolvable date.
 */
function buildIcsForNotice(notice) {
  const events = (notice.deadlines || [])
    .filter((d) => d.date)
    .map((d, idx) => {
      const uid = `${notice._id}-${idx}@notice2action`;
      const dt = formatDate(d.date);
      return [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART;VALUE=DATE:${dt}`,
        `DTEND;VALUE=DATE:${dt}`,
        `SUMMARY:${escapeText(`${notice.title} — ${d.label}`)}`,
        `DESCRIPTION:${escapeText(d.rawText || notice.summary || '')}`,
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        `DESCRIPTION:${escapeText(`Reminder: ${d.label} is due tomorrow`)}`,
        'END:VALARM',
        'END:VEVENT',
      ].join('\r\n');
    });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Notice2Action//EN',
    'CALSCALE:GREGORIAN',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
}

module.exports = { buildIcsForNotice };
