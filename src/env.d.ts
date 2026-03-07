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
  // NOTE: AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) and
  // third-party API keys (HUGGING_FACE_API_KEY, GITHUB_TOKEN) must NEVER
  // be declared as VITE_* variables — they would be inlined into the browser
  // bundle. These belong exclusively in the backend .env.
  readonly VITE_CLOUDFRONT_URL: string;
  readonly VITE_BYPASS_AUTH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
