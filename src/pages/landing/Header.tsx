// src/components/landing/Header.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, Moon, Sun } from "lucide-react";
import githubLogo from "@/assets/github-mark.svg";
import lightIcon from "@/assets/light-icon.svg";
import { getDomain } from "@/components/config/routes";

interface HeaderProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

// Helper function to get the appropriate URLs based on environment
const getUrls = () => {
  const domain = getDomain();
  const currentOrigin = window.location.origin;

  if (domain === "local") {
    // During development, use localhost paths
    return {
      host: `${currentOrigin}/signin`,
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

export const Header = ({ isDark, setIsDark }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const urls = getUrls();

  return (
    <nav
      className={`fixed top-0 inset-x-0 backdrop-blur-sm z-50 border-b transition-colors duration-300 ${
        isDark
          ? "bg-sp_darkgreen/80 border-sp_green"
          : "bg-sp_eggshell/80 border-sp_lightgreen/20"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <img src={lightIcon} alt="Spevents Logo" className="w-8 h-8" />
            <div
              className={`text-2xl font-bold ${
                isDark ? "text-sp_eggshell" : "text-sp_darkgreen"
              }`}
            >
              spevents
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? "bg-sp_green hover:bg-sp_midgreen text-sp_eggshell"
                  : "bg-white/80 hover:bg-white text-sp_darkgreen"
              }`}
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <a
              href="https://github.com/fbablu/spevents"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDark
                  ? "bg-sp_green hover:bg-sp_midgreen text-sp_eggshell"
                  : "bg-white/80 hover:bg-white text-sp_darkgreen"
              }`}
            >
              <img src={githubLogo} alt="GitHub" className="w-5 h-5" />
              <span>GitHub</span>
            </a>

            <a
              href={urls.host}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDark
                  ? "bg-sp_lightgreen hover:bg-sp_midgreen text-sp_darkgreen"
                  : "bg-sp_darkgreen hover:bg-sp_green text-sp_eggshell"
              }`}
            >
              Sign In
            </a>
            <a
              href={urls.guest}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDark
                  ? "bg-sp_midgreen hover:bg-sp_green text-sp_eggshell"
                  : "bg-sp_lightgreen hover:bg-sp_midgreen hover:text-sp_eggshell text-sp_darkgreen"
              }`}
            >
              Join Event
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isDark
                ? "bg-sp_green hover:bg-sp_midgreen"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {isMenuOpen ? (
              <X
                className={`w-6 h-6 ${
                  isDark ? "text-sp_eggshell" : "text-sp_darkgreen"
                }`}
              />
            ) : (
              <Menu
                className={`w-6 h-6 ${
                  isDark ? "text-sp_eggshell" : "text-sp_darkgreen"
                }`}
              />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`md:hidden border-t backdrop-blur-sm transition-colors duration-300 ${
            isDark
              ? "border-sp_green bg-sp_darkgreen/95"
              : "border-sp_lightgreen/20 bg-sp_eggshell/95"
          }`}
        >
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg transition-colors ${
                isDark
                  ? "bg-sp_green hover:bg-sp_midgreen text-sp_eggshell"
                  : "bg-white/80 hover:bg-white text-sp_darkgreen"
              }`}
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
              <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>

            <a
              href="https://github.com/fbablu/spevents"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg transition-colors ${
                isDark
                  ? "bg-sp_green hover:bg-sp_midgreen text-sp_eggshell"
                  : "bg-white/80 hover:bg-white text-sp_darkgreen"
              }`}
            >
              <img src={githubLogo} alt="GitHub" className="w-5 h-5" />
              <span>GitHub</span>
            </a>

            <a
              href={urls.host}
              className={`block w-full px-4 py-2 text-center rounded-lg transition-colors ${
                isDark
                  ? "bg-sp_lightgreen hover:bg-sp_midgreen text-sp_darkgreen"
                  : "bg-sp_darkgreen hover:bg-sp_green text-sp_eggshell"
              }`}
            >
              Sign In
            </a>
            <a
              href={urls.guest}
              className={`block w-full px-4 py-2 text-center rounded-lg transition-colors ${
                isDark
                  ? "bg-sp_midgreen hover:bg-sp_green text-sp_eggshell"
                  : "bg-sp_lightgreen hover:bg-sp_midgreen hover:text-sp_eggshell text-sp_darkgreen"
              }`}
            >
              Join Event
            </a>
          </div>
        </motion.div>
      )}
    </nav>
  );
};
