// src/utils/ensureSessionCode.ts

import { eventService } from "../services/api";

export const ensureEventHasSessionCode = async (eventId: string) => {
  try {
    const event = await eventService.getEvent(eventId);

    if (!event.sessionCode || event.status !== "active") {
      console.log("Event needs session code or activation");

      // Update event to active status (this should generate session code)
      const updatedEvent = await eventService.updateEvent(eventId, {
        status: "active",
      });

      console.log("Event activated:", updatedEvent);
      return updatedEvent;
    }

    return event;
  } catch (error) {
    console.error("Error ensuring session code:", error);
    throw error;
  }
};

// Manual session code generation if needed
export const generateSessionCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};
