import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadBox from '../components/UploadBox';
import ResultCard from '../components/ResultCard';
import { processTextNotice, processFileNotice, fetchHistory } from '../api/notices';
import { generalNoticeSample, lostFoundSample } from '../utils/samples';

export default function Home() {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory()
      .then((data) => setRecent(data.slice(0, 4)))
      .catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!text.trim() && !file) {
      setError('Paste some notice text or upload a file first.');
      return;
    }
    setLoading(true);
    try {
      const notice = file ? await processFileNotice(file, text) : await processTextNotice(text);
      navigate(`/result/${notice._id}`);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy dark:text-white">
          Turn any formal notice into a clear action plan
        </h1>
        <p className="text-muted mt-3 max-w-xl mx-auto">
          Paste a college, university, or government notice — or upload the PDF — and get deadlines,
          eligibility, documents, and a tickable checklist in seconds.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-semibold text-navy dark:text-white mb-2 block">Paste notice text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Paste the full notice text here..."
            className="w-full rounded-card border border-cardborder dark:border-[#2A2953] bg-cardbg dark:bg-[#1C1B3A] p-4 text-sm text-body dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setText(generalNoticeSample)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Try a sample general notice
            </button>
            <button
              type="button"
              onClick={() => setText(lostFoundSample)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Try a sample lost &amp; found notice
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="flex-1 h-px bg-cardborder dark:bg-[#2A2953]" />
          OR
          <span className="flex-1 h-px bg-cardborder dark:bg-[#2A2953]" />
        </div>

        <div>
          <label className="text-sm font-semibold text-navy dark:text-white mb-2 block">Upload PDF or image</label>
          <UploadBox selectedFile={file} onFileSelected={setFile} onClear={() => setFile(null)} />
        </div>

        {error && <p className="text-sm text-danger font-medium">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-primary to-primary-light text-white font-bold py-3.5 shadow-soft disabled:opacity-60"
        >
          {loading ? 'Analyzing notice…' : 'Generate Action Plan'}
        </button>
      </form>

      {recent.length > 0 && (
        <div className="mt-14">
          <h2 className="text-lg font-bold text-navy dark:text-white mb-4">Recent Notices</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {recent.map((n) => (
              <ResultCard key={n.id} notice={n} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
