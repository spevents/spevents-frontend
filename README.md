<h1 align="center">
  <img src="./src/assets/dark-icon.svg" alt="Icon" width="100"/>
  <br>
  <a href="https://spevents.live/">spevents</a> - <i> real-time photo wall for guest photos</i>
</h1>

<p align="center">
  <a href="https://reactjs.org/" target="_blank"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"></a>
  <a href="https://www.typescriptlang.org/" target="_blank"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://tailwindcss.com/" target="_blank"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"></a>
  <a href="https://aws.amazon.com/s3/" target="_blank"><img src="https://img.shields.io/badge/AWS_S3-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white" alt="AWS S3"></a>
  <a href="https://vitejs.dev/" target="_blank"><img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://threejs.org/" target="_blank"><img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js"></a>
</p>

<p align="center">
  <img src="./src/assets/Grid.png" alt="Grid View" width="600"/>
  <img src="./src/assets/View.png" alt="Fun View" width="600"/>
</p>

<div align="center">
  A web-based photo sharing platform that lets event guests contribute to a real-time photo gallery - no app download needed.
</div>

## What is Spevents?

Spevents makes it easy to collect and display guest photos at live events. Guests simply:

1. Scan a QR code (no app download needed)
2. Take photos through their phone's browser
3. See their photos instantly appear on the venue's big screen

Both hosts and guests keep their photos - hosts get a complete event album, while guests keep digital mementos similar to photo booth strips.

### The Problem

Events have a "photo problem" - guests take lots of photos but sharing them is fragmented and happens after the event, when excitement has faded. Traditional solutions ask guests to upload photos to shared albums or cloud storage, which creates friction and delays sharing.

### Solution

- **Instant Sharing**: Photos appear on the venue screen moments after being taken
- **No Downloads**: Works entirely through the web browser
- **Simple Access**: Just scan a QR code to start
- **Multiple Display Modes**: Dynamic presentation options for different event types
- **Automatic Organization**: Photos are instantly stored and organized for hosts

## Progress & Traction

In three months (Nov 2024 - Jan 2025):

- Built and launched complete MVP
- Successfully demoed at events:
  - Roth n Roll (Dec 2024)
  - Holud Night (Jan 2025)
  - Mock Shaadi (Jan 2025)
  - Pohela Falgun (Feb 2025)

## Features

- **Camera Interface**: Mobile-optimized browser-based camera (WebRTC)
- **Photo Review**: Intuitive swipe-based photo management
- **Display Modes**:
  - Grid Gallery View
  - Dynamic Slideshow
  - Presenter Mode
  - Marquee / Parallax modes
  - 3D Model View
- **Real-time Updates**: Adaptive polling (3 s → 15 s when idle)
- **QR Integration**: Easy access and sharing
- **Scavenger Hunt**: Host-configurable photo challenge system
- **Collage Creation**: Built-in photo collage tools
- **NSFW Filtering**: Automatic content moderation via Hugging Face
- **AI Captions**: Claude-generated captions for photos
- **Secure Storage**: AWS S3 + CloudFront CDN

## Tech Stack

- **Frontend**: React 19 + TypeScript (Vite)
- **Styling**: Tailwind CSS + Framer Motion
- **3D Graphics**: Three.js with React Three Fiber
- **Storage**: AWS S3 + CloudFront CDN (or Vercel Blob)
- **Auth/DB**: Firebase Auth + Firestore
- **UI Primitives**: Radix UI

## Setup Requirements

- Node.js v18+
- pnpm (`npm i -g pnpm`)
- Firebase project
- AWS account with S3 bucket + CloudFront (or Vercel Blob token)

## Environment Variables

Create a `.env` file in the frontend root. **Never commit it.**

```env
VITE_BACKEND_URL=https://api.spevents.live
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_CLOUDFRONT_URL=https://your-distribution.cloudfront.net
VITE_BYPASS_AUTH=false
```

> **Security:** AWS credentials, GitHub tokens, and third-party API keys must
> NEVER use the `VITE_` prefix — they would be statically inlined into the
> browser bundle. All sensitive keys belong exclusively in the backend `.env`.

## Installation

1. Clone repository:

```bash
git clone https://github.com/yourusername/spevents.git
cd spevents-frontend
```

2. Install dependencies:

```bash
pnpm install
```

3. Start development server:

```bash
pnpm run dev
```

## Project Structure

```
src/
├── components/    # React components (auth, camera, slideshow_modes, ui, …)
├── contexts/      # EventContext, SessionContext, NgrokContext
├── hooks/         # usePhotoUpdates (adaptive polling), useDarkMode, …
├── lib/           # imageUtils, utils (clsx), paymentService (stub)
├── pages/
│   ├── guest/     # GuestLanding, GuestRoutes, ScavengerHuntPage
│   ├── HostRoutes/# Host dashboard, event management, gallery, metrics
│   └── landing/   # Public marketing page
├── services/
│   ├── api.ts     # Backend API client (event CRUD, photo upload, guest)
│   ├── nsfw.ts    # NSFW pre-check before upload
│   └── depthService.ts
└── types/         # TypeScript interfaces (event.ts, eventTypes.ts)
```

## Development Build

```bash
pnpm run build
```

## [LICENSE](LICENSE)
