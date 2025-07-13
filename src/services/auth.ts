// src/services/auth.ts

import {
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth as firebaseAuth } from "@/components/config/firebase";

const provider = new GoogleAuthProvider();
provider.addScope("email");
provider.addScope("profile");

interface User {
  uid?: string;
  email: string;
  displayName?: string;
  isVerified?: boolean;
  getIdToken(): Promise<string>;
}

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  isVerified: boolean;
}

class AuthService {
  currentUser: User | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    // Listen for Firebase auth state changes
    onAuthStateChanged(firebaseAuth, (user) => {
      if (user && user.email) {
        // REMOVED: Email restriction check - allow all users
        this.currentUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
          isVerified: true, // All authenticated users are verified
          getIdToken: () => user.getIdToken(),
        };
      } else {
        this.currentUser = null;
      }

      // Notify listeners
      this.listeners.forEach((listener) =>
        listener(this.currentUser as AuthUser | null),
      );
    });
  }

  async signInWithGoogle(): Promise<AuthUser> {
    try {
      await signInWithRedirect(firebaseAuth, provider);
      throw new Error("Redirect initiated - this should not be reached");
    } catch (error: any) {
      console.error("Sign in error:", error);
      throw error;
    }
  }

  async handleRedirectResult(): Promise<AuthUser | null> {
    try {
      const result = await getRedirectResult(firebaseAuth);

      if (!result || !result.user?.email) {
        return null;
      }

      const user = result.user;

      const authUser: AuthUser = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        isVerified: true,
      };

      return authUser;
    } catch (error: any) {
      console.error("Redirect result error:", error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(firebaseAuth);
      this.currentUser = null;
      localStorage.removeItem("spevents-auth");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser as AuthUser | null;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    this.listeners.push(callback);

    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

export const auth = new AuthService();
