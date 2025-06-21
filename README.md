<h1 align="center">
  <img src="./src/assets/dark-icon.svg" alt="Icon" width="100"/>
  <br>
  <a href="https://spevents.live/">spevents</a> - <i> gather and display guest photos in real-time </i>
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

In three months (Nov 2024 - Jan 2025), I've:

- Built and launched complete MVP
- Successfully demoed at 3 events:
  - Roth n Roll (Dec 2024)
  - Holud Night (Jan 2025)
  - Mock Shaadi (Jan 2025)
  - Pohela Falgun (Feb 2025)
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
- This is a commit



---
# Spevents Development Checklist

## Phase 1: Market Validation (Weeks 1-4)
**Goal: Prove demand before building anything new**

### Modify MVP
- [ ] Fix MVP to be the actual bare minimum; remove uneeded parts to just keep core functionality of photo wall, and photo sharing / downloading capability, and feedback built-in.
      
### Market Research
- [ ] Contact 20 event planners via LinkedIn/cold calls
- [ ] Ask: "What's your biggest event photo headache?"
- [ ] Ask: "Would you pay $99 to solve it?"
- [ ] Ask: "What features matter most to you?"
- [ ] Document exact pain points mentioned
- [ ] Identify most common problem (appears in 50%+ of responses)

### Revenue Validation
- [ ] Offer current Spevents to 5 events for $99
- [ ] Track yes/no responses
- [ ] Document objections for "no" responses
- [ ] Get 2+ paying customers using current system
- [ ] Measure actual usage vs promised usage

### Phase 1 Success Criteria
- [ ] Completed 20+ customer interviews
- [ ] Secured 2+ paying customers ($198+ revenue)
- [ ] Identified top customer pain point
- [ ] **CHECKPOINT: Only proceed if you have paying customers**

## Phase 2: Focus Selection (Weeks 5-8)
**Goal: Choose ONE direction based on customer feedback**

### Choose Your Path (pick only one)
- [ ] **Option A: Enhanced Photo Wall** (if customers want better display)
- [ ] **Option B: Event Management** (if customers want easier setup)
- [ ] **Option C: Premium Display** (only if specifically requested)

### Detailed Planning for Chosen Option
- [ ] Define exact feature scope (1-2 features max)
- [ ] Create simple wireframes/mockups
- [ ] Validate chosen direction with existing customers
- [ ] Estimate development timeline (4 weeks max)

## Phase 3: MVP Development (Weeks 9-12)
**Goal: Build ONE core feature customers requested**

### Option A: Enhanced Photo Wall
- [ ] Improved photo quality filtering
- [ ] Custom branding overlays
- [ ] Basic event analytics dashboard
- [ ] Simple RSVP integration

### Option B: Event Management
- [ ] Streamlined RSVP system
- [ ] Guest communication tools
- [ ] Event dashboard
- [ ] Photo wall as secondary feature

### Option C: Premium Display
- [ ] Preset 3D environments (no scanning)
- [ ] Manual photo placement
- [ ] Enhanced visual effects

### Testing & Iteration
- [ ] Test with existing paying customers
- [ ] Measure feature usage rates
- [ ] Document customer satisfaction changes
- [ ] Get feedback on pricing for new features

### Phase 3 Success Criteria
- [ ] New feature built and deployed
- [ ] 80%+ of paying customers use new feature within 30 days
- [ ] Customers willing to pay more for enhanced version
- [ ] $1,000+ MRR achieved

## Phase 4: Scale (Week 13+)
**Goal: Only proceed if Phase 3 metrics are hit**

- [ ] Identify next highest-priority customer pain point
- [ ] Build ONE additional feature based on data
- [ ] Expand customer base using proven value proposition
- [ ] Document repeatable sales process

## ONLY BUILD IF WE BALLIN!!!!!
- [ ] 3D venue scanning  
- [ ] Indoor GPS positioning
- [ ] AI content moderation
- [ ] Canva competitor for designing venue
- [ ] Timeline/presentation tools  

## Current Status
- [ ] Phase 1 Complete
- [ ] Phase 2 Complete  
- [ ] Phase 3 Complete
- [ ] Phase 4 In Progress
- [ ] Phase Only if we Ballin

## Key Metrics Tracking
- **Revenue:** $___/month
- **Paying Customers:** ___
- **Feature Usage Rate:** ___%
- **Customer Satisfaction:** ___/10


