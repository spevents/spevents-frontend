// src/components/landing/Hero.tsx
import { motion } from "framer-motion";
import { getDomain } from "@/components/config/routes";

interface HeroProps {
  isDark: boolean;
}

// Helper function to get URLs
const getUrls = () => {
  const domain = getDomain();
  const currentOrigin = window.location.origin;

  if (domain === "local") {
    return {
      host: `${currentOrigin}/signin`,
      guest: `${currentOrigin}/${
        import.meta.env.VITE_EVENT_ID || "demo"
      }/guest`,
    };
  }

  return {
    host: "https://app.spevents.live",
    guest: "https://join.spevents.live",
  };
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8 },
};

export const Hero = ({ isDark }: HeroProps) => {
  const urls = getUrls();

  return (
    <motion.section className="pt-24 pb-16" {...fadeIn}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 ${
              isDark ? "text-sp_eggshell" : "text-sp_darkgreen"
            }`}
          >
            Event Photo Sharing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`text-xl sm:text-2xl mb-12 max-w-3xl mx-auto ${
              isDark ? "text-sp_lightgreen" : "text-sp_darkgreen/80"
            }`}
          >
            Live photo walls. Instant guest uploads. No apps required.
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
              className={`px-8 py-4 text-lg font-medium rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg ${
                isDark
                  ? "bg-sp_lightgreen hover:bg-sp_midgreen text-sp_darkgreen"
                  : "bg-sp_darkgreen hover:bg-sp_green text-sp_eggshell"
              }`}
            >
              Start Your Event
            </a>
            <a
              href={urls.guest}
              className={`px-8 py-4 text-lg font-medium rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg border ${
                isDark
                  ? "bg-sp_green hover:bg-sp_midgreen text-sp_eggshell border-sp_lightgreen"
                  : "bg-white/80 hover:bg-white text-sp_darkgreen border-sp_lightgreen/30"
              }`}
            >
              Join an Event
            </a>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};
