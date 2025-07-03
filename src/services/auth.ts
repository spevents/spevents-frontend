// src/services/auth.ts

interface User {
  email: string;
  getIdToken(): Promise<string>;
}

class AuthService {
  currentUser: User | null = null;

  setUser(email: string) {
    this.currentUser = {
      email,
      getIdToken: async () => {
        // Return a mock token for development
        return "mock-token";
      },
    };
  }

  signOut() {
    this.currentUser = null;
    localStorage.removeItem("spevents-auth");
  }
}

export const auth = new AuthService();

// For compatibility with Firebase auth
export const setCurrentUser = (email: string) => {
  auth.currentUser = {
    email,
    getIdToken: async () => "mock-token",
  };
};
