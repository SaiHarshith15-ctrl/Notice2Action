import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchSharedNotice } from '../api/notices';
import Result from './Result';

export default function SharedPlan() {
  const { shareId } = useParams();
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSharedNotice(shareId)
      .then(setNotice)
      .catch((err) => setError(err?.response?.data?.message || 'This shared plan could not be found'))
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted">Loading…</div>;
  if (error) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-danger">{error}</div>;

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        <div className="rounded-xl bg-primary/5 border border-primary/20 text-primary text-sm font-medium px-4 py-2 text-center">
          You're viewing a shared, read-only action plan
        </div>
      </div>
      <Result shared sharedData={notice} />
    </>
  );
}
