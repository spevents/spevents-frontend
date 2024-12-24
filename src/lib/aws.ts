// src/lib/aws.ts
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';


// AWS Configuration
const REGION = import.meta.env.VITE_AWS_REGION;
const BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME;
const CLOUDFRONT_URL = import.meta.env.VITE_CLOUDFRONT_URL;

// Initialize S3 Client
const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  }
});


interface UploadParams {
  fileName: string;
  contentType: string;
}

export async function getPresignedUrl({ fileName, contentType }: {
  fileName: string;
  contentType: string;
}): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: import.meta.env.VITE_S3_BUCKET_NAME,
    Key: fileName,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function getSignedPhotoUrl(fileName: string): Promise<string> {
  try {
    console.log('Getting signed URL for:', fileName);
    console.log('Using bucket:', import.meta.env.VITE_S3_BUCKET_NAME);
    
    const command = new GetObjectCommand({
      Bucket: import.meta.env.VITE_S3_BUCKET_NAME,
      Key: fileName,
      ResponseContentType: 'image/jpeg',
    });
    
    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600,
    });
    
    console.log('Generated signed URL:', signedUrl.substring(0, 100) + '...');
    return signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
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

export function getPhotoUrl(fileName: string): string {
  return `${import.meta.env.VITE_CLOUDFRONT_URL}/${fileName}`;
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
