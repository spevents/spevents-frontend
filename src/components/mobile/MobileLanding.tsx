import { Phone } from "lucide-react";

export function MobileLanding() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
            <Phone className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Mobile Access Only</h1>
          <p className="text-white/60">
            Spevents is designed for mobile devices. Please scan your event's QR
            code with your phone to access the platform.
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-6">
          <p className="text-white/80">
            If you're an event host, please visit{" "}
            <a
              href="https://app.spevents.live"
              className="text-white underline hover:text-white/90"
            >
              app.spevents.live
            </a>{" "}
            to manage your event.
          </p>
        </div>
      </div>
    </div>
  );
}
