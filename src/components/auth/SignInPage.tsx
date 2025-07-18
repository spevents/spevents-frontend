// src/components/auth/SignInPage.tsx

import { useState, useEffect } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import { useAuth } from "./AuthProvider";
import darkIcon from "@/assets/dark-icon.svg";

export function SignInPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect authenticated users based on onboarding status
  useEffect(() => {
    if (!loading && user) {
      console.log("SignInPage: User authenticated, checking onboarding status");

      if (!user.onboardingCompleted || user.isNewUser) {
        console.log("SignInPage: Redirecting to onboarding");
        navigate("/onboarding", { replace: true });
      } else {
        console.log("SignInPage: Redirecting to host dashboard");
        navigate("/host", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sp_darkgreen dark:bg-sp_eggshell">
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
          throw new Error("Invalid provider");
      }

      const result = await signInWithPopup(auth, authProvider);

      if (!result.user?.email) {
        throw new Error("No email found in authentication result");
      }

      console.log(
        "SignInPage: Authentication successful, user data will be processed by AuthProvider",
      );
      // Don't navigate here - let useEffect handle it after AuthProvider processes the user
    } catch (error: any) {
      console.error("Firebase Auth Error:", error);

      if (error.code === "auth/popup-closed-by-user") {
        return; // Don't show error for user-closed popup
      }

      setError(`Authentication failed: ${error.message}`);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sp_darkgreen dark:bg-sp_eggshell">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center space-y-2">
          <img
            src={darkIcon}
            alt="Spevents"
            className="w-12 h-12 mx-auto mb-4"
          />
          <h2 className="text-3xl font-bold text-white dark:text-sp_darkgreen">
            Welcome to Spevents
          </h2>
          <p className="text-white/70 dark:text-sp_darkgreen/70">
            Sign in to start creating memorable events
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => handleSignIn("google")}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 px-4 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading === "google" ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </button>

          <button
            onClick={() => handleSignIn("github")}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center gap-3 bg-gray-800 text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading === "github" ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            )}
            Continue with GitHub
          </button>
        </div>

        <div className="text-center">
          <a
            href="https://spevents.live"
            className="text-white/70 dark:text-sp_darkgreen/70 hover:text-white dark:hover:text-sp_darkgreen text-sm underline transition-colors"
          >
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
