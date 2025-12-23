'use client';

import { useEffect, useState } from 'react';

interface AuditStep {
  toolCalls?: Array<{ name: string; args: Record<string, unknown> }>;
  text?: string;
}

interface AuditEntry {
  timestamp: string;
  type: string;
  file?: string;
  task?: string;
  summary?: string;
  error?: string;
  model?: string;
  steps?: AuditStep[];
}

export default function SyntropyAuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchAudit = async () => {
      console.log('Fetching audit log...');
      try {
        const res = await fetch(`/api/audit?t=${Date.now()}`);
        console.log('Audit log response:', res.status);
        if (res.ok) {
          const json = await res.json();
          console.log('Audit log items:', json.length);
          setLogs(json);
        } else {
          console.error('Failed to fetch audit log:', res.statusText);
        }
      } catch (err) {
        console.error('Failed to fetch audit log error:', err);
      }
    };

    fetchAudit();
    const interval = setInterval(fetchAudit, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  if (logs.length === 0) return (
    <div className="mt-8 p-4 text-xs text-gray-600 border border-dashed border-gray-800 rounded-lg text-center">
      Waiting for Oversoul audit data...
    </div>
  );

  return (
    <div className="mt-8 border border-blue-900/50 rounded-lg overflow-hidden bg-black/40 backdrop-blur-sm relative z-20">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-xs font-bold text-blue-400 uppercase tracking-widest hover:bg-blue-900/20 transition-colors"
      >
        <span className="flex items-center">
          <span className="w-2 h-2 bg-blue-500/50 rounded-full mr-2" />
          Oversoul Audit Log ({logs.length} events)
        </span>
        <span>{isOpen ? '[ HIDE ]' : '[ SHOW ]'}</span>
      </button>

      {isOpen && (
        <div className="max-h-96 overflow-y-auto p-4 space-y-4 font-mono text-[11px]">
          {logs.map((entry, i) => (
            <div key={i} className="border-l-2 border-blue-900/30 pl-4 py-1 relative group text-left">
              <div className="flex justify-between items-start mb-1">
                <span className={`font-bold ${
                  entry.type.includes('error') ? 'text-red-400' : 
                  entry.type.includes('success') ? 'text-green-400' : 'text-blue-300'
                }`}>
                  [{entry.type.toUpperCase()}]
                </span>
                <span className="text-gray-600 text-[9px] uppercase">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
              
              {entry.task && <div className="text-gray-300 italic mb-1">&gt; {entry.task}</div>}
              {entry.file && <div className="text-gray-400 mb-1">Target: {entry.file}</div>}
              {entry.summary && <div className="text-gray-500 whitespace-pre-wrap border-t border-blue-900/10 mt-1 pt-1">{entry.summary}</div>}
              {entry.error && <div className="text-red-900/80 bg-red-950/20 p-2 mt-1 rounded border border-red-900/30">{entry.error}</div>}
              
              {entry.steps && entry.steps.length > 0 && (
                <div className="mt-2 space-y-1">
                  {entry.steps.map((step, si) => (
                    <div key={si} className="text-gray-500 pl-2 border-l border-gray-800">
                      {step.toolCalls?.map((tc, tci) => (
                        <div key={tci} className="text-cyan-900/60">
                          TOOL: {tc.name}({JSON.stringify(tc.args).slice(0, 50)}...)
                        </div>
                      ))}
                      {step.text && <div className="text-blue-900/40 truncate">{step.text}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
