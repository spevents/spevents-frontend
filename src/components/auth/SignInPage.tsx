// src/components/auth/SignInPage.tsx
import { useState, useEffect } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../config/firebase";
import { useAuth } from "./AuthProvider";

export function SignInPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Wait for auth loading to complete, then redirect if authenticated
  useEffect(() => {
    if (!loading && user) {
      console.log("SignInPage: User authenticated, navigating to /host");
      navigate("/host", { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is authenticated (prevents flash)
  if (user) {
    return null;
  }

  const handleSignIn = async (provider: string) => {
    setIsLoading(provider);
    setError("");

    try {
      let authProvider;

      switch (provider) {
        case "google":
          authProvider = new GoogleAuthProvider();
          break;
        case "github":
          authProvider = new GithubAuthProvider();
          break;
        default:
          throw new Error("Unsupported provider");
      }

      const result = await signInWithPopup(auth, authProvider);

      if (result.user?.email) {
        localStorage.setItem("spevents-auth", result.user.email);
        console.log(
          "SignIn: Authentication successful, AuthProvider will handle navigation",
        );

        // Don't navigate manually - let the useEffect handle it when AuthProvider updates
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setError(error.message || "Failed to sign in");
      setIsLoading(null);
    }
  };

  const providers = [
    {
      name: "Google",
      id: "google",
      bgColor: "bg-white",
      textColor: "text-gray-900",
      borderColor: "border-gray-300",
      hoverColor: "hover:bg-gray-50",
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
    },
    {
      name: "GitHub",
      id: "github",
      bgColor: "bg-gray-800",
      textColor: "text-white",
      borderColor: "border-gray-600",
      hoverColor: "hover:bg-gray-700",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">
                Welcome to spevents
              </h1>
              <p className="text-gray-300 text-lg">
                Choose your preferred sign-in method
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleSignIn(provider.id)}
                disabled={isLoading !== null}
                className={`w-full flex items-center justify-center gap-4 py-4 px-6 rounded-xl border-2 font-medium text-base transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${provider.bgColor} ${provider.hoverColor} ${provider.textColor} ${provider.borderColor} disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {isLoading === provider.id ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  provider.icon
                )}
                <span className="font-semibold">
                  {isLoading === provider.id
                    ? "Signing in..."
                    : `Continue with ${provider.name}`}
                </span>
              </button>
            ))}

            <div className="pt-6 space-y-4 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm uppercase">
                  <span className="bg-gray-900 px-3 text-gray-300 font-medium">
                    Or
                  </span>
                </div>
              </div>

              <Link
                to="https://join.spevents.live"
                className="block w-full py-4 px-6 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-semibold text-base border border-white/20"
              >
                Join as Guest
              </Link>

              <p className="text-sm text-gray-400 leading-relaxed">
                By signing in, you agree to our{" "}
                <a
                  href="/terms"
                  className="underline hover:text-white transition-colors"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="underline hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
