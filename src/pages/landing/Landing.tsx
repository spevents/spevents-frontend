import { Link } from 'react-router-dom';
import { Camera, Users, LineChart } from 'lucide-react';
import { Navigation } from './Navigation';


export function LandingPage() {
  return (
    <div className="min-h-screen bg-timberwolf">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-brunswick-green">
              Making Every Event Unforgettable
            </h1>
            <p className="text-xl text-hunter-green mb-8 max-w-2xl mx-auto">
              Capture and share every moment in real-time with our innovative 3D photo gallery system.
              No apps required, just pure engagement.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/venue" 
                className="px-8 py-3 bg-fern-green text-white rounded-full 
                  hover:bg-hunter-green transition-colors"
              >
                Try Demo
              </Link>
              <Link 
                to="/product" 
                className="px-8 py-3 border border-sage rounded-full 
                  hover:border-fern-green hover:text-fern-green transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: Users,
                title: "Guest Engagement",
                description: "Keep guests present and connected while capturing every moment"
              },
              {
                icon: Camera,
                title: "Real-time Gallery",
                description: "Photos appear instantly in a 3D venue visualization"
              },
              {
                icon: LineChart,
                title: "Easy Setup",
                description: "No app downloads required, just scan and capture"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-sage
                  hover:border-fern-green transition-colors"
              >
                <feature.icon className="w-12 h-12 text-fern-green mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-brunswick-green">
                  {feature.title}
                </h3>
                <p className="text-hunter-green">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}