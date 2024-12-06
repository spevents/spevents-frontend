import { Link, Outlet } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function DemoLayout() {
  return (
    <div className="relative">
      {/* Demo Badge and Back Button */}
      <div className="fixed bottom-8 w-full z-50 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link 
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-[#8B0000] rounded-full backdrop-blur-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="px-4 py-2 bg-[#FFD700] text-[#8B0000] font-semibold rounded-full">
            DEMO MODE
          </div>
        </div>
      </div>

      {/* Render nested routes */}
      <Outlet />
    </div>
  );
}