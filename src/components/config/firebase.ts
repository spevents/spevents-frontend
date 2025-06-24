// src/components/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Extend window type for Firebase emulator flag
declare global {
  interface Window {
    __FIREBASE_EMULATOR_INITIALIZED__?: boolean;
  }
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Add validation
Object.entries(firebaseConfig).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Firebase config missing ${key}`);
  }
});

const app = initializeApp(firebaseConfig);

// Only initialize analytics in production
export const analytics = import.meta.env.PROD ? getAnalytics(app) : null;

export const auth = getAuth(app);
export const db = getFirestore(app);

// Use emulators in development if bypass auth is enabled
if (import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH === "true") {
  // Disable network for Firestore to prevent connection errors
  try {
    // Note: This should only be called once per app lifecycle
    if (
      typeof window !== "undefined" &&
      !window.__FIREBASE_EMULATOR_INITIALIZED__
    ) {
      window.__FIREBASE_EMULATOR_INITIALIZED__ = true;
      // You could connect to emulators here if you have them running
      // connectAuthEmulator(auth, "http://localhost:9099");
      // connectFirestoreEmulator(db, 'localhost', 8080);
    }
  } catch (error) {
    console.warn("Firebase emulator connection failed:", error);
  }
}
