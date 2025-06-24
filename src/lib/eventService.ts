// src/lib/eventService.ts
import {
  collection,
  doc,
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

  private getCurrentUserEmail(): string {
    const user = auth.currentUser;
    if (!user?.email) {
      throw new Error("User not authenticated");
    }
    return user.email;
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateSessionCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async createEvent(data: CreateEventData): Promise<Event> {
    const userEmail = this.getCurrentUserEmail();
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

    try {
      await addDoc(collection(db, this.collection), event);
      return event;
    } catch (error) {
      console.error("Error creating event:", error);
      throw new Error("Failed to create event");
    }
  }

  async getUserEvents(): Promise<Event[]> {
    const userEmail = this.getCurrentUserEmail();

    try {
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

      return events;
    } catch (error) {
      console.error("Error fetching events:", error);
      throw new Error("Failed to load events");
    }
  }

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event> {
    const userEmail = this.getCurrentUserEmail();

    try {
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

      await updateDoc(docRef, updatedEvent);
      return updatedEvent;
    } catch (error) {
      console.error("Error updating event:", error);
      throw new Error("Failed to update event");
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    const userEmail = this.getCurrentUserEmail();

    try {
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
    } catch (error) {
      console.error("Error deleting event:", error);
      throw new Error("Failed to delete event");
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
    } catch (error) {
      console.error("Error finding event by session code:", error);
      return null;
    }
  }
}

export const eventService = new EventService();
