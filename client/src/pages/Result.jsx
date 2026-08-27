import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import HighlightCard from '../components/HighlightCard';
import DeadlineBadge from '../components/DeadlineBadge';
import ChecklistItem from '../components/ChecklistItem';
import ProgressBar from '../components/ProgressBar';
import LostFoundCard from '../components/LostFoundCard';
import { fetchNoticeById, toggleChecklistItem, createShareLink } from '../api/notices';
import { exportNoticeToPdf } from '../utils/pdfExport';
import { requestNotificationPermission, notifyIfDueSoon } from '../utils/reminders';
import api from '../api/axios';

export default function Result({ shared, sharedData }) {
  const { id } = useParams();
  const [notice, setNotice] = useState(shared ? sharedData : null);
  const [loading, setLoading] = useState(!shared);
  const [error, setError] = useState('');
  const [showSource, setShowSource] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (shared) return;
    fetchNoticeById(id)
      .then((data) => {
        setNotice(data);
        notifyIfDueSoon(data);
      })
      .catch((err) => setError(err?.response?.data?.message || 'Could not load this notice'))
      .finally(() => setLoading(false));
    requestNotificationPermission();
  }, [id, shared]);

  async function handleToggle(index, done) {
    const updated = await toggleChecklistItem(id, index, done);
    setNotice(updated);
  }

  async function handleShare() {
    const res = await createShareLink(id);
    setShareUrl(res.url);
    if (navigator.clipboard) navigator.clipboard.writeText(res.url).catch(() => {});
  }

  async function handleDownloadCalendar() {
    const res = await api.get(`/notices/${id}/calendar.ics`, { responseType: 'blob' });
    const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${notice.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted">Loading…</div>;
  if (error) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-danger">{error}</div>;
  if (!notice) return null;

  const progress = notice.progress || { done: 0, total: 0, percent: 0 };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy dark:text-white">{notice.title}</h1>
        {notice.dontMiss && (
          <div className="mt-4 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger-dark font-medium">
            ⚠️ Don't miss this: {notice.dontMiss}
          </div>
        )}
      </div>

      {notice.noticeType === 'lost_found' ? (
        <LostFoundCard notice={notice} />
      ) : (
        <>
          {/* What You Need To Do */}
          {notice.actionChecklist?.length > 0 && (
            <div className="rounded-card border border-cardborder dark:border-[#2A2953] bg-white dark:bg-[#1C1B3A] p-6 shadow-soft">
              <h2 className="font-bold text-navy dark:text-white mb-3">What You Need To Do</h2>
              <ol className="space-y-2 list-decimal list-inside text-sm text-body dark:text-gray-200">
                {notice.actionChecklist.map((item, i) => (
                  <li key={i}>{item.text}</li>
                ))}
              </ol>
            </div>
          )}

          <div>
            <h2 className="font-bold text-navy dark:text-white mb-2">Summary</h2>
            <p className="text-sm text-body dark:text-gray-200 leading-relaxed">{notice.summary}</p>
          </div>

          {/* Highlight cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <HighlightCard
              icon="⏰"
              title="Deadlines"
              color="amber"
              items={notice.deadlines?.map((d) => `${d.label}: ${d.date || d.rawText}`)}
              emptyText="No deadline specified"
            />
            <HighlightCard icon="✅" title="Eligibility" color="indigo" items={notice.eligibility} emptyText="Open to all" />
            <HighlightCard
              icon="📄"
              title="Documents"
              color="teal"
              items={notice.requiredDocuments}
              emptyText="None required"
            />
          </div>

          {/* Deadlines detail */}
          {notice.deadlines?.length > 0 && (
            <div className="space-y-2">
              <h2 className="font-bold text-navy dark:text-white">Deadline Details</h2>
              {notice.deadlines.map((d, i) => (
                <DeadlineBadge key={i} deadline={d} />
              ))}
            </div>
          )}

          {/* Required documents checklist */}
          {notice.requiredDocuments?.length > 0 && (
            <div>
              <h2 className="font-bold text-navy dark:text-white mb-2">Required Documents</h2>
              <ul className="space-y-1.5">
                {notice.requiredDocuments.map((doc, i) => (
                  <li key={i} className="text-sm text-body dark:text-gray-200 flex gap-2">
                    <span className="text-teal">•</span> {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action checklist with progress */}
          {notice.actionChecklist?.length > 0 && (
            <div className="rounded-card border border-cardborder dark:border-[#2A2953] bg-white dark:bg-[#1C1B3A] p-6 shadow-soft space-y-4">
              <ProgressBar {...progress} />
              <ul className="space-y-2">
                {notice.actionChecklist.map((item, i) => (
                  <ChecklistItem key={i} item={item} index={i} onToggle={handleToggle} readOnly={shared} />
                ))}
              </ul>
            </div>
          )}

          {notice.importantInstructions?.length > 0 && (
            <div>
              <h2 className="font-bold text-navy dark:text-white mb-2">Important Instructions</h2>
              <ul className="space-y-1.5">
                {notice.importantInstructions.map((ins, i) => (
                  <li key={i} className="text-sm text-body dark:text-gray-200 flex gap-2">
                    <span className="text-primary">•</span> {ins}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Actions */}
      {!shared && (
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => exportNoticeToPdf(notice)}
            className="text-sm font-semibold px-4 py-2 rounded-full border border-cardborder dark:border-[#2A2953] hover:bg-cardbg dark:hover:bg-[#1C1B3A]"
          >
            ⬇️ Export as PDF
          </button>
          {notice.deadlines?.some((d) => d.date) && (
            <button
              onClick={handleDownloadCalendar}
              className="text-sm font-semibold px-4 py-2 rounded-full border border-cardborder dark:border-[#2A2953] hover:bg-cardbg dark:hover:bg-[#1C1B3A]"
            >
              📅 Add deadlines to Calendar
            </button>
          )}
          <button
            onClick={handleShare}
            className="text-sm font-semibold px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-light"
          >
            🔗 Share Action Plan
          </button>
        </div>
      )}

      {shareUrl && (
        <div className="rounded-card border border-cardborder dark:border-[#2A2953] bg-cardbg dark:bg-[#1C1B3A] p-5 flex items-center gap-4 flex-wrap">
          <QRCodeSVG value={shareUrl} size={84} bgColor="transparent" fgColor="currentColor" className="text-navy dark:text-white" />
          <div>
            <p className="text-sm font-semibold text-navy dark:text-white">Link copied to clipboard</p>
            <p className="text-xs text-muted break-all">{shareUrl}</p>
          </div>
        </div>
      )}

      {/* Source notice */}
      {notice.sourceText && (
        <div>
          <button
            onClick={() => setShowSource((s) => !s)}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {showSource ? 'Hide' : 'View'} Source Notice
          </button>
          {showSource && (
            <pre className="mt-3 whitespace-pre-wrap text-xs text-muted bg-cardbg dark:bg-[#1C1B3A] border border-cardborder dark:border-[#2A2953] rounded-card p-4 max-h-96 overflow-y-auto">
              {notice.sourceText}
            </pre>
          )}
          {notice.sourceFileUrl && (
            <a
              href={notice.sourceFileUrl}
              target="_blank"
              rel="noreferrer"
              className="block mt-2 text-xs text-primary hover:underline"
            >
              View original uploaded file ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}
