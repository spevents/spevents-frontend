# Spevents Frontend - Project Context

## Project Overview

Spevents is a real-time photo wall application for live events. Guests capture and upload photos via their phones, which appear on a display screen in real-time. The system consists of this frontend and a companion backend.

**Backend Repository:** `/Users/fardeenb/Documents/Projects/spevents-backend`

## Tech Stack

### Frontend

- **Framework:** React 19.1.1 + TypeScript 5.6.2
- **Build Tool:** Vite 7.0.3
- **Styling:** Tailwind CSS 3.4.14
- **Animations:** Framer Motion 11.11.11
- **3D Graphics:** Three.js + React Three Fiber + Drei
- **UI Components:** Radix UI primitives
- **Routing:** React Router DOM 6.28.0
- **Auth:** Firebase Auth + Firestore

### Backend

- **Runtime:** Node.js/TypeScript (Vercel serverless functions)
- **Framework:** Express.js (local dev routing)
- **Database:** Firebase Firestore
- **Storage:** AWS S3 + CloudFront CDN
- **AI Services:** Claude Sonnet 4.5 (captions), Hugging Face (NSFW detection), Replicate (depth maps)

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Guest Phone   │────▶│  Frontend App   │────▶│  Backend API    │
│  (Camera/Upload)│     │  (React/Vite)   │     │  (Vercel)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │                        │
                                │                        ▼
                                │               ┌─────────────────┐
                                │               │    Firebase     │
                                │               │   (Auth/DB)     │
                                │               └─────────────────┘
                                │                        │
                                ▼                        ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │   CloudFront    │◀────│      AWS S3     │
                        │     (CDN)       │     │   (Storage)     │
                        └─────────────────┘     └─────────────────┘
```

## Directory Structure

### Frontend (`/src`)

```
src/
├── components/           # React UI components
│   ├── auth/            # SignIn, RouteGuard
│   ├── camera/          # CameraInterface
│   ├── config/          # Firebase config
│   ├── slideshow_modes/ # SimpleSlideshow, FunSlideshow, etc.
│   ├── PhotoReview/     # Photo approval/upload UI
│   └── ui/              # Radix-based primitives
├── contexts/            # React Context providers
├── pages/
│   ├── guest/           # Guest-facing routes (camera, gallery)
│   ├── HostRoutes/      # Host dashboard, event management
│   └── landing/         # Public landing page
├── services/
│   ├── api.ts           # Backend API client
│   └── nsfw.ts          # NSFW check service
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── types/               # TypeScript interfaces
```

### Backend (`/api`)

```
api/
├── photos/
│   ├── index.ts         # Upload/delete handler (presigned URLs)
│   ├── [eventId]/all.ts # List all event photos
│   └── email.ts         # Email photos to guests
├── guest/event/         # Public event lookup by session code
├── generate-caption.ts  # Single image caption (Claude)
├── generate-captions-batch.ts  # Batch captions
├── check-nsfw.ts        # NSFW detection (Hugging Face)
└── depth-estimation.ts  # Depth maps (Replicate)
```

## Key Data Flows

### Photo Upload Flow

1. Guest captures photo via `CameraInterface` (WebRTC)
2. Photo stored temporarily in localStorage as data URL
3. `PhotoReview` component handles approval/deletion
4. NSFW check runs (compresses image, sends to backend)
5. Backend returns presigned S3 URL
6. Frontend uploads directly to S3
7. Photo URL stored in Firestore

### Photo Display Flow

1. Frontend fetches photo list from `/api/photos/[eventId]/all`
2. Photos served via CloudFront CDN URLs
3. Gallery components use native lazy loading
4. PhotoGallery polls every 5 seconds for updates

### Guest Access Flow

1. Host shares 6-character session code
2. Guest accesses via session code (no auth required)
3. Backend validates code against active event
4. Guest can upload/view photos for that event

## API Endpoints

| Endpoint                           | Method | Purpose                  | Auth                  |
| ---------------------------------- | ------ | ------------------------ | --------------------- |
| `/api/events`                      | CRUD   | Event management         | Firebase Token        |
| `/api/photos`                      | POST   | Get presigned upload URL | Token or Session Code |
| `/api/photos/[eventId]/all`        | GET    | List all event photos    | Token                 |
| `/api/guest/event?sessionCode=XXX` | GET    | Get event by code        | Public                |
| `/api/check-nsfw`                  | POST   | NSFW content detection   | Public                |
| `/api/generate-captions-batch`     | POST   | Generate AI captions     | Token                 |

## Environment Variables

### Frontend (`.env`)

```env
VITE_BACKEND_URL=https://api.spevents.live
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=spevents-896f7.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=spevents-896f7
VITE_CLOUDFRONT_URL=https://d3boq06xf0z9b1.cloudfront.net
VITE_S3_BUCKET_NAME=spevents-photos
VITE_AWS_REGION=us-east-2
```

### Backend

```env
FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME
CLOUDFRONT_URL, ANTHROPIC_API_KEY, HUGGING_FACE_API_KEY
```

## Key Components

| Component       | File                                                         | Purpose                      |
| --------------- | ------------------------------------------------------------ | ---------------------------- |
| CameraInterface | `components/camera/CameraInterface.tsx`                      | WebRTC camera capture        |
| PhotoReview     | `components/PhotoReview/PhotoReview.tsx`                     | Swipe-based photo approval   |
| PhotoGallery    | `components/PhotoGallery.tsx`                                | Grid gallery with 5s polling |
| PhotoGrid       | `pages/HostRoutes/components/EventGallery/PhotoGrid.tsx`     | Date-grouped photo grid      |
| PhotoLightbox   | `pages/HostRoutes/components/EventGallery/PhotoLightbox.tsx` | Full-screen viewer           |
| SimpleSlideshow | `components/slideshow_modes/SimpleSlideshow.tsx`             | Grid-based slideshow         |

## Performance Optimizations (Implemented)

### Image Loading (Optimized)

- **OptimizedImage component** (`components/ui/OptimizedImage.tsx`): Intersection Observer-based lazy loading with blur-up effect
- **Client-side compression** (`lib/imageUtils.ts`): Images compressed before upload (max 1920px, adaptive quality)
- **Memoized components**: PhotoCard, SlideshowImage wrapped in React.memo to prevent re-renders
- Images served via CloudFront CDN (cached at edge)

### Smart Polling System

- **Adaptive polling** (`hooks/usePhotoUpdates.ts`): Starts at 3s, slows to 15s when idle
- **New photo detection**: Highlights newly uploaded photos with animation
- **Efficient diffing**: Only updates state when photos actually change

### Upload Pipeline

- **S3 presigned URLs** (default): Direct upload to S3, bypasses backend bandwidth
- **Vercel Blob** (fallback): Can toggle via `USE_S3_UPLOAD` flag in `api.ts`
- **Pre-upload compression**: Reduces file size by 30-70%
- NSFW check compresses large images (>1MB)

### Storage Options

Toggle between S3 and Vercel Blob in `src/services/api.ts`:

```typescript
const USE_S3_UPLOAD = true; // true = S3 (cheaper), false = Vercel Blob
```

## AWS S3 Setup (For New Account)

### 1. Create S3 Bucket

- Bucket name: `spevents-photos`
- Region: `us-east-2`
- Uncheck "Block all public access"

### 2. Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontAccess",
      "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::spevents-photos/*"
    }
  ]
}
```

### 3. CORS Configuration

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "https://spevents.live",
      "https://app.spevents.live",
      "http://localhost:5173"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

### 4. IAM Policy for API User

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::spevents-photos",
        "arn:aws:s3:::spevents-photos/*"
      ]
    }
  ]
}
```

### 5. CloudFront Setup

- Origin: S3 bucket with OAC
- Cache policy: CachingOptimized
- Viewer protocol: Redirect HTTP to HTTPS

## Development

```bash
# Frontend (uses pnpm)
cd spevents-frontend
pnpm install
pnpm run dev          # Runs on localhost:5173

# Backend
cd spevents-backend
pnpm install
vercel dev           # Runs on localhost:3001
```

## Deployment

- **Frontend:** Vercel (automatic deploys from main branch)
- **Backend:** Vercel serverless functions
- **Domains:**
  - Frontend: spevents.live, app.spevents.live
  - Backend: api.spevents.live
