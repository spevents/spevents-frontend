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

// Helper function to get photo key
function getPhotoKey(eventId: string, fileName: string): string {
  return `${getEventPrefix(eventId)}${fileName}`;
}

export async function getPresignedUrl({
  eventId,
  fileName,
  contentType,
}: {
  eventId: string;
  fileName: string;
  contentType: string;
}): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: getPhotoKey(eventId, fileName),
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function getSignedPhotoUrl(
  eventId: string,
  fileName: string,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: getPhotoKey(eventId, fileName),
    ResponseContentType: "image/jpeg",
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export function getPhotoUrl(eventId: string, fileName: string): string {
  return `${CLOUDFRONT_URL}/${getPhotoKey(eventId, fileName)}`;
}

export async function listPhotos(eventId: string): Promise<string[]> {
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
      .map((key) => key.replace(getEventPrefix(eventId), "")); // Return just filename
  } catch (error) {
    console.error("Error listing photos:", error);
    throw error;
  }
}

export async function deleteFile(
  eventId: string,
  fileName: string,
): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: getPhotoKey(eventId, fileName),
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
): Promise<void> {
  try {
    await Promise.all(
      fileNames.map((fileName) => {
        const command = new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: getPhotoKey(eventId, fileName),
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
} as const;

export function storeUploadedPhoto(eventId: string, fileName: string) {
  const key = `${LOCAL_STORAGE_KEYS.UPLOADED_PHOTOS}-${eventId}`;
  const storedPhotos = JSON.parse(localStorage.getItem(key) || "[]");

  storedPhotos.push({
    name: fileName,
    url: getPhotoUrl(eventId, fileName),
    created_at: new Date().toISOString(),
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
