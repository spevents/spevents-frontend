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

// Helper to generate folder path for event
const getEventFolder = (eventId: string) => `events/${eventId}`;

export async function getPresignedUrl({ 
  fileName, 
  contentType, 
  eventId 
}: {
  fileName: string;
  contentType: string;
  eventId: string;
}): Promise<string> {
  const key = `${getEventFolder(eventId)}/${fileName}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function getSignedPhotoUrl(fileName: string, eventId: string): Promise<string> {
  const key = `${getEventFolder(eventId)}/${fileName}`;
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ResponseContentType: 'image/jpeg',
  });
  
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export function getPhotoUrl(fileName: string, eventId: string): string {
  return `${CLOUDFRONT_URL}/${getEventFolder(eventId)}/${fileName}`;
}

export async function listPhotos(eventId: string): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: getEventFolder(eventId)
  });

  try {
    const response = await s3Client.send(command);
    return (response.Contents || [])
      .map(item => item.Key!.replace(`${getEventFolder(eventId)}/`, ''))
      .filter(key => key.endsWith('.jpg') || key.endsWith('.jpeg') || key.endsWith('.png'));
  } catch (error) {
    console.error('Error listing photos:', error);
    throw error;
  }
}

export async function deleteFile(fileName: string, eventId: string): Promise<void> {
  const key = `${getEventFolder(eventId)}/${fileName}`;
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}