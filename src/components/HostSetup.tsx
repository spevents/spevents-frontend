// src/components/HostSetup.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check } from 'lucide-react';

export function HostSetup() {
  const navigate = useNavigate();
  const { generateSessionCode, sessionCode, setIsHost } = useSession();
  const [copied, setCopied] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const handleStartSession = () => {
    if (!sessionCode) {
      generateSessionCode();
    }
    setIsHost(true);
    setIsReady(true);
  };

  const copyCode = () => {
    if (sessionCode) {
      navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const startEvent = () => {
    navigate('/venue');
  };

  const joinUrl = `${window.location.origin}/join/${sessionCode}`;

  return (
    <div className="min-h-screen bg-timberwolf flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-brunswick-green">Host an Event</h2>
          <p className="mt-2 text-hunter-green">Create a new photo-sharing session</p>
        </div>

        {!isReady ? (
          <button
            onClick={handleStartSession}
            className="w-full py-3 bg-fern-green text-white rounded-full font-medium
              hover:bg-hunter-green transition-colors"
          >
            Start New Session
          </button>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Session Code</label>
                <div className="mt-1 relative">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl font-mono font-bold">{sessionCode}</span>
                    <button
                      onClick={copyCode}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">QR Code</label>
                <div className="mt-1 bg-white p-4 rounded-lg flex justify-center">
                  <QRCodeSVG value={joinUrl} size={200} level="H" />
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Share this code with your guests or have them scan the QR code
              </p>
            </div>

            <button
              onClick={startEvent}
              className="w-full py-3 bg-fern-green text-white rounded-full font-medium
                hover:bg-hunter-green transition-colors"
            >
              Start Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
}