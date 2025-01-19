// src/components/SessionValidator.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSession } from '../../contexts/SessionContext';

interface SessionValidatorProps {
  children: React.ReactNode;
}

export function SessionValidator({ children }: SessionValidatorProps) {
  const { eventId } = useParams();
  const { isValidSession } = useSession();
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      alert(`Checking session for: ${eventId || 'no eventId'}`);
      
      if (!eventId) {
        alert('No eventId found');
        setIsValid(false);
        setIsChecking(false);
        return;
      }

      try {
        const valid = await isValidSession(eventId);
        alert(`Session validity: ${valid}`);
        setIsValid(valid);
      } catch (error) {
        alert(`Error checking session: ${error}`);
        setIsValid(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkSession();
  }, [eventId, isValidSession]);

  if (isChecking) {
    alert('Still checking session...');
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Invalid Session</h1>
          <p className="text-white/60">
            This session code is not valid or has expired.
            Please scan a valid QR code to join an event.
          </p>
          <button
            onClick={() => alert(`Current session state: ${JSON.stringify({ eventId, isValid, isChecking })}`)}
            className="px-6 py-3 bg-white/10 text-white rounded-full hover:bg-white/20"
          >
            Debug Info
          </button>
          <a
            href="/"
            className="block px-6 py-3 bg-white/10 text-white rounded-full hover:bg-white/20"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}