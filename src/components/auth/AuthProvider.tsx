// src/components/auth/AuthProvider.tsx
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../config/firebase";

interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  onboardingCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  markOnboardingComplete: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Updated function to check onboarding status from the correct localStorage key
  const checkOnboardingStatus = () => {
    const userData = localStorage.getItem("spevents_user_data");
    if (userData) {
      const parsedData = JSON.parse(userData);
      return parsedData.completedOnboarding === true; // Fixed typo: was "completeOnboarding"
    }
    return false;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // Use the updated function to check onboarding status
        const onboardingCompleted = checkOnboardingStatus();

        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "User",
          photoURL: firebaseUser.photoURL || undefined,
          onboardingCompleted,
        });
      } else {
        setUser(null);
        // Clean up all localStorage items on sign out
        localStorage.removeItem("spevents-auth");
        localStorage.removeItem("onboarding-completed");
        localStorage.removeItem("spevents_user_data"); // Add this cleanup
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Clean up all localStorage items
      localStorage.removeItem("spevents-auth");
      localStorage.removeItem("onboarding-completed");
      localStorage.removeItem("spevents_user_data"); // Add this cleanup
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Updated to also check the new localStorage key
  const markOnboardingComplete = () => {
    localStorage.setItem("onboarding-completed", "true");

    // Also update the user data to mark onboarding as complete
    const userData = localStorage.getItem("spevents_user_data");
    if (userData) {
      const parsedData = JSON.parse(userData);
      parsedData.completedOnboarding = true;
      localStorage.setItem("spevents_user_data", JSON.stringify(parsedData));
    }

    if (user) {
      setUser({ ...user, onboardingCompleted: true });
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
