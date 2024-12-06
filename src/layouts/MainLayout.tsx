import { Link, useNavigate } from "react-router-dom";
import { Camera, Image as ImageIcon, QrCode } from "lucide-react";
import { Scene } from "../components";

export function MainLayout() {
  const navigate = useNavigate();

  const handleCameraClick = () => {
    // Navigate to QR code page with state indicating we came from venue
    navigate("/demo/qr", { state: { from: "venue" } });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-hunter-green to-brunswick-green">
      {/* Demo Badge */}
      <div className="absolute top-4 right-4 z-50 px-4 py-2 bg-sage/90 text-brunswick-green font-semibold rounded-full backdrop-blur-sm">
        DEMO MODE
      </div>

      {/* Back to Landing */}
      <Link 
        to="/"
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 text-brunswick-green 
          hover:bg-white transition-colors rounded-full backdrop-blur-sm"
      >
        <span>← Back to Home</span>
      </Link>

      <header className="absolute top-16 w-full z-10 bg-black/20 backdrop-blur-sm">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/demo" className="flex items-center space-x-2">
              <Camera className="w-8 h-8 text-timberwolf" />
              <span className="text-2xl font-bold text-timberwolf">
                Spevents Demo
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              {[
                { key: "qr", Icon: QrCode, action: handleCameraClick },
                { key: "gallery", to: "/demo/gallery", Icon: ImageIcon },
              ].map(({ key, Icon, to, action }) =>
                action ? (
                  <button
                    key={key}
                    onClick={action}
                    className="text-timberwolf hover:text-sage transition-colors"
                  >
                    <Icon className="w-6 h-6" />
                  </button>
                ) : (
                  <Link
                    key={key}
                    to={to!}
                    className="text-timberwolf hover:text-sage transition-colors"
                  >
                    <Icon className="w-6 h-6" />
                  </Link>
                )
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="h-screen">
        <Scene />
      </main>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sage text-sm bg-brunswick-green/30 px-4 py-2 rounded-full backdrop-blur-sm">
        Hover over photos to see details • Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}