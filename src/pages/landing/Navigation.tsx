import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, CalendarCheck } from "lucide-react";
import darkIcon from "../../assets/dark-icon.svg";
import lightIcon from "../../assets/light-icon.svg";
import {motion} from 'framer-motion'

export const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2 },
};

interface NavLink {
  path: string;
  text: string;
  isHash: boolean;
}

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsDarkMode(e.matches);
    };

    // Check initial theme
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
    handleThemeChange(darkModeMediaQuery);

    // Add listeners
    window.addEventListener("scroll", handleScroll);
    darkModeMediaQuery.addListener(handleThemeChange);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      darkModeMediaQuery.removeListener(handleThemeChange);
    };
  }, [location]);

  const handleSmoothScroll = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    } else if (targetId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    setIsMenuOpen(false);
  };

  const links: NavLink[] = [
    { path: "#home", text: "Home", isHash: true },
    { path: "#product", text: "Product", isHash: true },
    { path: "#examples", text: "Examples", isHash: true },
  ];

  const NavItem = ({ link }: { link: NavLink }) => {
    if (link.isHash) {
      const targetId = link.path.replace('#', '');
      return (
        <a
          href={link.path}
          className="text-brunswick-green hover:text-fern-green transition-colors font-medium"
          onClick={(e) => handleSmoothScroll(e, targetId)}
        >
          {link.text}
        </a>
      );
    }
    return (
      <Link
        to={link.path}
        className="text-brunswick-green hover:text-fern-green transition-colors font-medium"
        onClick={() => setIsMenuOpen(false)}
      >
        {link.text}
      </Link>
    );
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-colors ${
        isScrolled ? "bg-white/90 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <a
            href="#home"
            className="flex items-center space-x-2 text-brunswick-green hover:text-fern-green transition-colors"
            onClick={(e) => handleSmoothScroll(e, 'home')}
          >
            <img
              src={isDarkMode ? darkIcon : lightIcon}
              alt="Spevents Logo"
              className="h-8 w-auto"
            />
            <span className="text-2xl font-medium">spevents</span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <NavItem key={link.path} link={link} />
            ))}
            <Link
              to="https://calendly.com/spevents-party/30min"
              className="flex h-10 items-center justify-center gap-2 rounded-full bg-sage/20 px-6 
                transition-all duration-300 ease-in-out hover:bg-brunswick-green min-w-[140px]"
            >
              <span className="text-base font-bold text-brunswick-green transition-colors group-hover:text-white">
                Book Demo
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-brunswick-green hover:text-fern-green transition-colors"
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
          <div className="md:hidden fixed inset-x-0 top-[72px] bg-white/95 backdrop-blur-sm shadow-lg">
            <div className="px-6 py-4 space-y-4">
              {links.map((link) => (
                <div key={link.path} className="block py-2">
                  <NavItem link={link} />
                </div>
              ))}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block w-full"
              >
                <Link
                  to="https://calendly.com/spevents-party/30min"
                  onClick={() => setIsMenuOpen(false)}
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-sage/20 px-4 
                    transition-all duration-300 ease-in-out hover:bg-brunswick-green w-full"
                >
                  <span
                    className="rounded-full bg-brunswick-green p-2 text-white transition-colors 
                      group-hover:bg-white group-hover:text-brunswick-green"
                  >
                    <CalendarCheck className="h-4 w-4" />
                  </span>
                  <span
                    className="text-lg font-black text-brunswick-green transition-colors 
                      group-hover:text-white"
                  >
                    Book Demo
                  </span>
                </Link>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}