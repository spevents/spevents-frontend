//  src/env.d.ts

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_DEMO_MODE: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_AWS_REGION: string;
  readonly VITE_AWS_ACCESS_KEY_ID: string;
  readonly VITE_AWS_SECRET_ACCESS_KEY: string;
  readonly VITE_S3_BUCKET_NAME: string;
  readonly VITE_CLOUDFRONT_URL: string;
  readonly VITE_BYPASS_AUTH: string;
  readonly VITE_HUGGING_FACE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
