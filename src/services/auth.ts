// src/services/auth.ts

import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth as firebaseAuth } from "../components/config/firebase";

// Allowed emails for host access
const ALLOWED_EMAILS = ["spevents.party@gmail.com"];

const provider = new GoogleAuthProvider();

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
        const isVerified = this.isEmailAllowed(user.email);
        this.currentUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
          isVerified,
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

  private isEmailAllowed(email: string): boolean {
    return ALLOWED_EMAILS.includes(email.toLowerCase());
  }

  async signInWithGoogle(): Promise<AuthUser> {
    try {
      const result = await signInWithPopup(firebaseAuth, provider);
      const user = result.user;

      if (!user.email) {
        throw new Error("No email associated with Google account");
      }

      // Check if user is authorized
      if (!this.isEmailAllowed(user.email)) {
        await this.signOut();
        throw new Error(
          `Access denied. Only authorized emails can sign in as hosts.`,
        );
      }

      const authUser: AuthUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        isVerified: true,
      };

      return authUser;
    } catch (error: any) {
      console.error("Sign in error:", error);
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

  // Legacy compatibility method
  setUser(email: string) {
    this.currentUser = {
      email,
      getIdToken: async () => "mock-token",
    };
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser as AuthUser | null;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.currentUser.isVerified !== false;
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

  async waitForAuth(): Promise<AuthUser | null> {
    return new Promise((resolve) => {
      const unsubscribe = this.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }
}

export const auth = new AuthService();

// Legacy compatibility exports
export const setCurrentUser = (email: string) => {
  auth.setUser(email);
};

export const authService = auth;
