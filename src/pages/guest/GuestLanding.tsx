// src/pages/guest/GuestLanding.tsx
export const GuestLanding = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">Join an Event</h2>
          <p className="text-white/60">
            Please scan your host's provided QR code to join an event.
            Learn more at <a href="https://spevents.github.io" className="underline">spevents.github.io</a>
          </p>
        </div>

        <a 
          href="https://app.spevents.live" 
          className="block w-full px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-white/90 transition-colors"
        >
          Host? Sign in here
        </a>
      </div>
    </div>
  );
};