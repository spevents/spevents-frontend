// src/lib/userService.ts

import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../components/config/firebase";

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  onboardingCompleted: boolean;
  firstLogin: boolean;
  subscription?: {
    tier: "free" | "pro" | "enterprise";
    status: "active" | "cancelled" | "past_due";
    eventsLimit: number;
    photosPerEventLimit: number;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    customerId?: string;
    subscriptionId?: string;
  };
  preferences?: {
    emailNotifications: boolean;
    marketingEmails: boolean;
    theme: "light" | "dark" | "system";
  };
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
        subscription: {
          tier: "free",
          status: "active",
          eventsLimit: 3,
          photosPerEventLimit: 100,
        },
        preferences: {
          emailNotifications: true,
          marketingEmails: false,
          theme: "system",
        },
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
    await updateDoc(userRef, {
      onboardingCompleted: true,
      firstLogin: false,
    });
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

  /**
   * Update user profile information
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>,
  ): Promise<void> {
    const userRef = doc(db, "users", userId);

    // Filter out undefined values and sensitive fields
    const safeUpdates = Object.fromEntries(
      Object.entries(updates).filter(
        ([key, value]) =>
          value !== undefined &&
          !["id", "createdAt", "subscription"].includes(key),
      ),
    );

    await updateDoc(userRef, safeUpdates);
  }

  /**
   * Update user subscription information
   */
  async updateSubscription(
    userId: string,
    subscription: UserProfile["subscription"],
  ): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { subscription });
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<UserProfile["preferences"]>,
  ): Promise<void> {
    const userRef = doc(db, "users", userId);

    // Get current profile to merge preferences
    const currentProfile = await this.getUserProfile(userId);
    const updatedPreferences = {
      ...currentProfile?.preferences,
      ...preferences,
    };

    await updateDoc(userRef, { preferences: updatedPreferences });
  }

  /**
   * Check if user can create events based on subscription
   */
  async canCreateEvent(userId: string): Promise<boolean> {
    const profile = await this.getUserProfile(userId);
    if (!profile?.subscription) return false;

    const { tier, eventsLimit } = profile.subscription;

    // Unlimited for enterprise
    if (tier === "enterprise" || eventsLimit === -1) return true;

    // Check current month usage (placeholder - implement with actual event counting)
    const currentEventCount = await this.getCurrentMonthEventCount(userId);
    return currentEventCount < eventsLimit;
  }

  /**
   * Check if user can upload photos based on subscription
   */
  async canUploadPhoto(userId: string, eventId: string): Promise<boolean> {
    const profile = await this.getUserProfile(userId);
    if (!profile?.subscription) return false;

    const { tier, photosPerEventLimit } = profile.subscription;

    // Unlimited for enterprise
    if (tier === "enterprise" || photosPerEventLimit === -1) return true;

    // Check current event photo count (placeholder)
    const currentPhotoCount = await this.getEventPhotoCount(userId, eventId);
    return currentPhotoCount < photosPerEventLimit;
  }

  /**
   * Get current month event count for user
   */
  private async getCurrentMonthEventCount(_userId: string): Promise<number> {
    // Placeholder - implement with actual event service integration
    // This would query events collection for current month
    return 0;
  }

  /**
   * Get photo count for specific event
   */
  private async getEventPhotoCount(
    _userId: string,
    _eventId: string,
  ): Promise<number> {
    // Placeholder - implement with actual photo counting
    // This would count photos in S3 or photos collection
    return 0;
  }

  /**
   * Upgrade user subscription
   */
  async upgradeSubscription(
    userId: string,
    tier: "pro" | "enterprise",
    subscriptionDetails: {
      customerId: string;
      subscriptionId: string;
      currentPeriodStart: string;
      currentPeriodEnd: string;
    },
  ): Promise<void> {
    const subscription: UserProfile["subscription"] = {
      tier,
      status: "active",
      eventsLimit: tier === "pro" ? 25 : -1,
      photosPerEventLimit: tier === "pro" ? 1000 : -1,
      ...subscriptionDetails,
    };

    await this.updateSubscription(userId, subscription);
  }

  /**
   * Cancel user subscription
   */
  async cancelSubscription(userId: string): Promise<void> {
    const profile = await this.getUserProfile(userId);
    if (!profile?.subscription) return;

    const updatedSubscription = {
      ...profile.subscription,
      status: "cancelled" as const,
    };

    await this.updateSubscription(userId, updatedSubscription);
  }
}

export const userService = new UserService();
