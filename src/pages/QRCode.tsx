import React from 'react';
import CameraInterface from '../components/CameraInterface';

export default function QRCodePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <CameraInterface initialMode="qr" />
    </div>
  );
}