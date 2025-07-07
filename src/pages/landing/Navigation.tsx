// Navigation.tsx
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import darkIcon from "../../assets/dark-icon.svg";
import lightIcon from "../../assets/light-icon.svg";
import githubLogo from "../../assets/github-mark.svg";
import { motion } from "framer-motion";

export const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2 },
};

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsDarkMode(e.matches);
    };

    // Check initial theme
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );
    handleThemeChange(darkModeMediaQuery);

    // Add listeners
    window.addEventListener("scroll", handleScroll);
    darkModeMediaQuery.addListener(handleThemeChange);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      darkModeMediaQuery.removeListener(handleThemeChange);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-colors ${
        isScrolled ? "bg-white/90 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={isDarkMode ? darkIcon : lightIcon}
              alt="Spevents Logo"
              className="h-8 w-auto"
            />
            <span className="text-2xl font-medium text-DARKGREEN">
              spevents
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="https://github.com/spevents/spevents-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white text-DARKGREEN rounded-lg transition-colors"
            >
              <img src={githubLogo} alt="GitHub" className="w-5 h-5" />
              <span>Github</span>
            </a>
            <a
              href="https://app.spevents.live"
              className="px-4 py-2 bg-DARKGREEN text-white rounded-lg hover:bg-GREEN transition-colors"
            >
              Sign Up
            </a>
            <a
              href="https://join.spevents.live"
              className="px-4 py-2 bg-LIGHTGREEN text-DARKGREEN rounded-lg hover:bg-MIDGREEN hover:text-white transition-colors"
            >
              Join Event
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-DARKGREEN hover:text-MIDGREEN transition-colors"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Panel */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-x-0 top-[72px] bg-white/95 backdrop-blur-sm shadow-lg"
          >
            <div className="px-6 py-4 space-y-4">
              <a
                href="https://github.com/spevents/spevents-frontend"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-white/80 hover:bg-white text-DARKGREEN rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <img src={githubLogo} alt="GitHub" className="w-5 h-5" />
                <span>Github</span>
              </a>
              <a
                href="https://app.spevents.live"
                className="block p-3 bg-DARKGREEN text-white rounded-lg hover:bg-GREEN transition-colors text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </a>
              <a
                href="https://join.spevents.live"
                className="block p-3 bg-LIGHTGREEN text-DARKGREEN rounded-lg hover:bg-MIDGREEN hover:text-white transition-colors text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Join Event
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
