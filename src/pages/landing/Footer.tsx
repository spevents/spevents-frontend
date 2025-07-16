// src/components/landing/Footer.tsx
import lightIcon from "@/assets/light-icon.svg";
import darkIcon from "@/assets/dark-icon.svg";

interface FooterProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

export const Footer = ({ isDark }: FooterProps) => {
  return (
    <footer
      className={`py-12 transition-colors duration-300 ${
        isDark ? "bg-sp_darkgreen" : "bg-sp_eggshell"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img
              src={`${isDark ? darkIcon : lightIcon}`}
              alt="Spevents Logo"
              className="w-8 h-8"
            />
            <div
              className={`text-2xl font-bold ${
                isDark ? "text-sp_eggshell" : "text-sp_darkgreen"
              }`}
            >
              spevents
            </div>
          </div>
          <p
            className={`mb-6 ${
              isDark ? "text-sp_lightgreen" : "text-sp_green"
            }`}
          >
            Making event memories accessible to everyone
          </p>
          <div className="flex justify-center gap-6">
            <a
              href="https://github.com/spevents/spevents-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors ${
                isDark
                  ? "text-sp_lightgreen hover:text-sp_eggshell"
                  : "text-sp_green hover:text-sp_darkgreen"
              }`}
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
