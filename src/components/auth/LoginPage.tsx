// src/components/auth/LoginPage.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../config/firebase";
import { useNavigate, Link } from "react-router-dom";
import { Camera, Github, Linkedin, Instagram } from "lucide-react";

const ALLOWED_EMAIL = import.meta.env.VITE_ALLOWED_EMAIL;

export const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSignIn = async (provider: string) => {
    setIsLoading(provider);

    if (provider === "google") {
      try {
        const googleProvider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, googleProvider);

        if (result.user.email === ALLOWED_EMAIL) {
          localStorage.setItem("spevents-auth", result.user.email);

          // Check if first time user
          const hasCompletedOnboarding = localStorage.getItem(
            "spevents-onboarding-complete",
          );
          if (!hasCompletedOnboarding) {
            navigate("/onboarding");
          } else {
            navigate("/dashboard");
          }
        } else {
          await auth.signOut();
          alert("Unauthorized access");
        }
      } catch (error: any) {
        console.error("Firebase Auth Error:", error);
        if (error.code !== "auth/popup-closed-by-user") {
          alert(`Authentication failed: ${error.message}`);
        }
      }
    } else {
      // Simulate auth process for other providers
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For localhost development, simulate first-time vs returning user
      const hasCompletedOnboarding = localStorage.getItem(
        "spevents-onboarding-complete",
      );
      if (!hasCompletedOnboarding) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    }

    setIsLoading(null);
  };

  const providers = [
    {
      name: "Google",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      ),
      bgColor: "bg-white",
      hoverColor: "hover:bg-gray-50",
      textColor: "text-gray-700",
      borderColor: "border-gray-200",
    },
    {
      name: "GitHub",
      icon: <Github className="w-5 h-5 text-white" />,
      bgColor: "bg-gray-900",
      hoverColor: "hover:bg-gray-800",
      textColor: "text-white",
      borderColor: "border-gray-900",
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="w-5 h-5 text-white" />,
      bgColor: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      textColor: "text-white",
      borderColor: "border-blue-600",
    },
    {
      name: "Instagram",
      icon: <Instagram className="w-5 h-5 text-white" />,
      bgColor: "bg-gradient-to-r from-purple-500 to-pink-500",
      hoverColor: "hover:from-purple-600 hover:to-pink-600",
      textColor: "text-white",
      borderColor: "border-purple-500",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-timberwolf p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="border border-sage/30 shadow-lg bg-white/95 backdrop-blur-sm rounded-lg">
          <div className="text-center space-y-6 pb-8 p-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-brunswick-green rounded-2xl flex items-center justify-center shadow-lg">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-brunswick-green">
                Welcome to spevents
              </h1>
              <p className="text-hunter-green text-lg">
                Choose your preferred sign-in method
              </p>
            </div>
          </div>
          <div className="space-y-4 px-8 pb-8">
            {providers.map((provider) => (
              <motion.button
                key={provider.name}
                onClick={() => handleSignIn(provider.name.toLowerCase())}
                disabled={isLoading !== null}
                className={`w-full flex items-center justify-center gap-4 py-4 px-6 rounded-xl border-2 font-medium text-base transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${provider.bgColor} ${provider.hoverColor} ${provider.textColor} ${provider.borderColor} disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
              >
                {isLoading === provider.name.toLowerCase() ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  provider.icon
                )}
                <span className="font-semibold">
                  {isLoading === provider.name.toLowerCase()
                    ? "Signing in..."
                    : `Continue with ${provider.name}`}
                </span>
              </motion.button>
            ))}

            <div className="pt-6 space-y-4 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-sage/30" />
                </div>
                <div className="relative flex justify-center text-sm uppercase">
                  <span className="bg-white px-3 text-hunter-green font-medium">
                    Or
                  </span>
                </div>
              </div>

              <Link
                to="/join"
                className="block w-full py-4 px-6 bg-sage/20 text-brunswick-green rounded-xl hover:bg-sage/30 transition-colors font-semibold text-base"
              >
                Join as Guest
              </Link>

              <p className="text-sm text-hunter-green/70 leading-relaxed">
                By signing in, you agree to our{" "}
                <a
                  href="/terms"
                  className="underline hover:text-brunswick-green transition-colors"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="underline hover:text-brunswick-green transition-colors"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
