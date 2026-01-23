import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CACHE_TTL = 5 * 60 * 1000;
let cachedData: any = null;
let cacheTimestamp: number = 0;

interface Metrics {
  posts_today: number;
  replies_received: number;
  zaps_received: number;
  unique_interactions: number;
  last_updated: string;
}

async function getMetricsFromDB(): Promise<Metrics> {
  const { Pool } = await import('pg');
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || 'postgresql://postgres:postgres@postgres:5432/pixel_agent',
  });

  try {
    const client = await pool.connect();
    try {
      const today = new Date().toISOString().split('T')[0];

      const result = await client.query(`
        SELECT
          COALESCE(
            (SELECT (content->'data'->'summary'->>'totalEvents')::int
             FROM memories
             WHERE content->>'source' = 'nostr'
               AND content->>'type' = 'daily_digest_post'
               AND DATE(created_at) = CURRENT_DATE
             ORDER BY created_at DESC
             LIMIT 1),
            0
          ) as posts_today,
          COALESCE(
            (SELECT COUNT(*)
             FROM memories
             WHERE content->>'source' = 'nostr'
               AND content->>'type' = 'social_interaction'
               AND (content->'data'->>'replied')::boolean = true
               AND DATE(created_at) = CURRENT_DATE),
            0
          ) as replies_received,
          COALESCE(
            (SELECT COUNT(DISTINCT content->'data'->>'author')
             FROM memories
             WHERE content->>'source' = 'nostr'
               AND content->>'type' = 'social_interaction'
               AND DATE(created_at) = CURRENT_DATE),
            0
          ) as unique_interactions,
          COALESCE(
            (SELECT SUM((content->'data'->'summary'->>'totalEvents')::int)
             FROM memories
             WHERE content->>'source' = 'nostr'
               AND content->>'type' = 'daily_digest_post'
               AND DATE(created_at) = CURRENT_DATE),
            0
          ) as total_events
      `);

      const row = result.rows[0];

      return {
        posts_today: Number(row.posts_today) || 0,
        replies_received: Number(row.replies_received) || 0,
        zaps_received: 0,
        unique_interactions: Number(row.unique_interactions) || 0,
        last_updated: new Date().toISOString(),
      };
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

export async function GET() {
  try {
    const now = Date.now();

    if (cachedData && (now - cacheTimestamp) < CACHE_TTL) {
      return NextResponse.json(cachedData);
    }

    const metrics = await getMetricsFromDB();
    cachedData = metrics;
    cacheTimestamp = now;

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Metrics endpoint error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch metrics',
        posts_today: 0,
        replies_received: 0,
        zaps_received: 0,
        unique_interactions: 0,
        last_updated: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
