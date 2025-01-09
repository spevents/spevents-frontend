// src/lib/aws.ts
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// AWS Configuration
const REGION = import.meta.env.VITE_AWS_REGION;
const BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME;
const CLOUDFRONT_URL = import.meta.env.VITE_CLOUDFRONT_URL;

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  }
});

export async function getPresignedUrl({ 
  fileName, 
  contentType,
}: {
  fileName: string;
  contentType: string;
}): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function getSignedPhotoUrl(fileName: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    ResponseContentType: 'image/jpeg',
  });
  
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export function getPhotoUrl(fileName: string): string {
  return `${CLOUDFRONT_URL}/${fileName}`;
}

export async function listPhotos(): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME
  });

  try {
    const response = await s3Client.send(command);
    return (response.Contents || [])
      .map(item => item.Key!)
      .filter(key => key.endsWith('.jpg') || key.endsWith('.jpeg') || key.endsWith('.png'));
  } catch (error) {
    console.error('Error listing photos:', error);
    throw error;
  }
}

export async function deleteFile(fileName: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// Helper functions for local storage
export const LOCAL_STORAGE_KEYS = {
  UPLOADED_PHOTOS: 'uploaded-photos',
  TEMP_PHOTOS: 'temp-photos'
} as const;

export function storeUploadedPhoto(fileName: string) {
  const storedPhotos = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.UPLOADED_PHOTOS) || '[]');
  storedPhotos.push({
    name: fileName,
    url: getPhotoUrl(fileName),
    created_at: new Date().toISOString()
  });
  localStorage.setItem(LOCAL_STORAGE_KEYS.UPLOADED_PHOTOS, JSON.stringify(storedPhotos));
}

export function getUploadedPhotos() {
  return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.UPLOADED_PHOTOS) || '[]');
}

export function storeTempPhotos(photos: any[]) {
  sessionStorage.setItem(LOCAL_STORAGE_KEYS.TEMP_PHOTOS, JSON.stringify(photos));
}

export function getTempPhotos() {
  return JSON.parse(sessionStorage.getItem(LOCAL_STORAGE_KEYS.TEMP_PHOTOS) || '[]');
}