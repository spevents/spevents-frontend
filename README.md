# Spevents: Making Every Event Unforgettable
A modern, real-time photo sharing platform for events that keeps guests engaged and preserves memories seamlessly.

## 🌟 Features
- **No App Download Required**: Access via QR code scanning
- **Real-Time Photo Gallery**: Instantly share photos during events
- **Interactive 3D Venue View**: See photos in context of the venue
- **Swipe-to-Share**: Intuitive iOS-style photo sharing interface
- **Collaborative Photo Collection**: Everyone contributes to the event's memories

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Modern web browser

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

The app will be running at `http://localhost:5173`

## 📱 How to Use

### For Event Organizers
1. Navigate to the main venue page
2. Share the QR code with event guests
3. Watch as photos populate the 3D venue view

### For Guests
1. Scan the event's QR code with your phone
2. Take photos through the web interface
3. Swipe up on photos to add them to the event gallery
4. View all contributions in the gallery view

## 💻 Tech Stack
- React with TypeScript
- Vite for blazing fast development
- Tailwind CSS for styling
- Framer Motion for animations
- Three.js for 3D venue visualization
- React Router for navigation

## 📝 Development Notes
- The project uses modern ES6+ features
- Runs on HTTPS for camera access
- Optimized for mobile devices
- Uses local storage for photo management

## 🔒 Privacy
- Photos are stored locally
- No server-side storage implemented yet
- All processing happens on the client side

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

## 📄 License
[MIT](https://choosealicense.com/licenses/mit/)

## 🌐 Browser Support
- Chrome (recommended)
- Safari
- Firefox
- Edge

For the best experience, use the latest version of Chrome on mobile devices.



Good info for now:
-[ ] https://www.youtube.com/watch?v=96YcViCGlRo
-[ ] https://www.youtube.com/results?search_query=typescript+react+wesocket+
-[] https://socket.io/


Steps for local hoster:
1. npm run dev
2. open localhost
3. open another terminal, run command 
`ngrok http https://localhost:5173`
4. go to qr code, update url with free ngrok app url
5. qr scanning should work anywhere for anyone


Announcements to display
* 