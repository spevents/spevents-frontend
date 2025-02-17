// src/pages/landing/LandingPage.tsx
export const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Welcome to Spevents</h1>
          <p className="text-white/60">
            Please scan your host's provided QR code to join an event. Learn
            more at{" "}
            <a href="https://spevents.github.io" className="underline">
              spevents.github.io
            </a>
          </p>
        </div>

        <div className="space-y-4">
          <a
            href="https://app.spevents.live"
            className="block w-full px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-white/90 transition-colors"
          >
            Host? Sign in here
          </a>
          <a
            href="https://join.spevents.live"
            className="block w-full px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
          >
            Guest? Join here
          </a>
        </div>
      </div>
    </div>
  );
};
