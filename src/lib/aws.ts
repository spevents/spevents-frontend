// src/lib/aws.ts
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// AWS Configuration
const REGION = import.meta.env.VITE_AWS_REGION;
const BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME;
const CLOUDFRONT_URL = import.meta.env.VITE_CLOUDFRONT_URL;

export interface EventPhoto {
  fileName: string;
  fullKey: string;
  isGuestPhoto: boolean;
  guestId?: string;
}

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

// Helper function to get event prefix
function getEventPrefix(eventId: string): string {
  return `events/${eventId}/photos/`;
}

// Helper function to get guest-specific prefix
function getGuestPrefix(eventId: string, guestId: string): string {
  return `events/${eventId}/guests/${guestId}/`;
}

// Helper function to get photo key
function getPhotoKey(
  eventId: string,
  fileName: string,
  guestId?: string,
): string {
  if (guestId) {
    return `${getGuestPrefix(eventId, guestId)}${fileName}`;
  }
  return `${getEventPrefix(eventId)}${fileName}`;
}

// Generate or get persistent guest ID
export function getGuestId(): string {
  let guestId = localStorage.getItem("spevents-guest-id");
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("spevents-guest-id", guestId);
  }
  return guestId;
}

export async function getPresignedUrl({
  eventId,
  fileName,
  contentType,
  isGuestPhoto = false,
}: {
  eventId: string;
  fileName: string;
  contentType: string;
  isGuestPhoto?: boolean;
}): Promise<string> {
  const guestId = isGuestPhoto ? getGuestId() : undefined;

  // Build metadata with proper typing
  const metadata: Record<string, string> = { eventId };
  if (isGuestPhoto && guestId) {
    metadata.guestId = guestId;
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: getPhotoKey(eventId, fileName, guestId),
    ContentType: contentType,
    Metadata: metadata,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function getSignedPhotoUrl(
  eventId: string,
  fileName: string,
  guestId?: string,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: getPhotoKey(eventId, fileName, guestId),
    ResponseContentType: "image/jpeg",
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export function getPhotoUrl(
  eventId: string,
  fileName: string,
  guestId?: string,
): string {
  return `${CLOUDFRONT_URL}/${getPhotoKey(eventId, fileName, guestId)}`;
}

// List all event photos (for hosts)
export async function listEventPhotos(eventId: string): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: getEventPrefix(eventId),
  });

  try {
    const response = await s3Client.send(command);
    return (response.Contents || [])
      .map((item) => item.Key!)
      .filter(
        (key) =>
          key.endsWith(".jpg") || key.endsWith(".jpeg") || key.endsWith(".png"),
      )
      .map((key) => key.replace(getEventPrefix(eventId), ""));
  } catch (error) {
    console.error("Error listing event photos:", error);
    throw error;
  }
}

// List guest's photos
export async function listGuestPhotos(
  eventId: string,
  guestId?: string,
): Promise<string[]> {
  const targetGuestId = guestId || getGuestId();
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: getGuestPrefix(eventId, targetGuestId),
  });

  try {
    const response = await s3Client.send(command);
    return (response.Contents || [])
      .map((item) => item.Key!)
      .filter(
        (key) =>
          key.endsWith(".jpg") || key.endsWith(".jpeg") || key.endsWith(".png"),
      )
      .map((key) => key.replace(getGuestPrefix(eventId, targetGuestId), ""));
  } catch (error) {
    console.error("Error listing guest photos:", error);
    throw error;
  }
}

// Backward compatibility - use eventId from environment as fallback
export async function listPhotos(eventId: string): Promise<string[]> {
  return listEventPhotos(eventId);
}

export async function deleteFile(
  eventId: string,
  fileName: string,
  guestId?: string,
): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: getPhotoKey(eventId, fileName, guestId),
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

export async function deleteMultipleFiles(
  eventId: string,
  fileNames: string[],
  guestId?: string,
): Promise<void> {
  try {
    await Promise.all(
      fileNames.map((fileName) => {
        const command = new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: getPhotoKey(eventId, fileName, guestId),
        });
        return s3Client.send(command);
      }),
    );
  } catch (error) {
    console.error("Error deleting multiple files:", error);
    throw error;
  }
}

// Updated helper functions for local storage
export const LOCAL_STORAGE_KEYS = {
  UPLOADED_PHOTOS: "uploaded-photos",
  TEMP_PHOTOS: "temp-photos",
  GUEST_ID: "spevents-guest-id",
} as const;

export function storeUploadedPhoto(
  eventId: string,
  fileName: string,
  isGuestPhoto = false,
) {
  const guestId = isGuestPhoto ? getGuestId() : undefined;
  const key = `${LOCAL_STORAGE_KEYS.UPLOADED_PHOTOS}-${eventId}`;
  const storedPhotos = JSON.parse(localStorage.getItem(key) || "[]");

  storedPhotos.push({
    name: fileName,
    url: getPhotoUrl(eventId, fileName, guestId),
    created_at: new Date().toISOString(),
    guestId: isGuestPhoto ? guestId : undefined,
  });

  localStorage.setItem(key, JSON.stringify(storedPhotos));
}

export function getUploadedPhotos(eventId: string) {
  const key = `${LOCAL_STORAGE_KEYS.UPLOADED_PHOTOS}-${eventId}`;
  return JSON.parse(localStorage.getItem(key) || "[]");
}

export function storeTempPhotos(eventId: string, photos: any[]) {
  const key = `${LOCAL_STORAGE_KEYS.TEMP_PHOTOS}-${eventId}`;
  sessionStorage.setItem(key, JSON.stringify(photos));
}

export function getTempPhotos(eventId: string) {
  const key = `${LOCAL_STORAGE_KEYS.TEMP_PHOTOS}-${eventId}`;
  return JSON.parse(sessionStorage.getItem(key) || "[]");
}

// List ALL photos for an event (both main event photos and guest photos)
export async function listAllEventPhotos(
  eventId: string,
): Promise<EventPhoto[]> {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: `events/${eventId}/`,
  });

  try {
    const response = await s3Client.send(command);
    return (response.Contents || [])
      .map((item) => item.Key!)
      .filter(
        (key) =>
          key.endsWith(".jpg") || key.endsWith(".jpeg") || key.endsWith(".png"),
      )
      .map((key) => {
        // Parse the S3 key to determine if it's a guest photo
        const parts = key.split("/");
        const fileName = parts[parts.length - 1]; // Get last part (filename)

        // Check if it's a guest photo: events/eventId/guests/guestId/filename
        if (parts.length === 5 && parts[2] === "guests") {
          return {
            fileName,
            fullKey: key,
            isGuestPhoto: true,
            guestId: parts[3],
          };
        }

        // Otherwise it's a regular event photo: events/eventId/photos/filename
        return {
          fileName,
          fullKey: key,
          isGuestPhoto: false,
        };
      });
  } catch (error) {
    console.error("Error listing all event photos:", error);
    throw error;
  }
}

export function getEventPhotoUrl(eventId: string, photo: EventPhoto): string {
  if (photo.isGuestPhoto && photo.guestId) {
    return `${CLOUDFRONT_URL}/events/${eventId}/guests/${photo.guestId}/${photo.fileName}`;
  } else {
    return `${CLOUDFRONT_URL}/events/${eventId}/photos/${photo.fileName}`;
  }
}
