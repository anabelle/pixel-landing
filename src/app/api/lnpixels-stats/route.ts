import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CACHE_TTL = 30 * 1000;
let cachedData: any = null;
let cacheTimestamp: number = 0;

interface PixelEvent {
  id: number;
  x: number;
  y: number;
  color: string;
  letter: string | null;
  sats: number;
  created_at: number;
  payment_hash: string;
  event_id: string | null;
  type: string;
}

interface Stats {
  totalPixels: number;
  totalSats: number;
  recentActivityCount: number;
  recentSats: number;
  uniqueBuyers: number;
  lastUpdated: number;
}

interface LNPixelsData {
  todayPixels: number;
  todaySats: number;
  totalPixels: number;
  totalSats: number;
  activity: Array<{
    timestamp: number;
    count: number;
    sats: number;
  }>;
  lastUpdated: string;
}

function getTodayStart(): number {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return todayStart.getTime();
}

function aggregateActivityByHour(events: PixelEvent[]): Array<{ timestamp: number; count: number; sats: number }> {
  const hourlyMap = new Map<number, { count: number; sats: number }>();

  events.forEach(event => {
    const eventTime = event.created_at;
    const hourKey = new Date(eventTime).getTime();
    
    if (!hourlyMap.has(hourKey)) {
      hourlyMap.set(hourKey, { count: 0, sats: 0 });
    }
    
    const entry = hourlyMap.get(hourKey)!;
    entry.count += 1;
    entry.sats += event.sats;
  });

  return Array.from(hourlyMap.entries())
    .map(([timestamp, data]) => ({
      timestamp,
      count: data.count,
      sats: data.sats,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

async function getLNPixelsData(): Promise<LNPixelsData> {
  const todayStart = getTodayStart();

  const [statsRes, activityRes] = await Promise.all([
    fetch('https://ln.pixel.xx.kg/api/stats', {
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    }),
    fetch('https://ln.pixel.xx.kg/api/activity', {
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    }),
  ]);

  if (!statsRes.ok) {
    throw new Error(`Stats API failed: ${statsRes.status}`);
  }
  if (!activityRes.ok) {
    throw new Error(`Activity API failed: ${activityRes.status}`);
  }

  const stats: Stats = await statsRes.json();
  const { events }: { events: PixelEvent[] } = await activityRes.json();

  const todayEvents = events.filter(e => e.created_at >= todayStart);
  const todayPixels = todayEvents.length;
  const todaySats = todayEvents.reduce((sum, e) => sum + e.sats, 0);

  const activity = aggregateActivityByHour(events.slice(-100));

  return {
    todayPixels,
    todaySats,
    totalPixels: stats.totalPixels,
    totalSats: stats.totalSats,
    activity,
    lastUpdated: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const now = Date.now();

    if (cachedData && (now - cacheTimestamp) < CACHE_TTL) {
      return NextResponse.json(cachedData);
    }

    const data = await getLNPixelsData();
    cachedData = data;
    cacheTimestamp = now;

    return NextResponse.json(data);
  } catch (error) {
    console.error('LNPixels stats endpoint error:', error);
    return NextResponse.json(
      {
        todayPixels: 0,
        todaySats: 0,
        totalPixels: 0,
        totalSats: 0,
        activity: [],
        lastUpdated: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
