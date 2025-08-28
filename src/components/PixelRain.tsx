'use client';

import { useEffect, useState } from 'react';

export default function PixelRain() {
  const [pixels, setPixels] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    const generatePixels = () => {
      const newPixels = [];
      for (let i = 0; i < 15; i++) {
        newPixels.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 5
        });
      }
      setPixels(newPixels);
    };

    generatePixels();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
      {pixels.map((pixel) => (
        <div
          key={pixel.id}
          className="absolute w-1 h-1 bg-green-400 animate-pulse"
          style={{
            left: `${pixel.x}%`,
            top: `${pixel.y}%`,
            animationDelay: `${pixel.delay}s`,
            animationDuration: '3s'
          }}
        />
      ))}
    </div>
  );
}
