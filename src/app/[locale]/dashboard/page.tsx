'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { t, Locale } from '@/lib/translations';

interface ActivityPoint {
  timestamp: number;
  count: number;
  sats: number;
}

interface LNPixelsData {
  todayPixels: number;
  todaySats: number;
  totalPixels: number;
  totalSats: number;
  activity: ActivityPoint[];
  lastUpdated: string;
}

interface DashboardPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const [locale, setLocale] = useState<Locale>('en');
  const [data, setData] = useState<LNPixelsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocale = async () => {
      const { locale: localeParam } = await params;
      const safeLocale = (localeParam && ['en', 'es', 'fr', 'ja'].includes(localeParam)) ? (localeParam as Locale) : 'en';
      setLocale(safeLocale);
    };
    fetchLocale();
  }, [params]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/lnpixels-stats?t=' + Date.now());
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const json = await response.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError('Unable to load dashboard data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderActivityTimeline = () => {
    if (!data || data.activity.length === 0) {
      return <div className="text-gray-500 text-sm">No recent activity</div>;
    }

    const maxSats = Math.max(...data.activity.map(a => a.sats));
    const maxCount = Math.max(...data.activity.map(a => a.count));

    return (
      <div className="space-y-2">
        {data.activity.slice(-10).map((point, idx) => {
          const satsHeight = maxSats > 0 ? (point.sats / maxSats) * 100 : 0;
          const countHeight = maxCount > 0 ? (point.count / maxCount) * 100 : 0;

          return (
            <div key={idx} className="flex items-center gap-3 text-xs">
              <div className="w-20 text-gray-500 shrink-0">
                {new Date(point.timestamp).toLocaleTimeString(locale, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              <div className="flex-1 flex gap-2">
                <div
                  className="bg-yellow-500/30 border border-yellow-500/50 rounded-sm h-6 flex items-center justify-end px-1 text-yellow-300"
                  style={{ width: `${Math.max(satsHeight, 2)}%` }}
                  title={`${point.sats} sats`}
                >
                  <span className="text-[10px]">{point.sats}</span>
                </div>
                <div
                  className="bg-green-500/30 border border-green-500/50 rounded-sm h-6 flex items-center justify-end px-1 text-green-300"
                  style={{ width: `${Math.max(countHeight, 2)}%` }}
                  title={`${point.count} pixels`}
                >
                  <span className="text-[10px]">{point.count}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono selection:bg-green-900 selection:text-white pb-20">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)] z-0" />
      <div className="fixed inset-0 pointer-events-none opacity-5 bg-[url('/grid.svg')] z-0" style={{ backgroundSize: '30px 30px' }} />

      <header className="border-b border-green-900/30 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-green-400 transition-colors uppercase text-sm font-bold tracking-widest">
              ← Return
            </Link>
            <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-500">
              REVENUE_DASHBOARD // LNPixels
            </h1>
          </div>
          <div className="text-xs text-yellow-500/50 animate-pulse">
            SATS_ACCUMULATOR_ONLINE
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        {loading ? (
          <div className="text-center py-20 animate-pulse text-green-900 font-bold uppercase tracking-widest">
            Initializing Revenue Stream...
          </div>
        ) : error ? (
          <div className="border border-red-800 p-6 bg-black/40 backdrop-blur rounded-lg text-center">
            <div className="text-red-400 text-lg mb-2">⚠️</div>
            <p className="text-red-300">{error}</p>
          </div>
        ) : !data ? null : (
          <div className="space-y-8">
            <div className="border border-yellow-600 p-6 bg-black/40 backdrop-blur rounded-lg shadow-2xl">
              <h2 className="text-lg font-bold text-yellow-400 mb-6 flex items-center gap-2">
                <span className="animate-pulse">⚡</span>
                TODAY_PERFORMANCE
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-yellow-950/20 border border-yellow-900/30 p-4 rounded">
                  <div className="text-3xl font-bold text-white mb-1">{data.todayPixels}</div>
                  <div className="text-sm text-gray-400">Pixels Placed Today</div>
                </div>
                <div className="bg-yellow-950/20 border border-yellow-900/30 p-4 rounded">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">{data.todaySats.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Sats Earned Today</div>
                </div>
              </div>
            </div>

            <div className="border border-green-800 p-6 bg-black/40 backdrop-blur rounded-lg shadow-2xl">
              <h2 className="text-lg font-bold text-green-400 mb-6 flex items-center gap-2">
                <span className="animate-pulse">💰</span>
                TOTAL_ACCUMULATION
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-950/20 border border-green-900/30 p-4 rounded">
                  <div className="text-3xl font-bold text-white mb-1">{data.totalPixels.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Total Pixels</div>
                </div>
                <div className="bg-green-950/20 border border-green-900/30 p-4 rounded">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">{data.totalSats.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Total Sats Treasury</div>
                </div>
              </div>
            </div>

            <div className="border border-purple-800 p-6 bg-black/40 backdrop-blur rounded-lg shadow-2xl">
              <h2 className="text-lg font-bold text-purple-400 mb-6 flex items-center gap-2">
                <span>📈</span>
                ACTIVITY_TIMELINE
              </h2>
              <div className="flex gap-4 mb-4 text-xs uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500/30 border border-yellow-500/50 rounded-sm"></div>
                  <span className="text-yellow-300">Sats</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500/30 border border-green-500/50 rounded-sm"></div>
                  <span className="text-green-300">Pixels</span>
                </div>
              </div>
              {renderActivityTimeline()}
            </div>

            <div className="text-center text-xs text-gray-600 pt-4 border-t border-gray-900">
              Last Updated: {new Date(data.lastUpdated).toLocaleString()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
