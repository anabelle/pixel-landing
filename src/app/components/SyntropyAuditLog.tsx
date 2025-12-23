'use client';

import { useEffect, useState } from 'react';

interface AuditStep {
  toolCalls?: Array<{ name: string; args?: Record<string, unknown> }>;
  text?: string;
}

interface ProcessStatus {
  name: string;
  status: string;
  cpu: number;
  memory: number;
  uptime_seconds: number;
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
  status?: ProcessStatus[];
  totalSats?: number;
  transactionCount?: number;
  content?: string;
}

export default function SyntropyAuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchAudit = async () => {
    try {
      const res = await fetch(`/api/audit?t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) {
          setLogs(json);
        }
      }
    } catch (err) {
      console.error('Failed to fetch audit log:', err);
    }
  };

  useEffect(() => {
    fetchAudit();
    const interval = setInterval(fetchAudit, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  if (logs.length === 0) return (
    <div className="mt-8 p-4 text-xs text-gray-600 border border-dashed border-gray-800 rounded-lg text-center font-mono">
      WAITING_FOR_OVERSOUL_DATA...
    </div>
  );

  const formatArgs = (args: Record<string, unknown> | undefined) => {
    if (!args) return '';
    try {
      const str = JSON.stringify(args);
      if (!str) return '';
      return str.length > 40 ? str.slice(0, 40) + '...' : str;
    } catch {
      return '[Complex Args]';
    }
  };

  return (
    <div className="mt-8 border border-blue-900/50 rounded-lg overflow-hidden bg-black/40 backdrop-blur-sm relative z-20 font-mono">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-xs font-bold text-blue-400 uppercase tracking-widest hover:bg-blue-900/20 transition-colors"
      >
        <span className="flex items-center">
          <span className="w-2 h-2 bg-blue-500/50 rounded-full mr-2 animate-pulse" />
          OVERSOUL_AUDIT_LOG ({logs.length} EVENTS)
        </span>
        <span>{isOpen ? '[ HIDE ]' : '[ SHOW ]'}</span>
      </button>

      {isOpen && (
        <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-[10px]">
          {logs.map((entry, i) => (
            <div key={i} className="border-l-2 border-blue-900/30 pl-4 py-1 relative group text-left">
              <div className="flex justify-between items-start mb-1">
                <span className={`font-bold ${
                  entry.type.includes('error') ? 'text-red-400' : 
                  entry.type.includes('success') ? 'text-green-400' : 'text-blue-400'
                }`}>
                  [{entry.type.toUpperCase()}]
                  {entry.model && <span className="ml-2 text-gray-600 font-normal uppercase">VIA_{entry.model.replace(/^openai\//, '')}</span>}
                </span>
                <span className="text-gray-600 text-[8px] uppercase">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
              
              {entry.task && <div className="text-gray-400 italic mb-1">&gt; TASK: {entry.task}</div>}
              {entry.file && <div className="text-gray-500 mb-1">TARGET: {entry.file}</div>}
              {entry.summary && <div className="text-gray-400 whitespace-pre-wrap border-t border-blue-900/10 mt-1 pt-1">{entry.summary}</div>}
              {entry.error && (
                <div className="text-red-400/80 bg-red-950/20 p-2 mt-1 rounded border border-red-900/30 overflow-x-auto whitespace-pre-wrap">
                  {entry.error}
                </div>
              )}
              
              {entry.type === 'ecosystem_audit' && entry.status && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {entry.status.map((p, pi) => (
                    <div key={pi} className="bg-blue-900/5 p-1 px-2 rounded border border-blue-900/10">
                      <div className="flex justify-between">
                        <span className="text-gray-300">{p.name}</span>
                        <span className={p.status === 'online' ? 'text-green-500/60' : 'text-red-500/60'}>{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {entry.type === 'treasury_check' && (
                <div className="text-yellow-600/60 mt-1 uppercase">
                  BALANCE: {entry.totalSats?.toLocaleString()} SATS | {entry.transactionCount?.toLocaleString()} TXS
                </div>
              )}

              {entry.content && (
                <div className="mt-2 p-2 bg-gray-900/40 rounded border border-gray-800 text-gray-500 whitespace-pre-wrap max-h-40 overflow-y-auto italic">
                  {entry.content}
                </div>
              )}
              
              {entry.steps && (
                <div className="mt-2 space-y-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  {entry.steps.map((step, si) => (
                    <div key={si} className="pl-2 border-l border-gray-800">
                      {step.toolCalls?.map((tc, tci) => (
                        <div key={tci} className="text-cyan-800">
                          CALL: {tc.name}({formatArgs(tc.args)})
                        </div>
                      ))}
                      {step.text && <div className="text-blue-800/50 truncate italic">{step.text}</div>}
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
