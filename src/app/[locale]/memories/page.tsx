'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';

// Types reuse from SyntropyAuditLog
interface AuditStep {
    toolCalls?: Array<{ name: string; args?: Record<string, unknown> }>;
    text?: string;
}

interface ProcessStatus {
    name: string;
    status: string;
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
    significance?: string;
    title?: string;
}

export default function MemoriesPage() {
    const [logs, setLogs] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedType, setSelectedType] = useState('ALL');

    useEffect(() => {
        const fetchAudit = async () => {
            try {
                const res = await fetch(`/api/audit?t=${Date.now()}`);
                if (res.ok) {
                    const json = await res.json();
                    if (Array.isArray(json)) {
                        // Sort by timestamp descending
                        setLogs(json.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
                    }
                }
            } catch (err) {
                console.error('Failed to fetch memories:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAudit();
        const interval = setInterval(fetchAudit, 15000);
        return () => clearInterval(interval);
    }, []);

    const uniqueTypes = useMemo(() => {
        return ['ALL', ...Array.from(new Set(logs.map(l => l.type)))];
    }, [logs]);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = JSON.stringify(log).toLowerCase().includes(filter.toLowerCase());
            const matchesType = selectedType === 'ALL' || log.type === selectedType;
            return matchesSearch && matchesType;
        });
    }, [logs, filter, selectedType]);

    const getTypeColor = (type: string) => {
        if (type.includes('error') || type.includes('fail')) return 'text-red-400 border-red-900/50 bg-red-950/10';
        if (type.includes('success')) return 'text-green-400 border-green-900/50 bg-green-950/10';
        if (type === 'evolution_report' || type.includes('treasury')) return 'text-yellow-400 border-yellow-900/50 bg-yellow-950/10';
        if (type === 'opencode_delegation_start') return 'text-purple-400 border-purple-900/50 bg-purple-950/10';
        return 'text-blue-400 border-blue-900/50 bg-blue-950/10';
    };

    return (
        <div className="min-h-screen bg-black text-gray-200 font-mono selection:bg-green-900 selection:text-white pb-20">
            {/* Background Matrix Effect (Simple Overlay) */}
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)] z-0" />
            <div className="fixed inset-0 pointer-events-none opacity-5 bg-[url('/grid.svg')] z-0" style={{ backgroundSize: '30px 30px' }} />

            {/* Header */}
            <header className="border-b border-green-900/30 bg-black/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-gray-500 hover:text-green-400 transition-colors uppercase text-sm font-bold tracking-widest">
                            ← Return
                        </Link>
                        <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                            NEURAL_ARCHIVE // MEMORY_CORE
                        </h1>
                    </div>
                    <div className="text-xs text-green-500/50 animate-pulse">
                        SYSTEM_ONLINE
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8 relative z-10">
                {/* Controls */}
                <div className="mb-8 p-6 rounded-xl border border-green-900/30 bg-black/40 backdrop-blur shadow-2xl">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">

                        {/* Search */}
                        <div className="relative w-full md:w-1/2">
                            <input
                                type="text"
                                placeholder="SEARCH_MEMORY_BANKS..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full bg-black/50 border border-green-900/50 rounded px-4 py-2 text-green-300 placeholder-green-800/50 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all uppercase text-sm"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-900">🔍</div>
                        </div>

                        {/* Filter */}
                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                            {uniqueTypes.slice(0, 5).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setSelectedType(t)}
                                    className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${selectedType === t
                                            ? 'bg-green-900/30 text-green-400 border border-green-500/50'
                                            : 'bg-black/30 text-gray-600 border border-gray-800 hover:border-gray-600'
                                        }`}
                                >
                                    {t.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between items-end mt-4">
                        <div className="text-xs text-gray-500">
                            TOTAL_ENTRIES: <span className="text-green-400">{logs.length}</span>
                            <span className="mx-2 text-gray-800">|</span>
                            VISIBLE: <span className="text-blue-400">{filteredLogs.length}</span>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                {loading ? (
                    <div className="text-center py-20 animate-pulse text-green-900 font-bold uppercase tracking-widest">
                        Initializing Memory Stream...
                    </div>
                ) : (
                    <div className="space-y-6 relative before:absolute before:left-4 md:before:left-1/2 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-green-900/0 before:via-green-900/50 before:to-green-900/0">
                        {filteredLogs.map((log, idx) => (
                            <div key={idx} className={`relative flex flex-col md:flex-row gap-8 items-start md:items-center group ${idx % 2 === 0 ? 'md:flex-row-reverse text-left md:text-left' : 'text-left md:text-right'
                                }`}>

                                {/* Timeline Dot */}
                                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 top-6 w-3 h-3 rounded-full bg-black border-2 border-green-900 group-hover:border-green-400 group-hover:scale-125 transition-all z-20 shadow-[0_0_10px_rgba(74,222,128,0.2)]"></div>

                                {/* Content Card */}
                                <div className={`w-full md:w-[calc(50%-2rem)] ml-12 md:ml-0 p-5 rounded-lg border backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl ${getTypeColor(log.type)}`}>

                                    {/* Header */}
                                    <div className="flex justify-between items-center mb-3 text-xs uppercase tracking-widest opacity-70 border-b border-white/5 pb-2">
                                        <span className="font-bold">{log.type.replace(/_/g, ' ')}</span>
                                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                                    </div>

                                    {/* Body */}
                                    <div className="space-y-2">
                                        {log.title && (
                                            <h3 className="text-lg font-bold text-white mb-2">{log.title}</h3>
                                        )}

                                        {log.task && (
                                            <div className="text-sm text-gray-400 italic">
                                                &gt; {log.task}
                                            </div>
                                        )}

                                        {log.summary && (
                                            <div className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">
                                                {log.summary}
                                            </div>
                                        )}

                                        {log.error && (
                                            <div className="p-3 bg-red-950/20 rounded border border-red-900/30 text-red-300 font-mono text-xs break-all">
                                                ERROR: {log.error}
                                            </div>
                                        )}

                                        {log.content && (
                                            <div className="mt-3 p-3 bg-black/40 rounded border border-white/5 font-mono text-xs text-gray-500 overflow-hidden max-h-40 group-hover:max-h-[500px] transition-all">
                                                {log.content}
                                            </div>
                                        )}

                                        {/* Specific Render: Ecosystem Audit */}
                                        {log.type === 'ecosystem_audit' && log.status && (
                                            <div className="grid grid-cols-2 gap-2 mt-3">
                                                {log.status.map((p, pi) => (
                                                    <div key={pi} className="flex justify-between bg-black/20 p-2 rounded text-xs">
                                                        <span className="text-gray-400">{p.name}</span>
                                                        <span className={p.status.includes('unhealthy') ? 'text-red-400' : 'text-green-400'}>
                                                            {p.status.includes('Up') ? 'ONLINE' : 'OFFLINE'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Footer Metadata */}
                                        <div className="pt-3 mt-2 border-t border-white/5 flex flex-wrap gap-2 text-[10px] text-gray-500 font-mono uppercase">
                                            {log.file && <span>FILE: {log.file}</span>}
                                            {log.model && <span>MODEL: {log.model.split('/').pop()}</span>}
                                            {log.totalSats !== undefined && <span className="text-yellow-500">TREASURY: {log.totalSats} sats</span>}
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredLogs.length === 0 && (
                    <div className="text-center py-20 text-gray-600">
                        <div className="text-4xl mb-4">∅</div>
                        <p className="uppercase tracking-widest">No Memory Traces Found</p>
                    </div>
                )}
            </main>
        </div>
    );
}
