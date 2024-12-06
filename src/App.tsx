import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CameraPage, GalleryPage, QRCodePage, PhotoReviewPage, VenuePage } from './pages';
import { NgrokProvider } from './contexts/NgrokContext';
import { LandingPage, ProductPage, ExamplesPage } from './pages/landing';
import { DemoLayout } from './layouts/DemoLayout';

export default function App() {
  return (
    <NgrokProvider>
      <BrowserRouter>
        <Routes>
          {/* Marketing/Landing Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/examples" element={<ExamplesPage />} />
          
          {/* Demo Section - All wrapped in DemoLayout */}
          <Route path="/demo" element={<DemoLayout><VenuePage /></DemoLayout>} />
          <Route path="/demo/venue" element={<DemoLayout><VenuePage /></DemoLayout>} />
          <Route path="/demo/qr" element={<DemoLayout><QRCodePage /></DemoLayout>} />
          <Route path="/demo/camera" element={<DemoLayout><CameraPage /></DemoLayout>} />
          <Route path="/demo/gallery" element={<DemoLayout><GalleryPage /></DemoLayout>} />
          <Route path="/demo/review" element={<DemoLayout><PhotoReviewPage /></DemoLayout>} />
          
          {/* Redirect all unknown paths to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </NgrokProvider>
  );
}