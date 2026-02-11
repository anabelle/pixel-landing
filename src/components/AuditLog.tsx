'use client';

import { useEffect, useState } from 'react';

type AuditEntry = {
  ts: string;
  type: string;
  summary: string;
  data?: Record<string, any>;
};

interface AuditLogProps {
  limit?: number;
}

export default function AuditLog({ limit = 20 }: AuditLogProps) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAudit = async () => {
    try {
      const response = await fetch(`/v2/api/audit?limit=${limit}`);
      if (!response.ok) throw new Error('audit fetch failed');
      const data = await response.json();
      setEntries(Array.isArray(data?.entries) ? data.entries : []);
      setError(null);
    } catch {
      setError('Unable to load audit feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
    const interval = setInterval(fetchAudit, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border border-green-800 p-6 bg-black/30 backdrop-blur-sm rounded-lg hover:border-green-400 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-green-400">Audit Feed</h3>
        <a
          href="/v2/api/audit?limit=200"
          target="_blank"
          className="text-xs text-gray-400 hover:text-green-300"
        >
          view raw
        </a>
      </div>

      {loading && (
        <div className="text-sm text-gray-400">Loading audit feed...</div>
      )}

      {error && (
        <div className="text-sm text-red-300">{error}</div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="text-sm text-gray-400">No audit entries yet.</div>
      )}

      <div className="space-y-2 text-xs text-gray-300 font-mono max-h-80 overflow-auto pr-2">
        {entries.map((entry, idx) => {
          const time = new Date(entry.ts).toLocaleTimeString();
          const isBash = entry.type === 'tool_use' && typeof entry.data?.input?.command === 'string';
          const bashPreview = isBash ? String(entry.data?.output?.outputPreview ?? '').trim() : '';
          const bashMeta = isBash
            ? `exit=${entry.data?.output?.exitCode ?? '?'} len=${entry.data?.output?.outputLength ?? '?'}${entry.data?.output?.truncated ? ' truncated' : ''}`
            : '';
          return (
            <div key={`${entry.ts}-${idx}`} className="space-y-1">
              <div className="flex gap-2">
                <span className="text-gray-500">{time}</span>
                <span className="text-green-400">{entry.type}</span>
                <span className="text-gray-300">{entry.summary}</span>
              </div>
              {isBash && (
                <div className="text-gray-500 pl-6">
                  <div>{bashMeta}</div>
                  {bashPreview && <pre className="whitespace-pre-wrap">{bashPreview}</pre>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
