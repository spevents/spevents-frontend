// src/pages/landing/LandingPage.tsx
export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-white mb-4">
        Welcome to Spevents
      </h1>
      <p className="text-white/60 text-center max-w-md mb-8">
        Please scan your host's provided QR code to join an event.
        Learn more at <a href="https://spevents.github.io" className="underline">spevents.github.io</a>
      </p>
    </div>
  );
};