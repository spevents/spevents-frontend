import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Camera, Image as ImageIcon, QrCode } from 'lucide-react';

// Import pages
import VenuePage from './pages/Venue';
import QRCodePage from './pages/QRCode';
import CameraPage from './pages/Camera';
import GalleryPage from './pages/Gallery';

// Import components for main layout
import Scene from './components/Scene';

function MainLayout() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <header className="absolute top-0 w-full z-10 bg-black/20 backdrop-blur-sm">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Camera className="w-8 h-8 text-white" />
              <span className="text-2xl font-bold text-white">Spevents</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/qr" className="text-white hover:text-gray-200">
                <QrCode className="w-6 h-6" />
              </Link>
              <Link to="/camera" className="text-white hover:text-gray-200">
                <Camera className="w-6 h-6" />
              </Link>
              <Link to="/gallery" className="text-white hover:text-gray-200">
                <ImageIcon className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="h-screen">
        <Scene />
      </main>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
        Hover over photos to see details • Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Main venue view */}
        <Route path="/" element={<MainLayout />} />
        
        {/* QR Code scanning page */}
        <Route path="/qr" element={<QRCodePage />} />
        
        {/* Camera interface (accessed via QR code) */}
        <Route path="/camera" element={<CameraPage />} />
        
        {/* Photo gallery */}
        <Route path="/gallery" element={<GalleryPage />} />

        {/* Catch all route - Add this new route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;