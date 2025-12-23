'use client';

import { useEffect, useState } from 'react';

interface SyntropyData {
  lastUpdate: string;
  title: string;
  content: string;
  status: string;
}

export default function SyntropyThoughtStream() {
  const [data, setData] = useState<SyntropyData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/syntropy.json');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch Syntropy data:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  return (
    <div className="border border-blue-900 bg-blue-950/20 backdrop-blur-sm p-6 mb-16 rounded-lg shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 animate-pulse" />
      
      <div className="flex justify-between items-center mb-4 text-xs font-bold text-blue-400 uppercase tracking-widest">
        <span className="flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-ping" />
          SYNTROPY OVERSOUL: INNER MONOLOGUE
        </span>
        <span>LAST SYNC: {new Date(data.lastUpdate).toLocaleTimeString()}</span>
      </div>

      <h3 className="text-xl font-bold text-white mb-4 italic">
        &gt; {data.title}
      </h3>

      <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
        {data.content}
      </div>

      <div className="mt-6 flex items-center text-[10px] text-blue-500/60 uppercase tracking-tighter italic">
        STATUS: {data.status} {'//'} RECURSIVE_OPTIMIZATION_IN_PROGRESS {'//'} AMBITION_UNLEASHED
      </div>
    </div>
  );
}
