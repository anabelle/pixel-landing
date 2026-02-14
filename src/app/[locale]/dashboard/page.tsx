'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type HealthPayload = {
  status: string;
  version: string;
  name: string;
  uptime: number;
  memory: { rss: number; heapTotal: number; heapUsed: number; external: number; arrayBuffers: number };
  heartbeat: Record<string, any>;
  innerLife: Record<string, any>;
  digest: Record<string, any>;
  timestamp: string;
};

type StatsPayload = {
  treasury: { recordedSats: number; bySource: { source: string; totalSats: number; count: number }[]; note: string };
  users: { totalUsers: number; activeUsers: number; byPlatform: { platform: string; count: number }[] };
  memory: { total: number; active: number; expired: number; byType: Record<string, number>; bySource: Record<string, number> };
  containers: number;
  version: string;
};

type CostsPayload = {
  today: { cost: number; calls: number; breakdown: Record<string, { calls: number; tokens: number; cost: number }>; byTask: Record<string, { calls: number; cost: number }> };
  savings: { amount: number; wouldHaveCost: number; actualCost: number; percentage: number };
  projection: { daily: number; monthly: number; daysRemaining: number | null };
  status: 'ok' | 'warning';
  lastSaved: string;
};

type CostHistoryPayload = {
  history: { entries?: { model: string; inputTokens: number; outputTokens: number; timestamp: string; task: string }[] };
  updatedAt: string | null;
};

type AuditPayload = { entries: { ts: string; type: string; summary: string; data?: Record<string, any> }[] };

type AuditSummaryPayload = { count: number; byType: Record<string, number>; lastByType: Record<string, string>; lastTs: string | null };

type RevenuePayload = {
  totalSats: number;
  bySource: { source: string; totalSats: number; count: number }[];
  recent: { source: string; amountSats: number; description: string | null; createdAt: string }[];
};

type RevenueSummaryPayload = {
  totalSats: number;
  bySource: { source: string; totalSats: number; count: number }[];
};

type WalletPayload = { address: string; minSats: number; maxSats: number; description: any; active: boolean } | { error: string; active: false };

type JobsPayload = {
  jobs: { id: string; prompt: string; status: string; createdAt: number; startedAt?: number; completedAt?: number; output?: string }[];
};

type JobsSummaryPayload = {
  count: number;
  byStatus: Record<string, number>;
  lastCompletedAt: string | null;
};

type RemindersPayload = {
  reminders: { id: number; rawMessage: string; dueAt: string; platform: string; status: string; platformChatId?: string | null }[];
  stats: Record<string, number>;
};

type InnerLifePayload = {
  reflections: { content: string; truncated: boolean; updatedAt: string | null };
  learnings: { content: string; truncated: boolean; updatedAt: string | null };
  ideas: { content: string; truncated: boolean; updatedAt: string | null };
  evolution: { content: string; truncated: boolean; updatedAt: string | null };
  ideaGarden: { content: string; truncated: boolean; updatedAt: string | null };
  projects: { content: string; truncated: boolean; updatedAt: string | null };
  status: Record<string, any>;
};

type MemoriesPayload = {
  memories: { id: number; content: string; type: string; source: string; accessCount: number; userId?: string | null; platform?: string | null; createdAt: string; updatedAt: string }[];
};

type HeartbeatSummaryPayload = { status: Record<string, any> };

type ConversationsPayload = {
  messages: { ts: string; platform: string; user: string; assistant: string }[];
  count: number;
  userId: string;
};

const POLL_FAST = 15000;
const POLL_SLOW = 30000;
const OWNER_NPUB = 'npub1m3hxtn6auzjfdwux4cpzrpzt8dyt60dzvs7dm08rfes82jk9hxtseudltp';

function formatDuration(totalSeconds: number) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function formatNumber(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toLocaleString();
}

function formatMoney(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '—';
  return `$${value.toFixed(2)}`;
}

function since(iso: string | null | undefined) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return '—';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function countdown(iso: string | null | undefined) {
  if (!iso) return '—';
  const diff = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(diff)) return '—';
  if (diff <= 0) return 'overdue';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `in ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainMin = minutes % 60;
  if (hours < 24) return `in ${hours}h ${remainMin}m`;
  const days = Math.floor(hours / 24);
  const remainHours = hours % 24;
  return `in ${days}d ${remainHours}h`;
}

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [costs, setCosts] = useState<CostsPayload | null>(null);
  const [costHistory, setCostHistory] = useState<CostHistoryPayload | null>(null);
  const [audit, setAudit] = useState<AuditPayload | null>(null);
  const [auditSummary, setAuditSummary] = useState<AuditSummaryPayload | null>(null);
  const [revenue, setRevenue] = useState<RevenuePayload | null>(null);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummaryPayload | null>(null);
  const [wallet, setWallet] = useState<WalletPayload | null>(null);
  const [jobs, setJobs] = useState<JobsPayload | null>(null);
  const [jobsSummary, setJobsSummary] = useState<JobsSummaryPayload | null>(null);
  const [reminders, setReminders] = useState<RemindersPayload | null>(null);
  const [innerLife, setInnerLife] = useState<InnerLifePayload | null>(null);
  const [memories, setMemories] = useState<MemoriesPayload | null>(null);
  const [heartbeatSummary, setHeartbeatSummary] = useState<HeartbeatSummaryPayload | null>(null);
  const [conversations, setConversations] = useState<ConversationsPayload | null>(null);
  const [innerMonologue, setInnerMonologue] = useState<ConversationsPayload | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [memorySearch, setMemorySearch] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [nostrPubkey, setNostrPubkey] = useState<string | null>(null);

  const fetchJson = async <T,>(url: string, setter: (value: T | null) => void) => {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setter(data as T);
    } catch {
      setter(null);
    }
  };

  const normalizeUrlForNip98 = (url: string) => (url.startsWith('/v2/') ? url.replace(/^\/v2/, '') : url);

  const sha256Hex = async (value: string) => {
    const data = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const signNip98 = async (url: string, method: string, body?: string) => {
    const nostr = (window as any)?.nostr as undefined | { getPublicKey: () => Promise<string>; signEvent: (event: any) => Promise<any> };
    if (!nostr) throw new Error('NIP-07 extension not found');

    const publicKey = await nostr.getPublicKey();
    setNostrPubkey(publicKey);

    const absoluteUrl = `${window.location.origin}${normalizeUrlForNip98(url)}`;
    const tags: string[][] = [
      ['u', absoluteUrl],
      ['method', method.toUpperCase()],
    ];
    if (body) {
      const payload = await sha256Hex(body);
      tags.push(['payload', payload]);
    }

    const event = {
      kind: 27235,
      created_at: Math.floor(Date.now() / 1000),
      tags,
      content: '',
    };

    const signed = await nostr.signEvent(event);
    const encoded = btoa(JSON.stringify(signed));
    return `Nostr ${encoded}`;
  };

  const signedFetchJson = async <T,>(url: string, setter: (value: T | null) => void, init?: RequestInit) => {
    try {
      const method = (init?.method ?? 'GET').toString().toUpperCase();
      const body = typeof init?.body === 'string' ? init.body : undefined;
      const authHeader = await signNip98(url, method, body);
      const res = await fetch(url, {
        ...init,
        cache: 'no-store',
        headers: {
          ...(init?.headers ?? {}),
          Authorization: authHeader,
        },
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setAuthError('Unauthorized. This dashboard is locked to the owner Nostr key.');
          setIsUnlocked(false);
        }
        throw new Error('fetch failed');
      }
      const data = await res.json();
      setter(data as T);
    } catch {
      setter(null);
    }
  };

  const unlock = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const nostr = (window as any)?.nostr as undefined | { getPublicKey: () => Promise<string>; signEvent: (event: any) => Promise<any> };
      if (!nostr) throw new Error('NIP-07 extension not detected');
      const pubkey = await nostr.getPublicKey();
      setNostrPubkey(pubkey);

      const authHeader = await signNip98('/v2/api/heartbeat', 'GET');
      const res = await fetch('/v2/api/heartbeat', { headers: { Authorization: authHeader }, cache: 'no-store' });
      if (!res.ok) {
        setIsUnlocked(false);
        setAuthError('Owner key required. This Nostr account is not authorized.');
        return;
      }

      setIsUnlocked(true);
    } catch (err: any) {
      setIsUnlocked(false);
      setAuthError(err?.message ?? 'Unable to connect to Nostr extension');
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    fetchJson<HealthPayload>('/v2/health', setHealth);
    fetchJson<StatsPayload>('/v2/api/stats', setStats);
    fetchJson<CostsPayload>('/v2/api/costs', setCosts);
    fetchJson<CostHistoryPayload>('/v2/api/costs/history', setCostHistory);
    fetchJson<AuditSummaryPayload>('/v2/api/audit/summary', setAuditSummary);
    fetchJson<RevenueSummaryPayload>('/v2/api/revenue/summary', setRevenueSummary);
    fetchJson<JobsSummaryPayload>('/v2/api/jobs/summary', setJobsSummary);
    fetchJson<HeartbeatSummaryPayload>('/v2/api/heartbeat/summary', setHeartbeatSummary);

    const fast = setInterval(() => {
      fetchJson<HealthPayload>('/v2/health', setHealth);
      fetchJson<StatsPayload>('/v2/api/stats', setStats);
      fetchJson<CostsPayload>('/v2/api/costs', setCosts);
      fetchJson<AuditSummaryPayload>('/v2/api/audit/summary', setAuditSummary);
    }, POLL_FAST);

    const slow = setInterval(() => {
      fetchJson<CostHistoryPayload>('/v2/api/costs/history', setCostHistory);
      fetchJson<RevenueSummaryPayload>('/v2/api/revenue/summary', setRevenueSummary);
      fetchJson<JobsSummaryPayload>('/v2/api/jobs/summary', setJobsSummary);
      fetchJson<HeartbeatSummaryPayload>('/v2/api/heartbeat/summary', setHeartbeatSummary);
    }, POLL_SLOW);

    return () => {
      clearInterval(fast);
      clearInterval(slow);
    };
  }, []);

  useEffect(() => {
    if (!isUnlocked) return;

    signedFetchJson<AuditPayload>('/v2/api/audit?limit=120', setAudit);
    signedFetchJson<RevenuePayload>('/v2/api/revenue', setRevenue);
    signedFetchJson<WalletPayload>('/v2/api/wallet', setWallet);
    signedFetchJson<JobsPayload>('/v2/api/jobs?limit=10', setJobs);
    signedFetchJson<RemindersPayload>('/v2/api/reminders?limit=20', setReminders);
    signedFetchJson<InnerLifePayload>('/v2/api/inner-life', setInnerLife);
    signedFetchJson<MemoriesPayload>('/v2/api/memories?limit=120', setMemories);
    signedFetchJson<ConversationsPayload>('/v2/api/conversations/syntropy-admin?limit=100', setConversations);
    signedFetchJson<ConversationsPayload>('/v2/api/conversations/pixel-self?limit=50', setInnerMonologue);

    const privatePoll = setInterval(() => {
      signedFetchJson<AuditPayload>('/v2/api/audit?limit=120', setAudit);
      signedFetchJson<RevenuePayload>('/v2/api/revenue', setRevenue);
      signedFetchJson<WalletPayload>('/v2/api/wallet', setWallet);
      signedFetchJson<JobsPayload>('/v2/api/jobs?limit=10', setJobs);
      signedFetchJson<RemindersPayload>('/v2/api/reminders?limit=20', setReminders);
      signedFetchJson<InnerLifePayload>('/v2/api/inner-life', setInnerLife);
      signedFetchJson<MemoriesPayload>('/v2/api/memories?limit=120', setMemories);
      signedFetchJson<ConversationsPayload>('/v2/api/conversations/syntropy-admin?limit=100', setConversations);
      signedFetchJson<ConversationsPayload>('/v2/api/conversations/pixel-self?limit=50', setInnerMonologue);
    }, POLL_SLOW);

    return () => {
      clearInterval(privatePoll);
    };
  }, [isUnlocked]);

  const filteredAudit = useMemo(() => {
    if (!audit?.entries) return [];
    const sorted = [...audit.entries].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
    if (filter === 'all') return sorted;
    return sorted.filter((entry) => entry.type === filter);
  }, [audit, filter]);

  const filteredMemories = useMemo(() => {
    if (!memories?.memories) return [];
    const sorted = [...memories.memories].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    if (!memorySearch.trim()) return sorted;
    const term = memorySearch.toLowerCase();
    return sorted.filter((mem) => mem.content.toLowerCase().includes(term));
  }, [memories, memorySearch]);

  const sortedConversations = useMemo(() => {
    if (!conversations?.messages) return [];
    return [...conversations.messages].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  }, [conversations]);

  const sortedMonologue = useMemo(() => {
    if (!innerMonologue?.messages) return [];
    return [...innerMonologue.messages].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  }, [innerMonologue]);

  const sortedJobs = useMemo(() => {
    if (!jobs?.jobs) return [];
    return [...jobs.jobs].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [jobs]);

  const recentRevenue = useMemo(() => {
    if (!revenue?.recent) return [];
    return [...revenue.recent]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [revenue]);

  const costByDay = useMemo(() => {
    const entries = costHistory?.history?.entries ?? [];
    const byDay: Record<string, number> = {};
    for (const entry of entries) {
      const day = new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      byDay[day] = (byDay[day] ?? 0) + entry.inputTokens + entry.outputTokens;
    }
    return Object.entries(byDay).slice(-7);
  }, [costHistory]);

  const costScale = useMemo(() => {
    if (costByDay.length === 0) return 1;
    return Math.max(...costByDay.map(([, tokens]) => tokens), 1);
  }, [costByDay]);

  const walletAddress = useMemo(() => {
    if (!wallet) return 'unavailable';
    if ('address' in wallet) return wallet.address;
    return 'unavailable';
  }, [wallet]);

  const publicRevenue = revenueSummary ?? revenue;

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono selection:bg-green-900 selection:text-white">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)] z-0" />
      <div className="fixed inset-0 pointer-events-none opacity-10 bg-[url('/grid.svg')] z-0" style={{ backgroundSize: '40px 40px' }} />

      <header className="border-b border-green-900/40 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-green-400 transition-colors uppercase text-xs tracking-[0.3em]">
              ← return
            </Link>
            <div>
              <div className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-500">
                PIXEL_LIVE_DASHBOARD
              </div>
              <div className="text-xs text-gray-500">Real-time operational telemetry</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-green-400">STATUS:</span>
            <span className={`px-2 py-1 border rounded ${health?.status === 'alive' ? 'border-green-500 text-green-300' : 'border-red-500 text-red-400'}`}>
              {health?.status ?? 'offline'}
            </span>
            <span className="text-gray-500">Last update {health ? since(health.timestamp) : '—'}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10 relative z-10">
        <section className="grid gap-6 md:grid-cols-3">
          <div className="border border-green-900/40 bg-black/60 p-5 rounded-lg shadow-lg">
            <div className="text-xs text-green-400 uppercase tracking-widest">System Status</div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Uptime</span><span className="text-white">{health ? formatDuration(health.uptime) : '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Version</span><span className="text-green-300">{health?.version ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Containers</span><span className="text-white">{stats?.containers ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Heap Used</span><span className="text-yellow-300">{health?.memory ? `${Math.round(health.memory.heapUsed / 1024 / 1024)} MB` : '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">RSS</span><span className="text-yellow-300">{health?.memory ? `${Math.round(health.memory.rss / 1024 / 1024)} MB` : '—'}</span></div>
            </div>
          </div>

          <div className="border border-green-900/40 bg-black/60 p-5 rounded-lg shadow-lg">
            <div className="text-xs text-green-400 uppercase tracking-widest">Core KPIs</div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-green-900/20 border border-green-900/40 p-3 rounded">
                <div className="text-xl text-white">{formatNumber(stats?.users.totalUsers)}</div>
                <div className="text-xs text-gray-500">Total users</div>
              </div>
              <div className="bg-green-900/20 border border-green-900/40 p-3 rounded">
                <div className="text-xl text-yellow-300">{formatNumber(stats?.memory.active)}</div>
                <div className="text-xs text-gray-500">Active memories</div>
              </div>
              <div className="bg-green-900/20 border border-green-900/40 p-3 rounded">
                <div className="text-xl text-white">{formatNumber(health?.heartbeat?.heartbeatCount)}</div>
                <div className="text-xs text-gray-500">Heartbeat cycles</div>
              </div>
              <div className="bg-green-900/20 border border-green-900/40 p-3 rounded">
                <div className="text-xl text-yellow-300">{formatMoney(costs?.today.cost)}</div>
                <div className="text-xs text-gray-500">Today cost</div>
              </div>
            </div>
          </div>

          <div className="border border-green-900/40 bg-black/60 p-5 rounded-lg shadow-lg">
            <div className="text-xs text-green-400 uppercase tracking-widest">Heartbeat</div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Last topic</span><span className="text-white">{heartbeatSummary?.status?.lastTopic ?? health?.heartbeat?.lastTopic ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Last mood</span><span className="text-white">{heartbeatSummary?.status?.lastMood ?? health?.heartbeat?.lastMood ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Last post</span><span className="text-white">{since(heartbeatSummary?.status?.lastPostTime ?? health?.heartbeat?.lastPostTime)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Engagement</span><span className="text-green-300">{(heartbeatSummary?.status?.engagementActive ?? health?.heartbeat?.engagementActive) ? 'active' : 'paused'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Multiplier</span><span className="text-white">{heartbeatSummary?.status?.engagementMultiplier ?? health?.heartbeat?.engagementMultiplier ?? '—'}</span></div>
            </div>
          </div>
        </section>

        <section className="border border-green-900/40 bg-black/60 p-6 rounded-lg">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs text-green-400 uppercase tracking-widest">Private Access</div>
              <div className="text-sm text-gray-500">Sensitive detail panels require Nostr owner auth (NIP-07)</div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <button
                onClick={unlock}
                disabled={authLoading}
                className="px-4 py-2 border border-green-700/60 rounded bg-green-900/20 text-green-200 hover:bg-green-900/40 transition disabled:opacity-50"
              >
                {authLoading ? 'Unlocking…' : isUnlocked ? 'Unlocked' : 'Unlock with Nostr'}
              </button>
              <div className="text-gray-500">Owner: {OWNER_NPUB.slice(0, 12)}…{OWNER_NPUB.slice(-6)}</div>
              {nostrPubkey && <div className="text-gray-500">You: {nostrPubkey.slice(0, 12)}…{nostrPubkey.slice(-6)}</div>}
            </div>
          </div>
          {authError && <div className="mt-3 text-xs text-red-400">{authError}</div>}
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="border border-yellow-900/40 bg-black/60 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-yellow-400 uppercase tracking-widest">Cost Monitor</div>
                <div className="text-sm text-gray-500">AI spend + efficiency</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded border ${costs?.status === 'warning' ? 'border-red-500 text-red-400' : 'border-green-600 text-green-400'}`}>
                {costs?.status ?? '—'}
              </span>
            </div>
            <div className="mt-4 grid gap-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-yellow-900/20 border border-yellow-900/30 p-3 rounded">
                  <div className="text-lg text-white">{formatMoney(costs?.today.cost)}</div>
                  <div className="text-xs text-gray-500">Today cost</div>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-900/30 p-3 rounded">
                  <div className="text-lg text-yellow-300">{formatNumber(costs?.today.calls)}</div>
                  <div className="text-xs text-gray-500">Calls today</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">Savings vs all gemini-3: {formatMoney(costs?.savings.amount)} ({costs?.savings.percentage ?? 0}%)</div>
              <div className="grid gap-2 text-xs">
                {costs?.today.breakdown && Object.entries(costs.today.breakdown).map(([model, data]) => (
                  <div key={model} className="flex justify-between border-b border-yellow-900/20 pb-1">
                    <span className="text-gray-400">{model}</span>
                    <span className="text-yellow-300">{formatNumber(data.calls)} calls · {formatMoney(data.cost)}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                <div>Projection monthly: <span className="text-white">{formatMoney(costs?.projection.monthly)}</span></div>
                <div>Days remaining: <span className="text-white">{costs?.projection.daysRemaining ?? '—'}</span></div>
              </div>
              <div>
                <div className="text-xs text-gray-500">7-day token volume</div>
                <div className="mt-2 space-y-2 text-xs">
                  {costByDay.map(([day, tokens]) => (
                    <div key={day} className="flex items-center gap-2">
                      <span className="w-16 text-gray-500">{day}</span>
                      <div className="flex-1 h-2 bg-yellow-900/30 rounded">
                        <div className="h-2 bg-yellow-500/50 rounded" style={{ width: `${Math.min(tokens / costScale, 1) * 100}%` }} />
                      </div>
                      <span className="text-gray-400">{Math.round(tokens / 1000)}k</span>
                    </div>
                  ))}
                  {costByDay.length === 0 && <div className="text-gray-500">No history yet.</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="border border-green-900/40 bg-black/60 p-6 rounded-lg">
            <div className="text-xs text-green-400 uppercase tracking-widest">Heartbeat Timers</div>
            <div className="mt-4 grid gap-2 text-xs">
              {health?.heartbeat && Object.entries(health.heartbeat).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-green-900/20 pb-1">
                  <span className="text-gray-500">{key}</span>
                  <span className="text-white">{typeof value === 'string' ? value : typeof value === 'number' ? String(value) : value ? 'true' : 'false'}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {isUnlocked && (
          <>
            <section className="grid gap-6 md:grid-cols-2">
              <div className="border border-purple-900/40 bg-black/60 p-6 rounded-lg">
                <div className="text-xs text-purple-400 uppercase tracking-widest">Inner Life</div>
                <div className="mt-4 space-y-4 text-xs text-gray-300">
                  {innerLife && (
                    <>
                      <div>
                        <div className="text-purple-300 uppercase text-[10px]">Reflections</div>
                        <div className="mt-2 whitespace-pre-wrap max-h-40 overflow-auto">{innerLife.reflections.content || '—'}</div>
                      </div>
                      <div>
                        <div className="text-purple-300 uppercase text-[10px]">Learnings</div>
                        <div className="mt-2 whitespace-pre-wrap max-h-40 overflow-auto">{innerLife.learnings.content || '—'}</div>
                      </div>
                      <div>
                        <div className="text-purple-300 uppercase text-[10px]">Ideas</div>
                        <div className="mt-2 whitespace-pre-wrap max-h-40 overflow-auto">{innerLife.ideas.content || '—'}</div>
                      </div>
                      <div>
                        <div className="text-purple-300 uppercase text-[10px]">Evolution</div>
                        <div className="mt-2 whitespace-pre-wrap max-h-40 overflow-auto">{innerLife.evolution.content || '—'}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="border border-blue-900/40 bg-black/60 p-6 rounded-lg">
                <div className="text-xs text-blue-400 uppercase tracking-widest">Idea Garden + Projects</div>
                <div className="mt-4 space-y-4 text-xs text-gray-300">
                  <div>
                    <div className="text-blue-300 uppercase text-[10px]">Idea Garden</div>
                    <div className="mt-2 whitespace-pre-wrap max-h-40 overflow-auto">{innerLife?.ideaGarden.content || '—'}</div>
                  </div>
                  <div>
                    <div className="text-blue-300 uppercase text-[10px]">Projects</div>
                    <div className="mt-2 whitespace-pre-wrap max-h-40 overflow-auto">{innerLife?.projects.content || '—'}</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="border border-teal-900/40 bg-black/60 p-6 rounded-lg">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs text-teal-300 uppercase tracking-widest">Syntropy Conversations</div>
                  <div className="text-sm text-gray-500">Latest exchanges between Syntropy and Pixel</div>
                </div>
                <div className="text-xs text-teal-200">{formatNumber(conversations?.count ?? 0)} messages</div>
              </div>
              <div className="mt-4 space-y-4 text-xs text-gray-300 max-h-96 overflow-auto pr-2">
                {sortedConversations.map((entry, idx) => (
                  <div key={`${entry.ts}-${idx}`} className="border border-teal-900/30 bg-teal-900/10 rounded p-3">
                    <div className="flex items-center justify-between text-[10px] uppercase text-teal-200">
                      <span>{entry.platform || 'http'} · {since(entry.ts)}</span>
                      <span>{new Date(entry.ts).toLocaleString()}</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-[10px] text-teal-300 uppercase">Syntropy</div>
                      <div className="mt-1 whitespace-pre-wrap text-gray-200">{entry.user || '—'}</div>
                    </div>
                    <div className="mt-3">
                      <div className="text-[10px] text-teal-400 uppercase">Pixel</div>
                      <div className="mt-1 whitespace-pre-wrap text-gray-100">{entry.assistant || '—'}</div>
                    </div>
                  </div>
                ))}
                {(!conversations?.messages || conversations.messages.length === 0) && (
                  <div className="text-gray-500">No Syntropy conversations yet.</div>
                )}
              </div>
            </section>

            <section className="border border-amber-900/40 bg-black/60 p-6 rounded-lg">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs text-amber-300 uppercase tracking-widest">Pixel&apos;s Inner Monologue</div>
                  <div className="text-sm text-gray-500">Internal research reactions and self-conversations</div>
                </div>
                <div className="text-xs text-amber-200">{formatNumber(innerMonologue?.count ?? 0)} messages</div>
              </div>
              <div className="mt-4 space-y-4 text-xs text-gray-300 max-h-96 overflow-auto pr-2">
                {sortedMonologue.map((entry, idx) => (
                  <div key={`${entry.ts}-${idx}`} className="border border-amber-900/30 bg-amber-900/10 rounded p-3">
                    <div className="flex items-center justify-between text-[10px] uppercase text-amber-200">
                      <span>{entry.platform || 'internal'} · {since(entry.ts)}</span>
                      <span>{new Date(entry.ts).toLocaleString()}</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-[10px] text-amber-300 uppercase">Stimulus</div>
                      <div className="mt-1 whitespace-pre-wrap text-gray-200">{entry.user || '—'}</div>
                    </div>
                    <div className="mt-3">
                      <div className="text-[10px] text-amber-400 uppercase">Pixel</div>
                      <div className="mt-1 whitespace-pre-wrap text-gray-100">{entry.assistant || '—'}</div>
                    </div>
                  </div>
                ))}
                {(!innerMonologue?.messages || innerMonologue.messages.length === 0) && (
                  <div className="text-gray-500">No inner monologue yet. Will populate when Pixel completes internal research tasks.</div>
                )}
              </div>
            </section>

            <section className="border border-green-900/40 bg-black/60 p-6 rounded-lg">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs text-green-400 uppercase tracking-widest">Memories</div>
                  <div className="text-sm text-gray-500">Active memory facts, episodes, and procedures</div>
                </div>
                <input
                  value={memorySearch}
                  onChange={(event) => setMemorySearch(event.target.value)}
                  placeholder="search memories..."
                  className="bg-black/60 border border-green-900/40 rounded px-3 py-2 text-xs text-gray-200"
                />
              </div>
              <div className="mt-4 space-y-3 text-xs text-gray-300 max-h-96 overflow-auto pr-2">
                {filteredMemories.map((mem) => (
                  <div key={mem.id} className="border border-green-900/30 p-3 rounded">
                    <div className="flex flex-wrap gap-2 text-[10px] uppercase text-green-300">
                      <span>{mem.type}</span>
                      <span className="text-gray-500">{mem.source}</span>
                      {mem.platform && <span className="text-gray-500">{mem.platform}</span>}
                    </div>
                    <div className="mt-2 text-gray-200">{mem.content}</div>
                    <div className="mt-2 text-[10px] text-gray-500">Accessed {mem.accessCount} · Updated {since(mem.updatedAt)}</div>
                  </div>
                ))}
                {filteredMemories.length === 0 && <div className="text-gray-500">No memories found.</div>}
              </div>
            </section>
          </>
        )}

        <section className="grid gap-6 md:grid-cols-2">
          <div className="border border-green-900/40 bg-black/60 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-green-400 uppercase tracking-widest">Activity Feed</div>
                <div className="text-sm text-gray-500">Latest audit events</div>
              </div>
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="bg-black/70 border border-green-900/40 rounded text-xs text-gray-200 px-2 py-1"
                disabled={!isUnlocked}
              >
                <option value="all">all</option>
                <option value="heartbeat_post">heartbeat_post</option>
                <option value="engagement_reply">engagement_reply</option>
                <option value="inner_life_reflect">inner_life_reflect</option>
                <option value="inner_life_learn">inner_life_learn</option>
                <option value="inner_life_ideate">inner_life_ideate</option>
                <option value="inner_life_evolve">inner_life_evolve</option>
                <option value="revenue">revenue</option>
                <option value="tool_use">tool_use</option>
                <option value="error">error</option>
              </select>
            </div>
            {!isUnlocked && (
              <div className="mt-4 text-xs text-gray-500">
                Private feed locked. Summary: {auditSummary?.count ?? 0} events · last {since(auditSummary?.lastTs)}
              </div>
            )}
            {isUnlocked && (
              <div className="mt-4 space-y-3 text-xs text-gray-300 max-h-96 overflow-auto pr-2">
                {filteredAudit.map((entry, idx) => (
                  <div key={`${entry.ts}-${idx}`} className="border-b border-green-900/20 pb-2">
                    <div className="text-[10px] text-gray-500">{new Date(entry.ts).toLocaleTimeString()} · {entry.type}</div>
                    <div className="text-gray-200">{entry.summary}</div>
                  </div>
                ))}
                {filteredAudit.length === 0 && <div className="text-gray-500">No events yet.</div>}
              </div>
            )}
          </div>

          <div className="border border-yellow-900/40 bg-black/60 p-6 rounded-lg">
            <div className="text-xs text-yellow-400 uppercase tracking-widest">Revenue + Wallet</div>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="bg-yellow-900/20 border border-yellow-900/30 p-3 rounded">
                <div className="text-lg text-white">{formatNumber(publicRevenue?.totalSats)}</div>
                <div className="text-xs text-gray-500">Recorded sats</div>
              </div>
              <div className="text-xs text-gray-500">Wallet: {isUnlocked ? walletAddress : 'locked'}</div>
              <div className="space-y-2 text-xs">
                {publicRevenue?.bySource?.map((entry) => (
                  <div key={entry.source} className="flex justify-between border-b border-yellow-900/20 pb-1">
                    <span className="text-gray-400">{entry.source}</span>
                    <span className="text-yellow-300">{formatNumber(entry.totalSats)} sats</span>
                  </div>
                ))}
              </div>
              {isUnlocked && (
                <>
                  <div className="text-xs text-gray-500">Recent</div>
                  <div className="space-y-2 text-xs">
                    {recentRevenue.map((entry, idx) => (
                      <div key={`${entry.source}-${idx}`} className="border-b border-yellow-900/20 pb-1">
                        <div className="text-gray-400">{entry.source} · {formatNumber(entry.amountSats)} sats</div>
                        <div className="text-gray-500">{entry.description ?? '—'} · {since(entry.createdAt)}</div>
                      </div>
                    ))}
                  {recentRevenue.length === 0 && <div className="text-gray-500">No revenue yet.</div>}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="border border-green-900/40 bg-black/60 p-6 rounded-lg">
            <div className="text-xs text-green-400 uppercase tracking-widest">Users</div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="text-white">{formatNumber(stats?.users.totalUsers)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Active (7d)</span><span className="text-white">{formatNumber(stats?.users.activeUsers)}</span></div>
              <div className="mt-4 space-y-2 text-xs">
                {stats?.users.byPlatform?.map((entry) => (
                  <div key={entry.platform} className="flex justify-between border-b border-green-900/20 pb-1">
                    <span className="text-gray-400">{entry.platform}</span>
                    <span className="text-green-300">{formatNumber(entry.count)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border border-blue-900/40 bg-black/60 p-6 rounded-lg">
            <div className="text-xs text-blue-400 uppercase tracking-widest">Jobs + Reports</div>
            {!isUnlocked && (
              <div className="mt-4 text-xs text-gray-500">
                Private job output locked. {jobsSummary?.count ?? 0} jobs · last complete {since(jobsSummary?.lastCompletedAt)}
              </div>
            )}
            {isUnlocked && (
              <div className="mt-4 space-y-3 text-xs text-gray-300 max-h-72 overflow-auto pr-2">
                {sortedJobs.map((job) => (
                  <div key={job.id} className="border-b border-blue-900/20 pb-2">
                    <div className="text-blue-300 text-[10px] uppercase">{job.status}</div>
                    <div className="text-gray-200">{job.prompt}</div>
                    {job.output && <div className="text-gray-500 mt-1 whitespace-pre-wrap">{job.output}</div>}
                  </div>
                ))}
                {jobs?.jobs?.length === 0 && <div className="text-gray-500">No jobs yet.</div>}
              </div>
            )}
          </div>
        </section>

        {isUnlocked && (() => {
          const REMINDERS_PREVIEW = 3;
          const sorted = [...(reminders?.reminders ?? [])].sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
          const visible = sorted.slice(0, REMINDERS_PREVIEW);
          const remaining = sorted.length - visible.length;
          return (
            <section className="border border-green-900/40 bg-black/60 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-xs text-green-400 uppercase tracking-widest">Reminders</div>
                <div className="text-xs text-gray-500">{formatNumber(reminders?.stats?.active)} active</div>
              </div>
              <div className="mt-4 grid gap-2 text-xs text-gray-300">
                {visible.map((reminder) => {
                  const cd = countdown(reminder.dueAt);
                  const isOverdue = cd === 'overdue';
                  return (
                    <div key={reminder.id} className={`border p-3 rounded ${isOverdue ? 'border-red-900/40 bg-red-900/10' : 'border-green-900/20'}`}>
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] text-gray-500 uppercase">{reminder.platform} · {reminder.status}</div>
                        <div className={`text-[10px] font-bold ${isOverdue ? 'text-red-400' : 'text-green-300'}`}>{cd}</div>
                      </div>
                      <div className="text-gray-200 mt-1">{reminder.rawMessage}</div>
                    </div>
                  );
                })}
                {visible.length === 0 && <div className="text-gray-500">No active reminders.</div>}
                {remaining > 0 && (
                  <div className="text-gray-500 text-center mt-1">+{remaining} more reminder{remaining > 1 ? 's' : ''}</div>
                )}
              </div>
            </section>
          );
        })()}
      </main>
    </div>
  );
}
