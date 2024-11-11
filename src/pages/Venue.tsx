// src/pages/Venue.tsx
import React from 'react';
import Scene from '../components/Scene';

export default function VenuePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <main className="h-screen">
        <Scene />
      </main>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
        Hover over photos to see details • Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}