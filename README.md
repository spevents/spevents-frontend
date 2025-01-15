<h1 align="center">
  <img src="./src/assets/dark-icon.svg" alt="Icon" width="100"/>
  <br>
  <a href="https://spevents.github.io/">Spevents</a> – Fast & Easy Photo Sharing and Projecting
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
  A QR-based photo sharing platform that lets event guests contribute to a real-time 3D photo gallery without downloading an app.
</div>
<br>

## What is Spevents?
Spevents (special + events) is a real-time photo sharing platform that turns guests' phones into a live photo gallery without an app - just scan the host’s QR code and swipe up to share.

### The Problem
At weddings and events, guests are constantly switching between enjoying moments and trying to capture them. Traditional solutions like hashtags scatter photos across platforms, while "upload your photos" websites get low engagement. Custom event apps have high friction and low adoption.

### Our Solution
- **Instant Access**: Just scan a QR code - no apps, no accounts
- **Real-time Sharing**: Photos appear instantly in the venue visualization
- **Interactive Display**: 3D venue visualization creates an engaging experience
- **Frictionless Experience**: Designed for maximum guest participation

## Market & Traction

- Targeting the $70B wedding industry in the US (2.2M weddings annually)
- Initial focus on Vanderbilt University's 350+ reservable venues and Nashville's wedding market
- Launching at Mock Shaadi wedding event with 300 guests in partnership with 3 cultural organizations

## Business Model

- **Free Tier**: Small events (up to 100 guests)
- **Premium Tier**: $29 base + usage-based storage costs
- **Enterprise Plans**: Custom solutions for venues and event planners
- Infrastructure costs tied directly to AWS usage
- 70% margins after cloud storage and processing costs

## Technical Features

- **Real-time Photo Capture**: Take photos directly through the web interface
- **Interactive Photo Review**: Swipe-based review system for quick photo management
- **Multiple Display Modes**:
  - Grid Gallery View
  - Fun Slideshow with dynamic photo arrangements
  - Presenter Mode for organized photo displays
  - 3D Model View with interactive scene
- **QR Code Integration**: Easy sharing and access via QR codes
- **Responsive Design**: Works seamlessly on both mobile and desktop devices
- **AWS Integration**: Secure photo storage using S3
- **Guest Management**: Dedicated guest interface for photo contributions

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **3D Rendering**: Three.js with React Three Fiber
- **Storage**: AWS S3
- **Build Tool**: Vite
- **Additional Libraries**:
  - `@react-three/drei` for 3D scene management
  - `lucide-react` for icons
  - `qrcode` for QR code generation
  - `react-swipeable` for touch interactions

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- AWS account with S3 bucket configured
- SSL certificate for local development (using mkcert)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_AWS_REGION=your_aws_region
VITE_S3_BUCKET_NAME=your_bucket_name
VITE_AWS_ACCESS_KEY_ID=your_access_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key
VITE_CLOUDFRONT_URL=your_cloudfront_url
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/spevents.git
cd spevents
```

2. Install dependencies:
```bash
npm install
```

3. Setup SSL certificate for local development:
```bash
npm install -g mkcert
mkcert create-ca
mkcert create-cert
```

4. Start the development server:
```bash
npm run dev
```

## Build

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

The application is configured for static hosting. Deploy the contents of the `dist` directory to your preferred hosting service.

### Routing

The application uses client-side routing. Ensure your hosting service is configured to redirect all requests to `index.html`. A `static.json` configuration is included for platforms like Heroku.

## Project Structure

- `/src`
  - `/components` - Reusable React components
  - `/contexts` - React context providers
  - `/lib` - Utility functions and AWS integration
  - `/pages` - Main route components
  - `/layouts` - Page layout components
  - `/utils` - Helper functions

## Development

### Code Style

The project uses ESLint and TypeScript for code quality. Run the linter with:

```bash
npm run lint
```

### Testing

To add tests, create files with `.test.tsx` extension alongside your components.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Team

Solo founder with CS/Math background + event planning experience. Built venue management systems and organized multiple cultural events.
