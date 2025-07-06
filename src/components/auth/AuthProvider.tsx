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
  onboardingCompleted: boolean;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        const onboardingCompleted =
          localStorage.getItem("onboarding-completed") === "true";

        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "User",
          photoURL: firebaseUser.photoURL || undefined,
          onboardingCompleted,
        });
      } else {
        setUser(null);
        localStorage.removeItem("spevents-auth");
        localStorage.removeItem("onboarding-completed");
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
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const markOnboardingComplete = () => {
    localStorage.setItem("onboarding-completed", "true");
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
