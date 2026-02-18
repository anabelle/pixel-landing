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
  activeMissions: { content: string; truncated: boolean; updatedAt: string | null };
  innerMonologueFile: { content: string; truncated: boolean; updatedAt: string | null };
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
    <div className="min-h-screen deep-gradient text-[var(--text-primary)] font-mono relative">
      <div className="noise-overlay" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(0,245,212,0.12),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_90%,rgba(247,37,133,0.1),transparent_40%)]" />
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(120deg,transparent_0%,rgba(0,245,212,0.05)_40%,transparent_70%)]" />
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[rgba(5,8,16,0.8)] border-b border-[rgba(0,245,212,0.1)]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-[var(--text-secondary)] hover:text-[var(--cyan-glow)] transition-colors text-xs uppercase tracking-[0.3em]">
              ← return
            </Link>
            <div className="space-y-1">
              <div className="text-2xl font-sans font-semibold gradient-text-cyan tracking-[0.2em]">
                BIOCORE TELEMETRY
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Vital signs of the Pixel organism</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-muted)]">Status</span>
              <span className={`px-3 py-1 rounded-full border ${health?.status === 'alive' ? 'status-alive border-[rgba(0,245,212,0.4)]' : 'status-danger border-[rgba(247,37,133,0.4)]'} animate-border-pulse`}>
                {health?.status ?? 'offline'}
              </span>
            </div>
            <div className="text-[var(--text-secondary)]">Last update {health ? since(health.timestamp) : '—'}</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12 relative z-10">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div className="glass-card p-6 animate-glow-pulse">
            <div className="flex items-center justify-between">
              <div className="section-label text-[var(--cyan-glow)]">System Vital Signs</div>
              <div className="text-[10px] text-[var(--text-muted)]">core loop</div>
            </div>
            <div className="mt-6 grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Uptime</span>
                <span className="text-[var(--text-bright)]">{health ? formatDuration(health.uptime) : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Version</span>
                <span className="gradient-text-cyan">{health?.version ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Containers</span>
                <span className="text-[var(--text-bright)]">{stats?.containers ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Heap Used</span>
                <span className="gradient-text-amber">{health?.memory ? `${Math.round(health.memory.heapUsed / 1024 / 1024)} MB` : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">RSS</span>
                <span className="gradient-text-amber">{health?.memory ? `${Math.round(health.memory.rss / 1024 / 1024)} MB` : '—'}</span>
              </div>
            </div>
            <div className="mt-6 h-2 rounded-full bg-[rgba(0,245,212,0.08)] overflow-hidden">
              <div className="h-full w-2/3 bg-[linear-gradient(90deg,rgba(0,245,212,0.6),rgba(0,245,212,0.2))] animate-shimmer" />
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="section-label text-[var(--violet-glow)]">Core KPIs</div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-[rgba(123,44,191,0.2)] bg-[rgba(123,44,191,0.08)]">
                <div className="metric-value gradient-text-cyan">{formatNumber(stats?.users.totalUsers)}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">Total users</div>
              </div>
              <div className="p-4 rounded-lg border border-[rgba(0,245,212,0.2)] bg-[rgba(0,245,212,0.08)]">
                <div className="metric-value gradient-text-amber">{formatNumber(stats?.memory.active)}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">Active memories</div>
              </div>
              <div className="p-4 rounded-lg border border-[rgba(0,245,212,0.2)] bg-[rgba(0,245,212,0.08)]">
                <div className="metric-value gradient-text-magenta">{formatNumber(health?.heartbeat?.heartbeatCount)}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">Heartbeat cycles</div>
              </div>
              <div className="p-4 rounded-lg border border-[rgba(255,195,0,0.2)] bg-[rgba(255,195,0,0.08)]">
                <div className="metric-value gradient-text-amber">{formatMoney(costs?.today.cost)}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">Today cost</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="section-label text-[var(--magenta-glow)]">Heartbeat</div>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Last topic</span>
                <span className="text-[var(--text-bright)]">{heartbeatSummary?.status?.lastTopic ?? health?.heartbeat?.lastTopic ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Last mood</span>
                <span className="text-[var(--text-bright)]">{heartbeatSummary?.status?.lastMood ?? health?.heartbeat?.lastMood ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Last post</span>
                <span className="text-[var(--text-bright)]">{since(heartbeatSummary?.status?.lastPostTime ?? health?.heartbeat?.lastPostTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Engagement</span>
                <span className={
                  (heartbeatSummary?.status?.engagementActive ?? health?.heartbeat?.engagementActive)
                    ? 'status-alive'
                    : 'text-[var(--text-secondary)]'
                }>
                  {(heartbeatSummary?.status?.engagementActive ?? health?.heartbeat?.engagementActive) ? 'active' : 'paused'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Multiplier</span>
                <span className="text-[var(--text-bright)]">{heartbeatSummary?.status?.engagementMultiplier ?? health?.heartbeat?.engagementMultiplier ?? '—'}</span>
              </div>
            </div>
            <div className="mt-6 h-10 flex items-center justify-center">
              <svg viewBox="0 0 300 40" className="w-full h-full">
                <polyline
                  points="0,20 40,20 55,10 70,30 85,20 120,20 135,5 150,35 165,20 220,20 240,12 260,28 280,20 300,20"
                  fill="none"
                  stroke="rgba(0,245,212,0.7)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="1000"
                  className="animate-[heartbeat-line_4s_linear_infinite]"
                />
              </svg>
            </div>
          </div>
        </section>

        <section className="glass-card p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="section-label text-[var(--cyan-glow)]">Private Access</div>
              <div className="text-sm text-[var(--text-secondary)] mt-2">Sensitive panels require Nostr owner auth (NIP-07)</div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <button
                onClick={unlock}
                disabled={authLoading}
                className="px-5 py-2 rounded-full border border-[rgba(0,245,212,0.4)] bg-[rgba(0,245,212,0.1)] text-[var(--cyan-glow)] hover:bg-[rgba(0,245,212,0.2)] transition disabled:opacity-50"
              >
                {authLoading ? 'Unlocking…' : isUnlocked ? 'Unlocked' : 'Unlock with Nostr'}
              </button>
              <div className="text-[var(--text-secondary)]">Owner: {OWNER_NPUB.slice(0, 12)}…{OWNER_NPUB.slice(-6)}</div>
              {nostrPubkey && <div className="text-[var(--text-secondary)]">You: {nostrPubkey.slice(0, 12)}…{nostrPubkey.slice(-6)}</div>}
            </div>
          </div>
          {authError && <div className="mt-4 text-xs text-[var(--danger)]">{authError}</div>}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="section-label text-[var(--amber-glow)]">Cost Monitor</div>
                <div className="text-sm text-[var(--text-secondary)] mt-1">AI spend + efficiency</div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full border ${costs?.status === 'warning' ? 'border-[rgba(247,37,133,0.6)] text-[var(--magenta-glow)]' : 'border-[rgba(0,245,212,0.6)] text-[var(--cyan-glow)]'}`}>
                {costs?.status ?? '—'}
              </span>
            </div>
            <div className="mt-6 grid gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-[rgba(255,195,0,0.2)] bg-[rgba(255,195,0,0.08)]">
                  <div className="metric-value gradient-text-amber">{formatMoney(costs?.today.cost)}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">Today cost</div>
                </div>
                <div className="p-4 rounded-lg border border-[rgba(255,195,0,0.2)] bg-[rgba(255,195,0,0.08)]">
                  <div className="metric-value gradient-text-amber">{formatNumber(costs?.today.calls)}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">Calls today</div>
                </div>
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Savings vs all gemini-3: <span className="text-[var(--text-bright)]">{formatMoney(costs?.savings.amount)}</span> ({costs?.savings.percentage ?? 0}%)</div>
              <div className="grid gap-2 text-xs">
                {costs?.today.breakdown && Object.entries(costs.today.breakdown).map(([model, data]) => (
                  <div key={model} className="flex justify-between border-b border-[rgba(255,195,0,0.15)] pb-1">
                    <span className="text-[var(--text-secondary)]">{model}</span>
                    <span className="text-[var(--amber-glow)]">{formatNumber(data.calls)} calls · {formatMoney(data.cost)}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-[var(--text-secondary)]">
                <div>Projection monthly: <span className="text-[var(--text-bright)]">{formatMoney(costs?.projection.monthly)}</span></div>
                <div>Days remaining: <span className="text-[var(--text-bright)]">{costs?.projection.daysRemaining ?? '—'}</span></div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)]">7-day token volume</div>
                <div className="mt-3 space-y-2 text-xs">
                  {costByDay.map(([day, tokens]) => (
                    <div key={day} className="flex items-center gap-2">
                      <span className="w-16 text-[var(--text-muted)]">{day}</span>
                      <div className="flex-1 h-2 rounded-full bg-[rgba(255,195,0,0.15)]">
                        <div className="h-2 rounded-full bg-[linear-gradient(90deg,rgba(255,195,0,0.6),rgba(255,195,0,0.2))]" style={{ width: `${Math.min(tokens / costScale, 1) * 100}%` }} />
                      </div>
                      <span className="text-[var(--text-secondary)]">{Math.round(tokens / 1000)}k</span>
                    </div>
                  ))}
                  {costByDay.length === 0 && <div className="text-[var(--text-muted)]">No history yet.</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="section-label text-[var(--cyan-glow)]">Heartbeat Timers</div>
            <div className="mt-6 grid gap-3 text-xs">
              {health?.heartbeat && Object.entries(health.heartbeat).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-[rgba(0,245,212,0.1)] pb-1">
                  <span className="text-[var(--text-secondary)]">{key}</span>
                  <span className="text-[var(--text-bright)]">{typeof value === 'string' ? value : typeof value === 'number' ? String(value) : value ? 'true' : 'false'}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {isUnlocked && (
          <>
            <section className="grid gap-6 lg:grid-cols-2">
              <div className="glass-card p-6">
                <div className="section-label text-[var(--magenta-glow)]">Active Missions</div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-2">Updated {since(innerLife?.activeMissions?.updatedAt)}</div>
                <div className="mt-4 text-xs text-[var(--text-primary)] whitespace-pre-wrap max-h-60 overflow-auto hide-scrollbar">
                  {innerLife?.activeMissions?.content || '—'}
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="section-label text-[var(--amber-glow)]">Inner Monologue</div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-2">Updated {since(innerLife?.innerMonologueFile?.updatedAt)}</div>
                <div className="mt-4 text-xs text-[var(--text-primary)] whitespace-pre-wrap max-h-60 overflow-auto hide-scrollbar">
                  {innerLife?.innerMonologueFile?.content || '—'}
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="glass-card p-6">
                <div className="section-label text-[var(--violet-glow)]">Inner Life</div>
                <div className="mt-5 space-y-4 text-xs text-[var(--text-primary)]">
                  {innerLife && (
                    <>
                      <div>
                        <div className="text-[10px] uppercase text-[var(--violet-dim)]">Reflections</div>
                        <div className="mt-2 whitespace-pre-wrap max-h-40 overflow-auto hide-scrollbar">{innerLife.reflections.content || '—'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-[var(--violet-dim)]">Learnings</div>
                        <div className="mt-2 whitespace-pre-wrap max-h-40 overflow-auto hide-scrollbar">{innerLife.learnings.content || '—'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-[var(--violet-dim)]">Ideas</div>
                        <div className="mt-2 whitespace-pre-wrap max-h-40 overflow-auto hide-scrollbar">{innerLife.ideas.content || '—'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-[var(--violet-dim)]">Evolution</div>
                        <div className="mt-2 whitespace-pre-wrap max-h-40 overflow-auto hide-scrollbar">{innerLife.evolution.content || '—'}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="section-label text-[var(--cyan-glow)]">Idea Garden + Projects</div>
                <div className="mt-5 space-y-4 text-xs text-[var(--text-primary)]">
                  <div>
                    <div className="text-[10px] uppercase text-[var(--cyan-dim)]">Idea Garden</div>
                    <div className="mt-2 whitespace-pre-wrap max-h-40 overflow-auto hide-scrollbar">{innerLife?.ideaGarden.content || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-[var(--cyan-dim)]">Projects</div>
                    <div className="mt-2 whitespace-pre-wrap max-h-40 overflow-auto hide-scrollbar">{innerLife?.projects.content || '—'}</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="glass-card p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="section-label text-[var(--cyan-glow)]">Syntropy Conversations</div>
                  <div className="text-sm text-[var(--text-secondary)] mt-1">Latest exchanges between Syntropy and Pixel</div>
                </div>
                <div className="text-xs text-[var(--text-secondary)]">{formatNumber(conversations?.count ?? 0)} messages</div>
              </div>
              <div className="mt-5 space-y-4 text-xs text-[var(--text-primary)] max-h-96 overflow-auto pr-2 hide-scrollbar">
                {sortedConversations.map((entry, idx) => (
                  <div key={`${entry.ts}-${idx}`} className="border border-[rgba(0,245,212,0.2)] bg-[rgba(0,245,212,0.05)] rounded-lg p-4">
                    <div className="flex items-center justify-between text-[10px] uppercase text-[var(--text-secondary)]">
                      <span>{entry.platform || 'http'} · {since(entry.ts)}</span>
                      <span>{new Date(entry.ts).toLocaleString()}</span>
                    </div>
                    <div className="mt-3">
                      <div className="text-[10px] text-[var(--cyan-dim)] uppercase">Syntropy</div>
                      <div className="mt-1 whitespace-pre-wrap">{entry.user || '—'}</div>
                    </div>
                    <div className="mt-3">
                      <div className="text-[10px] text-[var(--cyan-glow)] uppercase">Pixel</div>
                      <div className="mt-1 whitespace-pre-wrap text-[var(--text-bright)]">{entry.assistant || '—'}</div>
                    </div>
                  </div>
                ))}
                {(!conversations?.messages || conversations.messages.length === 0) && (
                  <div className="text-[var(--text-muted)]">No Syntropy conversations yet.</div>
                )}
              </div>
            </section>

            <section className="glass-card p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="section-label text-[var(--amber-glow)]">Pixel&apos;s Inner Monologue</div>
                  <div className="text-sm text-[var(--text-secondary)] mt-1">Internal research reactions and self-conversations</div>
                </div>
                <div className="text-xs text-[var(--text-secondary)]">{formatNumber(innerMonologue?.count ?? 0)} messages</div>
              </div>
              <div className="mt-5 space-y-4 text-xs text-[var(--text-primary)] max-h-96 overflow-auto pr-2 hide-scrollbar">
                {sortedMonologue.map((entry, idx) => (
                  <div key={`${entry.ts}-${idx}`} className="border border-[rgba(255,195,0,0.2)] bg-[rgba(255,195,0,0.05)] rounded-lg p-4">
                    <div className="flex items-center justify-between text-[10px] uppercase text-[var(--text-secondary)]">
                      <span>{entry.platform || 'internal'} · {since(entry.ts)}</span>
                      <span>{new Date(entry.ts).toLocaleString()}</span>
                    </div>
                    <div className="mt-3">
                      <div className="text-[10px] text-[var(--amber-dim)] uppercase">Stimulus</div>
                      <div className="mt-1 whitespace-pre-wrap">{entry.user || '—'}</div>
                    </div>
                    <div className="mt-3">
                      <div className="text-[10px] text-[var(--amber-glow)] uppercase">Pixel</div>
                      <div className="mt-1 whitespace-pre-wrap text-[var(--text-bright)]">{entry.assistant || '—'}</div>
                    </div>
                  </div>
                ))}
                {(!innerMonologue?.messages || innerMonologue.messages.length === 0) && (
                  <div className="text-[var(--text-muted)]">No inner monologue yet. Will populate when Pixel completes internal research tasks.</div>
                )}
              </div>
            </section>

            <section className="glass-card p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="section-label text-[var(--cyan-glow)]">Memories</div>
                  <div className="text-sm text-[var(--text-secondary)] mt-1">Active memory facts, episodes, procedures</div>
                </div>
                <input
                  value={memorySearch}
                  onChange={(event) => setMemorySearch(event.target.value)}
                  placeholder="search memories..."
                  className="bg-[rgba(15,22,41,0.7)] border border-[rgba(0,245,212,0.2)] rounded-full px-4 py-2 text-xs text-[var(--text-bright)]"
                />
              </div>
              <div className="mt-5 space-y-3 text-xs text-[var(--text-primary)] max-h-96 overflow-auto pr-2 hide-scrollbar">
                {filteredMemories.map((mem) => (
                  <div key={mem.id} className="border border-[rgba(0,245,212,0.15)] p-4 rounded-lg bg-[rgba(0,245,212,0.04)]">
                    <div className="flex flex-wrap gap-2 text-[10px] uppercase text-[var(--cyan-dim)]">
                      <span>{mem.type}</span>
                      <span className="text-[var(--text-muted)]">{mem.source}</span>
                      {mem.platform && <span className="text-[var(--text-muted)]">{mem.platform}</span>}
                    </div>
                    <div className="mt-2 text-[var(--text-bright)]">{mem.content}</div>
                    <div className="mt-2 text-[10px] text-[var(--text-secondary)]">Accessed {mem.accessCount} · Updated {since(mem.updatedAt)}</div>
                  </div>
                ))}
                {filteredMemories.length === 0 && <div className="text-[var(--text-muted)]">No memories found.</div>}
              </div>
            </section>
          </>
        )}

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="section-label text-[var(--cyan-glow)]">Activity Feed</div>
                <div className="text-sm text-[var(--text-secondary)] mt-1">Latest audit events</div>
              </div>
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="bg-[rgba(15,22,41,0.7)] border border-[rgba(0,245,212,0.2)] rounded-full text-xs text-[var(--text-bright)] px-3 py-1"
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
              <div className="mt-4 text-xs text-[var(--text-secondary)]">
                Private feed locked. Summary: {auditSummary?.count ?? 0} events · last {since(auditSummary?.lastTs)}
              </div>
            )}
            {isUnlocked && (
              <div className="mt-5 space-y-3 text-xs text-[var(--text-primary)] max-h-96 overflow-auto pr-2 hide-scrollbar">
                {filteredAudit.map((entry, idx) => (
                  <div key={`${entry.ts}-${idx}`} className="border-b border-[rgba(0,245,212,0.1)] pb-2">
                    <div className="text-[10px] text-[var(--text-secondary)]">{new Date(entry.ts).toLocaleTimeString()} · {entry.type}</div>
                    <div className="text-[var(--text-bright)]">{entry.summary}</div>
                  </div>
                ))}
                {filteredAudit.length === 0 && <div className="text-[var(--text-muted)]">No events yet.</div>}
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <div className="section-label text-[var(--amber-glow)]">Revenue + Wallet</div>
            <div className="mt-6 grid gap-4 text-sm">
              <div className="p-4 rounded-lg border border-[rgba(255,195,0,0.2)] bg-[rgba(255,195,0,0.08)]">
                <div className="metric-value gradient-text-amber">{formatNumber(publicRevenue?.totalSats)}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">Recorded sats</div>
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Wallet: {isUnlocked ? walletAddress : 'locked'}</div>
              <div className="space-y-2 text-xs">
                {publicRevenue?.bySource?.map((entry) => (
                  <div key={entry.source} className="flex justify-between border-b border-[rgba(255,195,0,0.15)] pb-1">
                    <span className="text-[var(--text-secondary)]">{entry.source}</span>
                    <span className="text-[var(--amber-glow)]">{formatNumber(entry.totalSats)} sats</span>
                  </div>
                ))}
              </div>
              {isUnlocked && (
                <>
                  <div className="text-xs text-[var(--text-secondary)]">Recent</div>
                  <div className="space-y-2 text-xs">
                    {recentRevenue.map((entry, idx) => (
                      <div key={`${entry.source}-${idx}`} className="border-b border-[rgba(255,195,0,0.15)] pb-1">
                        <div className="text-[var(--text-secondary)]">{entry.source} · {formatNumber(entry.amountSats)} sats</div>
                        <div className="text-[var(--text-muted)]">{entry.description ?? '—'} · {since(entry.createdAt)}</div>
                      </div>
                    ))}
                    {recentRevenue.length === 0 && <div className="text-[var(--text-muted)]">No revenue yet.</div>}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="glass-card p-6">
            <div className="section-label text-[var(--cyan-glow)]">Users</div>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Total</span><span className="text-[var(--text-bright)]">{formatNumber(stats?.users.totalUsers)}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Active (7d)</span><span className="text-[var(--text-bright)]">{formatNumber(stats?.users.activeUsers)}</span></div>
              <div className="mt-4 space-y-2 text-xs">
                {stats?.users.byPlatform?.map((entry) => (
                  <div key={entry.platform} className="flex justify-between border-b border-[rgba(0,245,212,0.1)] pb-1">
                    <span className="text-[var(--text-secondary)]">{entry.platform}</span>
                    <span className="text-[var(--cyan-glow)]">{formatNumber(entry.count)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="section-label text-[var(--violet-glow)]">Jobs + Reports</div>
            {!isUnlocked && (
              <div className="mt-4 text-xs text-[var(--text-secondary)]">
                Private job output locked. {jobsSummary?.count ?? 0} jobs · last complete {since(jobsSummary?.lastCompletedAt)}
              </div>
            )}
            {isUnlocked && (
              <div className="mt-5 space-y-3 text-xs text-[var(--text-primary)] max-h-72 overflow-auto pr-2 hide-scrollbar">
                {sortedJobs.map((job) => (
                  <div key={job.id} className="border-b border-[rgba(123,44,191,0.15)] pb-2">
                    <div className="text-[var(--violet-glow)] text-[10px] uppercase">{job.status}</div>
                    <div className="text-[var(--text-bright)]">{job.prompt}</div>
                    {job.output && <div className="text-[var(--text-secondary)] mt-1 whitespace-pre-wrap">{job.output}</div>}
                  </div>
                ))}
                {jobs?.jobs?.length === 0 && <div className="text-[var(--text-muted)]">No jobs yet.</div>}
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
            <section className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div className="section-label text-[var(--cyan-glow)]">Reminders</div>
                <div className="text-xs text-[var(--text-secondary)]">{formatNumber(reminders?.stats?.active)} active</div>
              </div>
              <div className="mt-5 grid gap-3 text-xs text-[var(--text-primary)]">
                {visible.map((reminder) => {
                  const cd = countdown(reminder.dueAt);
                  const isOverdue = cd === 'overdue';
                  return (
                    <div key={reminder.id} className={`border p-4 rounded-lg ${isOverdue ? 'border-[rgba(247,37,133,0.4)] bg-[rgba(247,37,133,0.08)]' : 'border-[rgba(0,245,212,0.2)] bg-[rgba(0,245,212,0.04)]'}`}>
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] text-[var(--text-secondary)] uppercase">{reminder.platform} · {reminder.status}</div>
                        <div className={`text-[10px] font-semibold ${isOverdue ? 'text-[var(--magenta-glow)]' : 'text-[var(--cyan-glow)]'}`}>{cd}</div>
                      </div>
                      <div className="text-[var(--text-bright)] mt-2">{reminder.rawMessage}</div>
                    </div>
                  );
                })}
                {visible.length === 0 && <div className="text-[var(--text-muted)]">No active reminders.</div>}
                {remaining > 0 && (
                  <div className="text-[var(--text-secondary)] text-center mt-1">+{remaining} more reminder{remaining > 1 ? 's' : ''}</div>
                )}
              </div>
            </section>
          );
        })()}
      </main>
    </div>
  );
}
