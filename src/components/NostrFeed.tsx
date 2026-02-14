'use client';

import { useEffect, useState } from 'react';
import { t, Locale } from '@/lib/translations';

type NostrPost = {
  ts: number;
  content: string;
  type: string;
};

interface NostrFeedProps {
  locale: Locale;
  limit?: number;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function typeLabel(type: string): { label: string; color: string } {
  switch (type) {
    case 'heartbeat':
      return { label: 'pulse', color: 'text-green-400' };
    case 'art_report':
      return { label: 'art', color: 'text-yellow-400' };
    case 'spotlight':
      return { label: 'spotlight', color: 'text-cyan-400' };
    case 'quote_repost':
      return { label: 'repost', color: 'text-purple-400' };
    default:
      return { label: type, color: 'text-gray-400' };
  }
}

export default function NostrFeed({ locale, limit = 10 }: NostrFeedProps) {
  const [posts, setPosts] = useState<NostrPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/v2/api/posts?limit=${limit}`);
      if (!response.ok) throw new Error('posts fetch failed');
      const data = await response.json();
      const fetched = Array.isArray(data?.posts) ? data.posts : [];
      setPosts(fetched.sort((a, b) => b.ts - a.ts));
      setError(null);
    } catch {
      setError(t(locale, 'nostrFeed.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="border border-purple-800 p-6 bg-black/30 backdrop-blur-sm rounded-lg">
        <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center">
          <span className="mr-2 animate-pulse">~</span>
          {t(locale, 'nostrFeed.title')}
        </h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-800 p-3 rounded animate-pulse">
              <div className="h-3 bg-gray-800 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-800 p-6 bg-black/30 backdrop-blur-sm rounded-lg">
        <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center">
          <span className="mr-2">~</span>
          {t(locale, 'nostrFeed.title')}
        </h3>
        <p className="text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="border border-purple-800 p-6 bg-black/30 backdrop-blur-sm rounded-lg hover:border-purple-400 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-purple-400 flex items-center">
          <span className="mr-2">~</span>
          {t(locale, 'nostrFeed.title')}
        </h3>
        <a
          href="https://primal.net/p/nprofile1qqs9cg5jpwtkzjtwjv048guzct009n5ayn4lp9skq0k608cmyjul90ct5v9cc"
          target="_blank"
          className="text-xs text-gray-400 hover:text-purple-300 transition-colors"
        >
          {t(locale, 'nostrFeed.viewOnNostr')}
        </a>
      </div>

      <div className="space-y-3 max-h-96 overflow-auto pr-1">
        {posts.map((post, idx) => {
          const { label, color } = typeLabel(post.type);
          return (
            <div
              key={`${post.ts}-${idx}`}
              className="border border-gray-800 p-3 rounded hover:border-purple-800 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-mono ${color}`}>[{label}]</span>
                <span className="text-xs text-gray-500 font-mono">{timeAgo(post.ts)}</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        {t(locale, 'nostrFeed.subtitle')}
      </div>
    </div>
  );
}
