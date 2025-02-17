import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSession } from '../contexts/SessionContext';

export default function SlideshowQRCode() {
  const eventId = import.meta.env.VITE_EVENT_ID;
  const { isValidSession } = useSession();

  const getScanUrl = () => {
    return eventId ? `https://join.spevents.live/${eventId}/guest/camera` : '';
  };

  React.useEffect(() => {
    const validateSession = async () => {
      if (eventId) {
        const isValid = await isValidSession(eventId);
        if (!isValid) {
          console.error('Invalid session detected');
        }
      }
    };
    validateSession();
  }, [eventId, isValidSession]);

  if (!eventId) return null;

  return (
    <div className="flex px-4 py-3 justify-end">
      <div className="bg-white rounded-lg overflow-hidden flex flex-col">
        <div className="bg-[#101827] w-full flex items-center justify-center px-6 py-2">
          <span className="text-white text-sm">Scan to Join!</span>
        </div>
        <div className="w-full flex items-center justify-center p-3">
          <QRCodeSVG
            id="event-qr-code"
            value={getScanUrl()}
            size={128}
            level="H"
          />
        </div>
      </div>
    </div>
  );
}