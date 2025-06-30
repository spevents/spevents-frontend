// src/services/auth.ts
interface User {
  email: string | null;
}

class AuthService {
  public currentUser: User | null = null;

  constructor() {
    const email = localStorage.getItem("spevents-auth");
    if (email) {
      this.currentUser = { email };
    }
  }

  get user() {
    return this.currentUser;
  }
}

export class GoogleAuthProvider {}

export const auth = new AuthService();

export function signInWithPopup(
  auth: AuthService,
  _provider: GoogleAuthProvider,
) {
  const email = import.meta.env.VITE_ALLOWED_EMAIL || "demo@spevents.live";
  auth.currentUser = { email };
  localStorage.setItem("spevents-auth", email);
  return Promise.resolve({ user: auth.currentUser });
}

export function onAuthStateChanged(
  auth: AuthService,
  callback: (user: User | null) => void,
) {
  callback(auth.currentUser);
  return () => {}; // unsubscribe function
}
