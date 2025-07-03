// src/lib/eventService.ts

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "./components/config/firebase";
import { Event, CreateEventData } from "./types/event";
import { onAuthStateChanged, User } from "firebase/auth";

export class EventService {
  private currentUser: User | null = null;

  constructor() {
    // Listen for auth changes
    onAuthStateChanged(auth, (user: User | null) => {
      this.currentUser = user;
    });
  }

  async createEvent(eventData: CreateEventData): Promise<Event> {
    if (!this.currentUser) {
      throw new Error("User not authenticated");
    }

    const newEvent = {
      ...eventData,
      hostEmail: this.currentUser.email!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "draft",
      photoCount: 0,
      sessionCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    };

    const docRef = await addDoc(collection(db, "events"), newEvent);

    return {
      id: docRef.id,
      eventId: docRef.id,
      timestamp: Date.now(),
      ...newEvent,
    };
  }

  async getUserEvents(): Promise<Event[]> {
    if (!this.currentUser) {
      throw new Error("User not authenticated");
    }

    const q = query(
      collection(db, "events"),
      where("hostEmail", "==", this.currentUser.email),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    const events: Event[] = [];

    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data(),
      } as Event);
    });

    return events;
  }

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<void> {
    if (!this.currentUser) {
      throw new Error("User not authenticated");
    }

    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }
}

export const eventService = new EventService();
