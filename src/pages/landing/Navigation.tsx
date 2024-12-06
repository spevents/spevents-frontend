import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { to: '/', text: 'Home' },
    { to: '/product', text: 'Product' },
    { to: '/examples', text: 'Examples' },
    { to: '/demo', text: 'Try Demo' }
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-colors ${
      isScrolled ? 'bg-white/90 backdrop-blur-sm shadow-sm' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Camera className="w-8 h-8 text-hunter-green" />
            <span className="text-2xl font-bold text-hunter-green">Spevents</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-brunswick-green hover:text-fern-green transition-colors"
              >
                {link.text}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}