<h1 align="center">
  <img src="./src/assets/dark-icon.svg" alt="Icon" width="100"/>
  <br>
  <a href="https://spevents.github.io/">Spevents</a> – Real-time Event Photo Sharing
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

### Our Solution

- **Instant Sharing**: Photos appear on the venue screen moments after being taken
- **No Downloads**: Works entirely through the web browser
- **Simple Access**: Just scan a QR code to start
- **Multiple Display Modes**: Dynamic presentation options for different event types
- **Automatic Organization**: Photos are instantly stored and organized for hosts

## Market Size

- Weddings: $3.4B market in US (2024), with 2.2M weddings annually
- Corporate Events/Conferences: $1.1T market globally, 1.8M events annually in US
- University Events: 4,000 colleges hosting ~50 major events each annually
- Social Events: 18-35 age demographic, estimated 500K events annually

## Progress & Traction

In three months (Nov 2024 - Jan 2025), I've:

- Built and launched complete MVP
- Successfully demoed at 3 events:
  - Roth n Roll (Dec 2024)
  - Holud Night (Jan 2025)
  - Mock Shaadi (Jan 2025)
  - ... more upcoming

## Features

- **Camera Interface**: Mobile-optimized browser-based camera
- **Photo Review**: Intuitive swipe-based photo management
- **Display Modes**:
  - Grid Gallery View
  - Dynamic Slideshow
  - Presenter Mode
  - 3D Model View
- **Real-time Updates**: Instant photo synchronization
- **QR Integration**: Easy access and sharing
- **Collage Creation**: Built-in photo collage tools
- **Secure Storage**: AWS-powered photo management

## Tech Stack

- **Frontend**: React (TypeScript)
- **Styling**: Tailwind CSS
- **3D Graphics**: Three.js with React Three Fiber
- **Storage**: AWS S3
- **CDN**: CloudFront
- **Build Tool**: Vite

## Setup Requirements

- Node.js (v16+)
- AWS account with S3 bucket
- SSL certificate for local development

## Environment Variables

```env
VITE_AWS_REGION=
VITE_S3_BUCKET_NAME=
VITE_CLOUDFRONT_URL=
VITE_AWS_ACCESS_KEY_ID=
VITE_AWS_SECRET_ACCESS_KEY=
VITE_EVENT_ID=
```

## Installation

1. Clone repository:

```bash
git clone https://github.com/yourusername/spevents.git
cd spevents
```

2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

## Project Structure

```
/src
  /components    # React components
  /contexts      # Context providers
  /lib           # AWS integration & utilities
  /pages         # Route components
```

## Development

To create a production build:

```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push branch (`git push origin feature/NewFeature`)
5. Open Pull Request

## Team

Solo technical founder:

- CS + MATH at Vanderbilt University
- Managing all aspects: development, marketing, and customer relations

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE](LICENSE) file for details.

This means:

- You can view and use the code
- You must disclose source code of any modifications
- You must state any significant changes made
- You must preserve original copyright and license notices
- If you distribute or provide network access to modified versions, you must share your modifications under the same license
