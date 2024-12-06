import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface DemoLayoutProps {
  children: React.ReactNode;
}

export function DemoLayout({ children }: DemoLayoutProps) {
  const location = useLocation();

  return (
    <div className="relative">
      {/* Demo Badge */}
      <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-sage/90 text-brunswick-green font-semibold rounded-full backdrop-blur-sm">
        DEMO MODE
      </div>

      {/* Back to Landing */}
      <Link 
        to="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 text-brunswick-green 
          hover:bg-white transition-colors rounded-full backdrop-blur-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Original Content */}
      {children}
    </div>
  );
}