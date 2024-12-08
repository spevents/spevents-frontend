// src/components/Footer.tsx
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full py-6 px-6 bg-timberwolf/50">
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center text-sm text-brunswick-green/80">
        <div>
          Copyright © {new Date().getFullYear()} Spevents, LLC. All rights reserved.
        </div>
        <div className="flex items-center space-x-4 mt-2 md:mt-0">
          <Link 
            to="/terms" 
            className="hover:text-fern-green transition-colors"
          >
            Terms of Use
          </Link>
          <span>&middot;</span>
          <Link 
            to="/privacy" 
            className="hover:text-fern-green transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}