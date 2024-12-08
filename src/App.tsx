// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CameraPage, GalleryPage, QRCodePage, PhotoReviewPage, SlideshowPage, VenuePage } from './pages';
import { NgrokProvider } from './contexts/NgrokContext';
import { SessionProvider } from './contexts/SessionContext';
import { LandingPage, ProductPage, ExamplesPage } from './pages/landing';
import { HostSetup } from './components/HostSetup';
import { JoinSession } from './components/JoinSession';

export default function App() {
  return (
    <NgrokProvider>
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            {/* Marketing/Landing Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/examples" element={<ExamplesPage />} />
            
            {/* Host Routes */}
            <Route path="/host" element={<HostSetup />} />
            <Route path="/venue" element={<VenuePage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/slideshow" element={<SlideshowPage />} />
            
            {/* Guest Routes */}
            <Route path="/join" element={<JoinSession />} />
            <Route path="/join/:code" element={<JoinSession />} />
            <Route path="/camera" element={<CameraPage />} />
            <Route path="/review" element={<PhotoReviewPage />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </NgrokProvider>
  );
}