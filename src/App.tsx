import React from 'react';
import { Camera } from 'lucide-react';
import Scene from './components/Scene';

function App() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <header className="absolute top-0 w-full z-10 bg-black/20 backdrop-blur-sm">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Camera className="w-8 h-8 text-white" />
              <span className="text-2xl font-bold text-white">Spevents</span>
            </div>
            <div className="text-white/80 text-sm">
              Making Every Event Unforgettable
            </div>
          </div>
        </nav>
      </header>

      {/* Main 3D Scene */}
      <main className="h-screen">
        <Scene />
      </main>

      {/* Instructions Overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
        Hover over photos to see details • Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}

export default App;