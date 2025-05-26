// src/pages/guest/JoinEventPage.tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Camera, QrCode, Smartphone } from "lucide-react";

export function JoinEventPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-timberwolf p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="border border-sage/30 shadow-lg bg-white/95 backdrop-blur-sm rounded-lg">
          <div className="text-center space-y-4 p-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-brunswick-green rounded-2xl flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl text-brunswick-green font-bold">
                Join an Event
              </h1>
              <p className="text-hunter-green">
                Scan the QR code provided by your host to start sharing photos
              </p>
            </div>
          </div>
          <div className="space-y-6 px-8 pb-8">
            <div className="text-center space-y-4">
              <div className="w-32 h-32 bg-sage/20 border-2 border-dashed border-sage rounded-lg flex items-center justify-center mx-auto">
                <QrCode className="w-16 h-16 text-sage" />
              </div>
              <div className="space-y-2">
                <p className="text-brunswick-green font-medium">
                  Look for a QR code like this
                </p>
                <p className="text-sm text-hunter-green">
                  Your host will display it at the event venue or share it with
                  you directly
                </p>
              </div>
            </div>

            <div className="bg-sage/10 p-4 rounded-lg border border-sage/20">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-brunswick-green mt-0.5" />
                <div>
                  <h4 className="font-medium text-brunswick-green mb-1">
                    How it works:
                  </h4>
                  <ol className="text-sm text-hunter-green space-y-1 list-decimal list-inside">
                    <li>Scan the QR code with your phone camera</li>
                    <li>Take photos through your browser</li>
                    <li>See them appear instantly on the big screen</li>
                    <li>Download your photos as keepsakes</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Link
                to="/signin"
                className="block w-full bg-brunswick-green hover:bg-hunter-green text-white text-center py-4 px-6 rounded-lg transition-colors"
              >
                Host an Event Instead
              </Link>
              <Link
                to="/"
                className="block w-full border border-sage/30 text-hunter-green hover:bg-sage/10 text-center py-4 px-6 rounded-lg transition-colors"
              >
                Learn More About spevents
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export { JoinEventPage as GuestLanding };
