import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { CameraPage, GalleryPage, QRCodePage, PhotoReviewPage } from './pages';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path="/qr" element={<QRCodePage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/review" element={<PhotoReviewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}