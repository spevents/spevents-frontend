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
- **Framework:** Express.js (local dev routing only)
- **Database:** Firebase Firestore
- **Storage:** AWS S3 + CloudFront CDN (primary) or Vercel Blob (toggle via `USE_S3_UPLOAD` in `api.ts`)
- **AI Services:** Claude Sonnet (captions), Hugging Face (NSFW detection), Replicate (depth maps)

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
├── components/
│   ├── auth/            # AuthProvider (primary), RouteGuard, AuthGuard (legacy), SignInPage
│   ├── camera/          # CameraInterface (WebRTC), CameraControls, FlashControls, ZoomControl
│   ├── config/          # firebase.ts, routes.ts (domain detection)
│   ├── create-event/    # Multi-step event builder UI
│   ├── dashboard/       # Host dashboard widgets
│   ├── debug/           # SessionDebug (DEV only)
│   ├── guest/           # CollageCreator, GuestDashboard, FeedbackPage
│   ├── session/         # SessionValidator (guest session code validation)
│   ├── slideshow_modes/ # SimpleSlideshow, FunSlideshow, MarqueeSlideshow, ModelSlideshow,
│   │                    #   ParallaxSlideshow, PresenterSlideshow, HuntLeaderboard
│   ├── PhotoReview/     # Swipe-based photo approval/upload UI
│   ├── ui/              # Radix-based primitives + OptimizedImage
│   ├── CaptionGenerator.tsx
│   ├── DebugPanel.tsx   # DEV-only (gated by import.meta.env.DEV)
│   ├── DepthMapGenerator.tsx
│   ├── PhotoGallery.tsx
│   ├── PhotoSlideshow.tsx
│   ├── QRCodeModal.tsx
│   ├── Scene.tsx        # Three.js wrapper
│   └── VenueReconstruction.tsx
├── contexts/
│   ├── EventContext.tsx  # Host event CRUD (supports VITE_BYPASS_AUTH for local dev)
│   ├── NgrokContext.tsx
│   └── SessionContext.tsx # Guest session state
├── hooks/
│   ├── useDarkMode.ts
│   ├── useImageLoader.ts
│   ├── usePhotoUpdates.ts  # Adaptive polling (3s → 15s when idle)
│   ├── useSideBar.ts
│   └── useTheme.ts
├── lib/
│   ├── imageUtils.ts       # Client-side compression, blur placeholder
│   ├── paymentService.ts   # Stripe stub (NOT FUNCTIONAL — mock only)
│   ├── userService.ts      # Firestore user profiles (subscription limits not enforced yet)
│   └── utils.ts
├── pages/
│   ├── guest/              # GuestLanding, GuestRoutes, ScavengerHuntPage
│   ├── HostRoutes/         # Host dashboard, EventDashboard, EventGallery, LibraryPage,
│   │                       #   MetricsPage, ModelsPage, ThreeDBuilderPage, ScavengerHuntEditor,
│   │                       #   OnboardingPage, SetupGalleryPage, CommunityPage
│   └── landing/            # Public marketing landing page
├── services/
│   ├── api.ts              # Primary API client (USE_S3_UPLOAD toggle, VITE_BACKEND_URL)
│   ├── auth.ts             # Legacy AuthService class (not actively used)
│   ├── depthService.ts     # Depth estimation API calls
│   └── nsfw.ts             # NSFW check via backend
├── types/
│   ├── event.ts            # Primary type definitions
│   └── eventTypes.ts       # Extended/duplicate types (consolidation pending)
└── utils/
    └── ensureSessionCode.ts
```

### Backend (`/api`)

```
api/
├── events/
│   ├── index.ts           # CRUD /api/events (Firebase auth required)
│   └── session/[code].ts  # GET event by session code (public, active events only)
├── guest/event/index.ts   # GET event by session code (public, active events only)
├── photos/
│   ├── index.ts           # POST/DELETE /api/photos (presigned URL + delete)
│   ├── email.ts           # POST /api/photos/email (no auth, URL allowlist enforced)
│   └── [eventId]/
│       ├── all.ts         # GET all photos (Firebase auth required)
│       └── index.ts       # GET/DELETE photos (Firebase auth required)
├── upload.ts              # POST/GET S3 presigned URL (Firebase auth or session code)
├── upload-blob.ts         # POST/GET/DELETE Vercel Blob (Firebase auth or session code)
├── check-nsfw.ts          # POST NSFW detection (public, no rate limiting)
├── generate-caption.ts    # POST AI caption (Firebase auth OR INTERNAL_API_SECRET)
├── generate-captions-batch.ts  # POST batch captions (Firebase auth required)
├── depth-estimation.ts    # POST depth map (Firebase auth OR INTERNAL_API_SECRET)
├── depth-estimation-batch.ts   # POST batch depth (Firebase auth required)
├── generate-depth-maps.ts # POST batch depth from Firestore (Firebase auth required)
└── health.ts              # GET health check (public)
```

## Key Data Flows

### Photo Upload Flow

1. Guest captures photo via `CameraInterface` (WebRTC)
2. Photo stored temporarily in localStorage as data URL
3. `PhotoReview` component handles approval/deletion
4. NSFW check runs (compresses image, sends to `/api/check-nsfw`)
5. Backend returns presigned S3 URL (or Vercel Blob URL depending on `USE_S3_UPLOAD`)
6. Frontend uploads directly to S3 / Vercel Blob
7. Photo URL stored in Firestore

### Photo Display Flow

1. Frontend fetches photo list from `/api/upload?eventId=X` (S3) or `/api/upload-blob?eventId=X` (Blob)
2. Photos served via CloudFront CDN URLs
3. `OptimizedImage` component uses Intersection Observer for lazy loading
4. `usePhotoUpdates` polls adaptively (3s → 15s when idle)

### Guest Access Flow

1. Host shares 6-character session code
2. Guest accesses via session code (no auth required)
3. `SessionValidator` calls `/api/guest/event?sessionCode=XXX`
4. Backend validates code against **active** events only
5. Guest can upload/view photos for that event

## API Endpoints

| Endpoint                           | Method | Purpose                   | Auth                        |
| ---------------------------------- | ------ | ------------------------- | --------------------------- |
| `/api/events`                      | CRUD   | Event management          | Firebase Token              |
| `/api/events/session/[code]`       | GET    | Event by session code     | Public (active events only) |
| `/api/guest/event?sessionCode=XXX` | GET    | Event by session code     | Public (active events only) |
| `/api/photos`                      | POST   | Presigned URL + delete    | Token or Session Code       |
| `/api/photos/[eventId]/all`        | GET    | List all event photos     | Firebase Token              |
| `/api/photos/email`                | POST   | Email photos to guest     | Public (URL allowlist)      |
| `/api/upload`                      | POST   | S3 presigned URL          | Token or Session Code       |
| `/api/upload-blob`                 | POST   | Vercel Blob upload        | Token or Session Code       |
| `/api/check-nsfw`                  | POST   | NSFW content detection    | Public                      |
| `/api/generate-caption`            | POST   | AI caption (single)       | Firebase Token or Internal  |
| `/api/generate-captions-batch`     | POST   | AI captions (batch)       | Firebase Token              |
| `/api/depth-estimation`            | POST   | Depth map (single)        | Firebase Token or Internal  |
| `/api/depth-estimation-batch`      | POST   | Depth maps (batch)        | Firebase Token              |
| `/api/generate-depth-maps`         | POST   | Depth maps from Firestore | Firebase Token              |
| `/api/health`                      | GET    | Health check              | Public                      |

## Environment Variables

### Frontend (`.env`)

```env
VITE_BACKEND_URL=https://api.spevents.live
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=spevents-896f7.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=spevents-896f7
VITE_CLOUDFRONT_URL=https://d3boq06xf0z9b1.cloudfront.net
VITE_BYPASS_AUTH=false   # DEV only — never set to true in production
```

> **Security note:** AWS credentials, GitHub tokens, and API keys must NEVER be
> declared as `VITE_*` variables. Those prefixes are statically inlined into the
> browser bundle and visible to anyone in DevTools.

### Backend (`.env`)

```env
FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME
CLOUDFRONT_URL
BLOB_READ_WRITE_TOKEN
ANTHROPIC_API_KEY, HUGGING_FACE_API_KEY, REPLICATE_API_TOKEN
RESEND_API_KEY
INTERNAL_API_SECRET   # Used by batch endpoints to call single AI endpoints
NODE_ENV
```

## Key Components

| Component           | File                                                         | Purpose                         |
| ------------------- | ------------------------------------------------------------ | ------------------------------- |
| CameraInterface     | `components/camera/CameraInterface.tsx`                      | WebRTC camera capture           |
| PhotoReview         | `components/PhotoReview/PhotoReview.tsx`                     | Swipe-based photo approval      |
| PhotoGallery        | `components/PhotoGallery.tsx`                                | Grid gallery with adaptive poll |
| PhotoGrid           | `pages/HostRoutes/components/EventGallery/PhotoGrid.tsx`     | Date-grouped photo grid         |
| PhotoLightbox       | `pages/HostRoutes/components/EventGallery/PhotoLightbox.tsx` | Full-screen viewer              |
| SimpleSlideshow     | `components/slideshow_modes/SimpleSlideshow.tsx`             | Grid-based slideshow            |
| ScavengerHuntPage   | `pages/guest/ScavengerHuntPage.tsx`                          | Guest scavenger hunt flow       |
| ScavengerHuntEditor | `pages/HostRoutes/ScavengerHuntEditor.tsx`                   | Host hunt editor                |

## Performance Optimizations (Implemented)

### Image Loading

- **OptimizedImage** (`components/ui/OptimizedImage.tsx`): Intersection Observer-based lazy loading with blur-up effect
- **Client-side compression** (`lib/imageUtils.ts`): Images compressed before upload (max 1920px, adaptive quality)
- **Memoized components**: PhotoCard wrapped in `React.memo`
- Images served via CloudFront CDN

### Smart Polling

- **Adaptive polling** (`hooks/usePhotoUpdates.ts`): Starts at 3s, slows to 15s when idle
- **New photo detection**: Highlights newly uploaded photos with animation
- **Efficient diffing**: Only updates state when photos actually change

### Upload Pipeline

Toggle between S3 and Vercel Blob in `src/services/api.ts`:

```typescript
const USE_S3_UPLOAD = false; // false = Vercel Blob (current default), true = S3
```

- **S3 presigned URLs**: Direct upload to S3, bypasses backend bandwidth (cheaper)
- **Vercel Blob**: Simpler but more expensive
- **Pre-upload compression**: Reduces file size 30–70%

## Known Technical Debt

- `services/auth.ts` — legacy class-based AuthService, superseded by `AuthProvider.tsx`, can be removed
- `types/event.ts` and `types/eventTypes.ts` — duplicate type definitions, needs consolidation
- `lib/paymentService.ts` — entire file is mock/stub, Stripe not wired up
- `lib/userService.ts` — `getCurrentMonthEventCount` and `getEventPhotoCount` always return 0 (subscription limits not enforced)
- `eventService.getEventBySessionCode()` in `api.ts` queries Firestore directly from frontend; `guestService.getEventBySessionCode()` goes through the backend API — inconsistent, should use backend only
- `DebugPanel.tsx` is gated by `import.meta.env.DEV` and won't render in production builds

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
vercel dev            # Runs on localhost:3001
```

## Deployment

- **Frontend:** Vercel (automatic deploys from main branch)
- **Backend:** Vercel serverless functions
- **Domains:**
  - Frontend: spevents.live, app.spevents.live
  - Backend: api.spevents.live

## Post-Deploy Checklist

1. Set `INTERNAL_API_SECRET` in Vercel backend environment variables (run `openssl rand -hex 32`)
2. Confirm `VITE_BYPASS_AUTH` is NOT set (or is `false`) in Vercel frontend env
3. Confirm no `VITE_AWS_*`, `VITE_GITHUB_TOKEN`, or `VITE_HUGGING_FACE_*` variables exist in Vercel frontend env
