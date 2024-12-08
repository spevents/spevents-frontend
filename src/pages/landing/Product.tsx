import { useState } from 'react';
import { Navigation } from './Navigation';
import { ChevronRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Footer } from '../../components/Footer';

// AWS S3 pricing constants (US East Ohio)
const S3_PRICING = {
  STORAGE_PER_GB: 0.023,
  PUT_REQUEST_PER_1K: 0.005,
  GET_REQUEST_PER_1K: 0.0004,
  DATA_TRANSFER_PER_GB: 0.09
};

const calculateStorageCost = (guests: number, photosPerGuest: number) => {
  const AVG_PHOTO_SIZE_MB = 2;
  const totalStorageGB = (guests * photosPerGuest * AVG_PHOTO_SIZE_MB) / 1024;
  const storageCost = totalStorageGB * S3_PRICING.STORAGE_PER_GB;
  
  const totalPhotos = guests * photosPerGuest;
  const putRequestCost = (totalPhotos / 1000) * S3_PRICING.PUT_REQUEST_PER_1K;
  const getRequestCost = (totalPhotos * 3 / 1000) * S3_PRICING.GET_REQUEST_PER_1K;
  const transferCost = totalStorageGB * 3 * S3_PRICING.DATA_TRANSFER_PER_GB;
  
  const baseFee = 49; // Increased base fee
  const operationalCosts = storageCost + putRequestCost + getRequestCost + transferCost;
  
  // Increased margin multiplier (3x instead of previous margin)
  return Math.ceil((baseFee + operationalCosts) * 3);
};

const PricingSlider = ({ 
  value, 
  onChange, 
  min, 
  max, 
  label, 
  step = 1 
}: { 
  value: number; 
  onChange: (value: number) => void; 
  min: number; 
  max: number; 
  label: string; 
  step?: number; 
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <label className="text-hunter-green font-medium">{label}</label>
        <span className="text-fern-green font-semibold">{value}</span>
      </div>
      <div className="relative h-6 flex items-center">
        {/* Track background */}
        <div className="absolute w-full h-2 bg-sage/20 rounded-full" />
        
        {/* Active track */}
        <div 
          className="absolute h-2 bg-fern-green rounded-full"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Thumb */}
        <div 
          className="absolute w-6 h-6 bg-white border-2 border-fern-green rounded-full shadow-lg transform -translate-x-1/2 hover:scale-110 transition-transform"
          style={{ left: `${percentage}%` }}
        >
          {/* Focus ring */}
          <div className="absolute inset-0 rounded-full bg-fern-green opacity-0 hover:opacity-10 transition-opacity" />
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute w-full h-6 opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-sage">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export function ProductPage() {
  const [guests, setGuests] = useState(100);
  const [photosPerGuest, setPhotosPerGuest] = useState(5);

  const currentPrice = calculateStorageCost(guests, photosPerGuest);

  const InfoTooltip = ({ content }: { content: string }) => (
    <div className="group relative inline-block ml-2">
      <Info className="w-4 h-4 text-sage inline-block cursor-help" />
      <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-brunswick-green text-white text-xs rounded-lg shadow-lg">
        {content}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-brunswick-green" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-timberwolf">
      <Navigation />
      
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-16 text-brunswick-green">
            Simple, Usage-Based Pricing
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-8 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-sage shadow-lg"
            >
              <div className="flex items-baseline justify-between mb-6">
                <h3 className="text-2xl font-semibold text-brunswick-green">Basic</h3>
                <div>
                  <span className="text-4xl font-bold text-hunter-green">Free</span>
                  <span className="text-sage">/event</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {[
                  "Up to 100 guests",
                  "3D venue visualization",
                  "24-hour gallery access",
                  "5 photos per guest"
                ].map((feature) => (
                  <li key={feature} className="flex items-center">
                    <ChevronRight className="w-5 h-5 text-fern-green flex-shrink-0" />
                    <span className="text-hunter-green ml-2">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-fern-green text-white rounded-full font-medium
                  hover:bg-hunter-green transition-colors"
              >
                Start Free
              </motion.button>
            </motion.div>

            {/* Premium Tier */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-8 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-fern-green shadow-lg"
            >
              <div className="flex items-baseline justify-between mb-6">
                <h3 className="text-2xl font-semibold text-brunswick-green">Premium</h3>
                <div>
                  <span className="text-4xl font-bold text-fern-green">${currentPrice}</span>
                  <span className="text-sage">/event</span>
                  <InfoTooltip content="Price includes storage, transfer, and platform costs. Pay only for what you use." />
                </div>
              </div>

              <PricingSlider
                label="Number of Guests"
                value={guests}
                onChange={setGuests}
                min={50}
                max={1000}
                step={10}
              />

              <PricingSlider
                label="Photos per Guest"
                value={photosPerGuest}
                onChange={setPhotosPerGuest}
                min={1}
                max={20}
              />

              <ul className="space-y-4 mb-8">
                {[
                  "Unlimited photos (pay for what you use)",
                  "7-day gallery access",
                  "Custom venue modeling",
                  "Priority support",
                  "High-resolution downloads"
                ].map((feature) => (
                  <li key={feature} className="flex items-center">
                    <ChevronRight className="w-5 h-5 text-fern-green flex-shrink-0" />
                    <span className="text-hunter-green ml-2">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-fern-green text-white rounded-full font-medium
                  hover:bg-hunter-green transition-colors"
              >
                Get Started
              </motion.button>
            </motion.div>
          </div>

          {/* Enterprise Tier */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="mt-8 p-6 rounded-2xl bg-brunswick-green/10 backdrop-blur-sm border border-brunswick-green"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-brunswick-green">Enterprise</h3>
                <p className="text-hunter-green mt-2">Need a custom solution? Let's talk about your specific needs.</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-brunswick-green text-white rounded-full font-medium
                  hover:bg-hunter-green transition-colors"
              >
                Contact Sales
              </motion.button>
            </div>
          </motion.div>

          <p className="mt-12 text-center text-sm text-sage">
            All plans include secure photo storage, real-time updates, and our core features.
            <br />
            Enterprise plans available for venues, planners, and large organizations.
          </p>
        </div>
      </section>
      <Footer />
    
    </div>
  );
}