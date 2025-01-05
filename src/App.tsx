// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "./pages/landing";
import { Terms, Privacy } from "./components/Footer";

export default function App() {
  return (
      <BrowserRouter>
        <Routes>
          {/* Marketing/Landing Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </BrowserRouter>
  );
}
