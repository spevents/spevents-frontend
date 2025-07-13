// src/lib/userService.ts

import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../components/config/firebase";

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  onboardingCompleted: boolean;
  firstLogin: boolean;
}

export class UserService {
  /**
   * Creates or gets user profile, returns whether user is new
   */
  async createOrGetUserProfile(
    firebaseUser: any,
  ): Promise<{ profile: UserProfile; isNewUser: boolean }> {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Existing user
      const profile = userSnap.data() as UserProfile;
      return { profile, isNewUser: false };
    } else {
      // New user - create profile
      const newProfile: UserProfile = {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || "",
        photoURL: firebaseUser.photoURL || "",
        createdAt: new Date().toISOString(),
        onboardingCompleted: false,
        firstLogin: true,
      };

      await setDoc(userRef, newProfile);
      return { profile: newProfile, isNewUser: true };
    }
  }

  /**
   * Mark user onboarding as complete
   */
  async markOnboardingComplete(userId: string): Promise<void> {
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        onboardingCompleted: true,
        firstLogin: false,
      },
      { merge: true },
    );
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  }
}

export const userService = new UserService();
