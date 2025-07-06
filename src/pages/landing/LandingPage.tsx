// src/pages/landing/LandingPage.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Users, Camera, LineChart, Menu, X } from "lucide-react";
import { ProductPage } from "./minis/ProductPage";
import githubLogo from "../../assets/github-mark.svg";
import lightIcon from "../../assets/light-icon.svg";
import { getDomain } from "../../components/config/routes";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8 },
};

// Helper function to get the appropriate URLs based on environment
const getUrls = () => {
  const domain = getDomain();
  const currentOrigin = window.location.origin;

  if (domain === "local") {
    // During development, use localhost paths
    return {
      host: `${currentOrigin}/signin`, // Changed from /host/gallery to /signin
      guest: `${currentOrigin}/${
        import.meta.env.VITE_EVENT_ID || "demo"
      }/guest`,
    };
  }

  // Production URLs
  return {
    host: "https://app.spevents.live",
    guest: "https://join.spevents.live",
  };
};

export const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const urls = getUrls();

  return (
    <div className="min-h-screen bg-EGGSHELL">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 bg-EGGSHELL/80 backdrop-blur-sm z-50 border-b border-LIGHTGREEN/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src={lightIcon} alt="Spevents Logo" className="w-8 h-8" />
              <div className="text-2xl font-bold text-DARKGREEN">spevents</div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href="https://github.com/fbablu/spevents"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white text-DARKGREEN rounded-lg transition-colors"
              >
                <img src={githubLogo} alt="GitHub" className="w-5 h-5" />
                <span>GitHub</span>
              </a>

              <a
                href={urls.host}
                className="px-4 py-2 bg-DARKGREEN text-white rounded-lg hover:bg-GREEN transition-colors"
              >
                Sign In
              </a>
              <a
                href={urls.guest}
                className="px-4 py-2 bg-LIGHTGREEN text-DARKGREEN rounded-lg hover:bg-MIDGREEN hover:text-white transition-colors"
              >
                Join Event
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-DARKGREEN" />
              ) : (
                <Menu className="w-6 h-6 text-DARKGREEN" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-LIGHTGREEN/20 bg-EGGSHELL/95 backdrop-blur-sm"
          >
            <div className="px-4 py-4 space-y-3">
              <a
                href="https://github.com/fbablu/spevents"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full px-4 py-2 bg-white/80 hover:bg-white text-DARKGREEN rounded-lg transition-colors"
              >
                <img src={githubLogo} alt="GitHub" className="w-5 h-5" />
                <span>GitHub</span>
              </a>

              <a
                href={urls.host}
                className="block w-full px-4 py-2 bg-DARKGREEN text-white text-center rounded-lg hover:bg-GREEN transition-colors"
              >
                Sign In
              </a>
              <a
                href={urls.guest}
                className="block w-full px-4 py-2 bg-LIGHTGREEN text-DARKGREEN text-center rounded-lg hover:bg-MIDGREEN hover:text-white transition-colors"
              >
                Join Event
              </a>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <motion.section className="pt-24 pb-16" {...fadeIn}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-DARKGREEN mb-6"
            >
              Event Photo
              <br />
              <span className="text-GREEN">Sharing</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl sm:text-2xl text-DARKGREEN/80 mb-12 max-w-3xl mx-auto"
            >
              Create beautiful photo walls where guests can instantly share
              memories. Real-time uploads, live displays, and automatic albums.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <a
                href={urls.host}
                className="px-8 py-4 bg-DARKGREEN text-white text-lg font-medium rounded-xl hover:bg-GREEN transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Start Your Event
              </a>
              <a
                href={urls.guest}
                className="px-8 py-4 bg-white/80 text-DARKGREEN text-lg font-medium rounded-xl hover:bg-white transform hover:scale-105 transition-all duration-200 shadow-lg border border-LIGHTGREEN/30"
              >
                Join an Event
              </a>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-20 bg-LIGHTGREEN/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-DARKGREEN mb-6">
              Everything You Need
            </h2>
            <p className="text-xl text-DARKGREEN/80 max-w-2xl mx-auto">
              Simple, powerful tools to capture and share every moment of your
              event
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Camera,
                title: "Instant Uploads",
                description:
                  "Guests scan QR codes to upload photos instantly to your event wall",
              },
              {
                icon: Users,
                title: "Live Photo Wall",
                description:
                  "Watch photos appear in real-time on any screen or display",
              },
              {
                icon: CalendarCheck,
                title: "Auto Albums",
                description:
                  "Receive complete digital albums after your event ends",
              },
              {
                icon: LineChart,
                title: "Easy Setup",
                description:
                  "Create events in minutes with our intuitive dashboard",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-LIGHTGREEN/30 hover:bg-white/80 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-DARKGREEN/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-DARKGREEN" />
                </div>
                <h3 className="text-xl font-semibold text-DARKGREEN mb-3">
                  {feature.title}
                </h3>
                <p className="text-DARKGREEN/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Product Showcase */}
      <ProductPage />

      {/* Footer */}
      <footer className="bg-DARKGREEN text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img src={lightIcon} alt="Spevents Logo" className="w-8 h-8" />
              <div className="text-2xl font-bold">spevents</div>
            </div>
            <p className="text-white/80 mb-6">
              Making event memories accessible to everyone
            </p>
            <div className="flex justify-center gap-6">
              <a
                href="https://github.com/fbablu/spevents"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
