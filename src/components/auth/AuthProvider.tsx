// src/components/auth/AuthProvider.tsx

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { userService } from "../../lib/userService";

interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  onboardingCompleted: boolean;
  isNewUser?: boolean;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  markOnboardingComplete: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // Check localStorage first for faster response
        const localData = localStorage.getItem("spevents_user_data");
        let localOnboardingStatus = false;

        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            localOnboardingStatus = parsed.completedOnboarding === true;
          } catch (e) {
            console.warn("Failed to parse localStorage user data");
          }
        }

        // Try Firestore, but fallback to localStorage if it fails
        try {
          const { profile, isNewUser } =
            await userService.createOrGetUserProfile(firebaseUser);

          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || profile.displayName || "User",
            photoURL: firebaseUser.photoURL || profile.photoURL,
            onboardingCompleted:
              profile.onboardingCompleted || localOnboardingStatus,
            isNewUser: isNewUser && !localOnboardingStatus, // Don't mark as new if localStorage says completed
          });

          // Update localStorage with Firestore data
          const userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            completedOnboarding:
              profile.onboardingCompleted || localOnboardingStatus,
          };
          localStorage.setItem("spevents_user_data", JSON.stringify(userData));
        } catch (error) {
          console.warn(
            "Firestore unavailable, using localStorage fallback:",
            error,
          );

          // Fallback to localStorage-only mode
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || "User",
            photoURL: firebaseUser.photoURL || undefined,
            onboardingCompleted: localOnboardingStatus,
            isNewUser: !localOnboardingStatus, // New user if localStorage doesn't show completed
          });

          // Ensure localStorage has user data
          if (!localData) {
            const userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              completedOnboarding: false,
            };
            localStorage.setItem(
              "spevents_user_data",
              JSON.stringify(userData),
            );
          }
        }
      } else {
        setUser(null);
        localStorage.removeItem("spevents-auth");
        localStorage.removeItem("onboarding-completed");
        localStorage.removeItem("spevents_user_data");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem("spevents-auth");
      localStorage.removeItem("onboarding-completed");
      localStorage.removeItem("spevents_user_data");
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const markOnboardingComplete = async () => {
    if (!user) return;

    // Always update local state and localStorage first (fallback)
    setUser({ ...user, onboardingCompleted: true, isNewUser: false });

    localStorage.setItem("onboarding-completed", "true");
    const userData = {
      id: user.id,
      email: user.email,
      completedOnboarding: true,
    };
    localStorage.setItem("spevents_user_data", JSON.stringify(userData));

    // Try to update Firestore, but don't fail if it doesn't work
    try {
      await userService.markOnboardingComplete(user.id);
      console.log("Onboarding completion saved to Firestore");
    } catch (error) {
      console.warn(
        "Failed to save onboarding completion to Firestore, using localStorage fallback:",
        error,
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signOut,
        markOnboardingComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
