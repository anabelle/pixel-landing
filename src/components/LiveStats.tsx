'use client';

import { useEffect, useState } from 'react';

interface Stats {
  totalPixels: number;
  totalSats: number;
  recentActivityCount: number;
  recentSats: number;
  lastUpdated: number;
}

export default function LiveStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('https://ln.pixel.xx.kg/api/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Unable to load live data');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll every 30 seconds for updates
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="border border-green-800 p-6 bg-black/30 backdrop-blur-sm rounded-lg">
        <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center">
          <span className="mr-2 animate-pulse">⚡</span>
          Live Canvas Pulse
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
           {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-green-400 animate-pulse">...</div>
              <div className="text-sm text-gray-400">Loading</div>
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
          <span className="mr-2">⚠️</span>
          Live Canvas Pulse
        </h3>
        <p className="text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="border border-green-800 p-6 bg-black/30 backdrop-blur-sm rounded-lg hover:border-green-400 transition-all duration-300">
      <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center">
        <span className="mr-2 animate-pulse">⚡</span>
        Live Canvas Pulse
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {stats.totalPixels.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Pixels Painted</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {stats.totalSats.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Total Sats</div>
        </div>



        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {stats.recentSats.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Recent Sats (24h)</div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
}