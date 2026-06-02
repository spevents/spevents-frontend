// src/pages/guest/GuestLanding.tsx
//
// Kahoot-style "join a room" screen: guests type the 6-character room code
// their host shared and are dropped straight into the event. Works on any
// device and from any spevents domain.

import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { guestService } from "@/services/api";
import { ROUTES } from "@/components/config/routes";

const CODE_LENGTH = 6;

// Room codes are 6 uppercase alphanumeric characters (see backend
// lib/session-code.ts). Normalise input so paste/typing/casing all work.
const normalizeCode = (raw: string) =>
  raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, CODE_LENGTH);

export const GuestLanding = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();
    const room = normalizeCode(code);

    if (room.length < CODE_LENGTH) {
      setError(`Room codes are ${CODE_LENGTH} characters — check with your host.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validates against the backend (active events only); throws on 404.
      await guestService.getEventBySessionCode(room);

      const hostname = window.location.hostname;
      const isLocal = hostname === "localhost" || hostname.includes("ngrok");

      if (hostname === ROUTES.guest) {
        // Already on the guest domain — client-side route in.
        navigate(`/${room}/guest`);
      } else if (isLocal) {
        navigate(`/guest/${room}/guest`);
      } else {
        // On the marketing/host domain — hand off to the guest domain.
        window.location.href = `https://${ROUTES.guest}/${room}/guest`;
      }
    } catch {
      setError("Room not found or not live yet. Double-check the code with your host.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Join the event</h1>
          <p className="text-white/60">
            Enter the room code your host is showing on screen.
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setError(null);
              setCode(normalizeCode(e.target.value));
            }}
            placeholder="ABC123"
            autoFocus
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            inputMode="text"
            maxLength={CODE_LENGTH}
            aria-label="Room code"
            className="w-full rounded-xl bg-white/5 border border-white/15 px-6 py-5 text-center text-4xl font-bold tracking-[0.4em] text-white uppercase placeholder-white/25 outline-none focus:border-white/60 focus:ring-2 focus:ring-white/30"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || normalizeCode(code).length < CODE_LENGTH}
            className="block w-full rounded-lg bg-white px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Joining…" : "Join"}
          </button>
        </form>

        <p className="text-sm text-white/40">
          Don't have a code? Scan your host's QR code, or learn more at{" "}
          <a href="https://spevents.live" className="underline">
            spevents.live
          </a>
          .
        </p>

        <a
          href="https://app.spevents.live"
          className="inline-block text-sm text-white/50 underline hover:text-white/80"
        >
          Host? Sign in here
        </a>
      </div>
    </div>
  );
};
