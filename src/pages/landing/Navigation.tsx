// src/pages/landing/Navigation.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import darkIcon from '../../assets/dark-icon.svg';
import lightIcon from '../../assets/light-icon.svg';

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
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    handleThemeChange(darkModeMediaQuery);

    // Add listeners
    window.addEventListener('scroll', handleScroll);
    darkModeMediaQuery.addListener(handleThemeChange);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      darkModeMediaQuery.removeListener(handleThemeChange);
    };
  }, []);

  const links = [
    { to: '/', text: 'Home'},
    { to: '/product', text: 'Product' },
    { to: '/examples', text: 'Examples' }
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-colors ${
      isScrolled ? 'bg-white/90 backdrop-blur-sm shadow-sm' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-brunswick-green hover:text-fern-green transition-colors"
          >
            <img 
              src={isDarkMode ? darkIcon : lightIcon} 
              alt="Spevents Logo" 
              className="h-8 w-auto" 
            />
            <span className="text-2xl font-medium">spevents</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-brunswick-green hover:text-fern-green transition-colors font-medium"
              >
                {link.text}
              </Link>
            ))}
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
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-brunswick-green hover:text-fern-green transition-colors font-medium py-2"
                >
                  {link.text}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}