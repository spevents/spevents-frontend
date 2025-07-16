// src/pages/landing/LandingPage.tsx
import { useTheme } from "@/hooks/useTheme";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { InteractiveDemo } from "./InteractiveDemo";
import { Features } from "./Features";
import { Footer } from "./Footer";

export const LandingPage = () => {
  const { isDark, setIsDark } = useTheme();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-sp_darkgreen" : "bg-sp_eggshell"
      }`}
    >
      <Header isDark={isDark} setIsDark={setIsDark} />
      <Hero isDark={isDark} />
      <InteractiveDemo isDark={isDark} />
      <Features isDark={isDark} />
      <Footer isDark={isDark} setIsDark={setIsDark} />
    </div>
  );
};
