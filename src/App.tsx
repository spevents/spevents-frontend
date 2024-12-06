import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CameraPage, GalleryPage, QRCodePage, PhotoReviewPage, SlideshowPage } from './pages';
import { NgrokProvider } from './contexts/NgrokContext';
import { LandingPage, ProductPage, ExamplesPage } from './pages/landing';
import { DemoLayout } from './layouts/DemoLayout';
import { MainLayout } from './layouts/MainLayout';

export default function App() {
  return (
    <NgrokProvider>
      <BrowserRouter>
        <Routes>
          {/* Marketing/Landing Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/examples" element={<ExamplesPage />} />
          
          {/* Demo Section - Nested Routes */}
          <Route path="/demo" element={<DemoLayout />}>
            <Route index element={<MainLayout />} />
            <Route path="qr" element={<QRCodePage />} />
            <Route path="camera" element={<CameraPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="slideshow" element={<SlideshowPage />} />
            <Route path="review" element={<PhotoReviewPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </NgrokProvider>
  );
}