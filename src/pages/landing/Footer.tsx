// src/components/landing/Footer.tsx
import lightIcon from "@/assets/light-icon.svg";

export const Footer = () => {
  return (
    <footer className="py-12 bg-sp_darkgreen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={lightIcon} alt="Spevents Logo" className="w-8 h-8" />
            <div className="text-2xl font-bold text-sp_eggshell">spevents</div>
          </div>
          <p className="text-sp_lightgreen mb-6">
            Making event memories accessible to everyone
          </p>
          <div className="flex justify-center gap-6">
            <a
              href="https://github.com/fbablu/spevents"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sp_lightgreen hover:text-sp_eggshell transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
