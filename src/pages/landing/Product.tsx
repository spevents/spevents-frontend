import { Navigation } from './Navigation';
import { ChevronRight } from 'lucide-react';

export function ProductPage() {
  return (
    <div className="min-h-screen bg-timberwolf">
      <Navigation />
      
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-16 text-brunswick-green">
            Choose Your Perfect Plan
          </h1>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Basic",
                price: "75",
                features: [
                  "Up to 100 guests",
                  "3D venue visualization",
                  "Real-time photo sharing",
                  "24-hour gallery access"
                ]
              },
              {
                name: "Premium",
                price: "149",
                features: [
                  "Up to 250 guests",
                  "Custom venue modeling",
                  "Priority support",
                  "7-day gallery access"
                ]
              },
              {
                name: "Enterprise",
                price: "299",
                features: [
                  "Unlimited guests",
                  "Multiple venue support",
                  "Dedicated account manager",
                  "30-day gallery access"
                ]
              }
            ].map((plan, index) => (
              <div 
                key={index} 
                className="p-8 rounded-xl bg-white/50 backdrop-blur-sm border border-sage
                  hover:border-fern-green transition-colors"
              >
                <h3 className="text-2xl font-semibold mb-2 text-brunswick-green">
                  {plan.name}
                </h3>
                <div className="text-4xl font-bold mb-6 text-hunter-green">
                  ${plan.price}
                  <span className="text-lg text-sage font-normal">/event</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <ChevronRight className="w-5 h-5 text-fern-green mr-2" />
                      <span className="text-hunter-green">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  className="w-full py-3 bg-fern-green text-white rounded-full 
                    hover:bg-hunter-green transition-colors"
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}