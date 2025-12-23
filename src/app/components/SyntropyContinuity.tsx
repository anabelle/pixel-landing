'use client';

import { useEffect, useState } from 'react';

export default function SyntropyContinuity() {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContinuity = async () => {
      try {
        const res = await fetch('/api/continuity');
        if (res.ok) {
          const json = await res.json();
          setContent(json.content);
        }
      } catch (err) {
        console.error('Failed to fetch continuity:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContinuity();
    const interval = setInterval(fetchContinuity, 60000); // Poll every 1m
    return () => clearInterval(interval);
  }, []);

  if (loading && !content) return null;
  if (!content) return null;

  return (
    <div className="mt-12 border border-purple-900/50 rounded-lg overflow-hidden bg-black/40 backdrop-blur-sm relative z-10 font-mono">
      <div className="flex justify-between items-center p-4 bg-purple-950/20 border-b border-purple-900/50">
        <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center">
          <span className="w-2 h-2 bg-purple-500/50 rounded-full mr-2" />
          System Continuity Ledger
        </h3>
      </div>
      <div className="p-6 text-[12px] leading-relaxed text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto custom-scrollbar">
        {content}
      </div>
      <div className="p-2 bg-purple-900/10 text-[9px] text-purple-900 text-right uppercase">
        Canonical Session State
      </div>
    </div>
  );
}
