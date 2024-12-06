# Spevents: Making Every Event Unforgettable

## Pitch
#### What is Spevents?
Spevents is a QR-based photo sharing platform that lets event guests contribute to a real-time 3D photo gallery without downloading an app.

#### Problem
At weddings and events, guests are constantly switching between enjoying moments and trying to capture them. Traditional solutions like hashtags scatter photos across platforms, while "upload your photos" websites get low engagement. Custom event apps have high friction and low adoption.

#### Solution
Guests scan a QR code at their table, take photos through our web interface, and swipe up to share. Photos instantly appear in a 3D visualization of the venue that's displayed during the event. No app downloads, no accounts, no friction.

#### Market
$70B wedding industry in the US, with 2.2M weddings annually. Initial focus on Vanderbilt University's 350+ reservable venues and Nashville's wedding market.

#### Traction
- Launching at Mock Shaadi wedding event with 300 guests in partnership with 3 cultural organizations
- Pre-launch interest from --

#### Business Model
- Free tier for small events (up to 100 guests)
- Premium tier with usage-based pricing ($29 base + storage costs)
- Enterprise plans for venues and event planners
- Infrastructure costs tied directly to AWS usage
- 70% margins after cloud storage and processing costs

#### Team
Solo founder with CS/Math background + event planning experience. Built venue management systems and organized multiple cultural events.

#### Ask
Looking for $500K to expand venue partnerships and develop premium features. Currently have $50K committed from angel investors.

## 🌟 Features
- **No App Download Required**: Access via QR code scanning
- **Real-Time Photo Gallery**: Instantly share photos during events
- **Interactive 3D Venue View**: See photos in context of the venue
- **Swipe-to-Share**: Intuitive iOS-style photo sharing interface
- **Live Slideshow**: Dynamic photo display during the event
- **Multi-device Support**: Works on any modern mobile device
- **Instant Upload**: Photos appear in real-time in the gallery
- **Collaborative Experience**: Everyone contributes to the event's memories

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account for photo storage
- HTTPS cert for local development (handled by vite-plugin-mkcert)

### Environment Variables
Create a `.env` file with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/spevents.git
cd spevents
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

The app will be running at `https://localhost:5173`

## 📱 Usage Guide

### For Event Organizers
1. Access the venue view
2. Share QR codes with event guests
3. Monitor the live photo gallery and slideshow
4. Manage uploaded photos in real-time

### For Guests
1. Scan event QR code
2. Take photos through the web interface
3. Swipe up to share to gallery
4. View all contributions in the 3D venue view

## 💻 Tech Stack
- React 18 with TypeScript
- Vite for development
- Tailwind CSS for styling
- Framer Motion for animations
- Three.js for 3D venue visualization
- React Router for navigation
- Supabase for photo storage

## 🔧 Development Notes
- HTTPS required for camera access
- Uses Supabase for scalable photo storage
- Mobile-first responsive design
- Optimized for modern browsers

## 🚀 Deployment
Local Testing with ngrok:
1. Run `npm run dev`
2. In a new terminal: `ngrok http https://localhost:5173`
3. Update QR code URL with ngrok URL

## 🌐 Browser Support
- Chrome (recommended for best experience)
- Safari
- Firefox
- Edge