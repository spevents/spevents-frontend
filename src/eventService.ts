// src/lib/eventService.ts
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import { db } from "../components/config/firebase";
import { Event, CreateEventData } from "../types/event";
import { auth } from "../components/config/firebase";

class EventService {
  private collection = "events";

  private async getCurrentUserEmail(): Promise<string> {
    // Only bypass auth in development when BOTH conditions are met
    if (import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH === "true") {
      return import.meta.env.VITE_ALLOWED_EMAIL || "dev@spevents.local";
    }

    // For all other cases (including DEV with VITE_BYPASS_AUTH=false), require real auth
    return new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        if (user?.email) {
          resolve(user.email);
        } else {
          reject(new Error("User not authenticated"));
        }
      });

      // If auth state is already available
      if (auth.currentUser?.email) {
        unsubscribe();
        resolve(auth.currentUser.email);
      }
    });
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateSessionCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async createEvent(data: CreateEventData): Promise<Event> {
    try {
      const userEmail = await this.getCurrentUserEmail();
      const now = new Date().toISOString();

      const event: Event = {
        id: this.generateEventId(),
        name: data.name,
        description: data.description,
        createdAt: now,
        updatedAt: now,
        hostEmail: userEmail,
        status: "draft",
        photoCount: 0,
        sessionCode: this.generateSessionCode(),
      };

      console.log("Creating event:", event);

      // Convert Event to plain object for Firestore
      const eventData = {
        id: event.id,
        name: event.name,
        description: event.description,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        hostEmail: event.hostEmail,
        status: event.status,
        photoCount: event.photoCount,
        sessionCode: event.sessionCode,
      };

      const docRef = await addDoc(collection(db, this.collection), eventData);
      console.log("Event created with doc ID:", docRef.id);

      return event;
    } catch (error: any) {
      console.error("Error creating event:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

      // Provide specific error messages
      if (error.code === "permission-denied") {
        throw new Error("Permission denied. Check Firestore security rules.");
      } else if (error.code === "unauthenticated") {
        throw new Error("User not authenticated. Please sign in again.");
      } else {
        throw new Error(`Failed to create event: ${error.message}`);
      }
    }
  }

  async getUserEvents(): Promise<Event[]> {
    try {
      const userEmail = await this.getCurrentUserEmail();
      console.log("Fetching events for user:", userEmail);

      const q = query(
        collection(db, this.collection),
        where("hostEmail", "==", userEmail),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const events: Event[] = [];

      querySnapshot.forEach((doc) => {
        events.push(doc.data() as Event);
      });

      console.log("Fetched events:", events.length);
      return events;
    } catch (error: any) {
      console.error("Error fetching events:", error);
      console.error("Error code:", error.code);

      if (error.code === "failed-precondition") {
        throw new Error(
          "Database index required. Check Firestore console for index creation links.",
        );
      } else if (error.code === "permission-denied") {
        throw new Error("Permission denied. Check Firestore security rules.");
      } else {
        throw new Error(`Failed to load events: ${error.message}`);
      }
    }
  }

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event> {
    try {
      const userEmail = await this.getCurrentUserEmail();

      // Find the document with matching eventId and userEmail
      const q = query(
        collection(db, this.collection),
        where("id", "==", eventId),
        where("hostEmail", "==", userEmail),
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Event not found or unauthorized");
      }

      const docRef = querySnapshot.docs[0].ref;
      const currentData = querySnapshot.docs[0].data() as Event;

      const updatedEvent: Event = {
        ...currentData,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Convert to plain object for Firestore
      const updateData = {
        ...updates,
        updatedAt: updatedEvent.updatedAt,
      };

      await updateDoc(docRef, updateData);
      return updatedEvent;
    } catch (error: any) {
      console.error("Error updating event:", error);
      throw new Error(`Failed to update event: ${error.message}`);
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      const userEmail = await this.getCurrentUserEmail();

      // Find the document with matching eventId and userEmail
      const q = query(
        collection(db, this.collection),
        where("id", "==", eventId),
        where("hostEmail", "==", userEmail),
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Event not found or unauthorized");
      }

      const docRef = querySnapshot.docs[0].ref;
      await deleteDoc(docRef);
    } catch (error: any) {
      console.error("Error deleting event:", error);
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }

  async getEventBySessionCode(sessionCode: string): Promise<Event | null> {
    try {
      const q = query(
        collection(db, this.collection),
        where("sessionCode", "==", sessionCode),
        where("status", "==", "active"),
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      return querySnapshot.docs[0].data() as Event;
    } catch (error: any) {
      console.error("Error finding event by session code:", error);
      return null;
    }
  }
}

export const eventService = new EventService();
