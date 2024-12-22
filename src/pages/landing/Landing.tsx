import {
  Camera,
  Users,
  CalendarCheck,
  GalleryVerticalEnd,
  LineChart,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navigation } from "./Navigation";
import { Footer } from "../../components/Footer";
import Lenis from "@studio-freight/lenis";
import { useEffect } from "react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export function LandingPage() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.5,
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const pricingTiers = [
    {
      name: "Free",
      price: "0",
      features: [
        "Up to 100 photos",
        "Basic gallery view",
        "24-hour photo access",
        "Single event",
      ],
    },
    {
      name: "Premium",
      price: "29",
      features: [
        "Unlimited photos",
        "3D venue visualization",
        "Lifetime photo access",
        "Multiple events",
        "Priority support",
        "Custom branding",
      ],
    },
    {
      name: "Enterprise",
      price: "Contact us",
      features: [
        "Everything in Premium",
        "Dedicated support",
        "Custom integrations",
        "API access",
        "SLA guarantee",
        "Volume discounts",
      ],
    },
  ];

  const examples = [
    {
      title: "Weddings",
      description:
        "Capture precious moments from multiple angles as guests celebrate your special day.",
      image: "/api/placeholder/600/400",
    },
    {
      title: "Corporate Events",
      description:
        "Keep everyone engaged while creating a shared photo collection of team activities.",
      image: "/api/placeholder/600/400",
    },
    {
      title: "Celebrations",
      description:
        "From birthdays to anniversaries, preserve memories from every perspective.",
      image: "/api/placeholder/600/400",
    },
  ];

  return (
    <div className="min-h-screen bg-timberwolf flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="relative flex-grow pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial="initial"
            animate="animate"
            variants={fadeIn}
          >
            <motion.h1
              className="text-5xl md:text-6xl font-bold mb-6 text-brunswick-green"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Easy Guest Photo Curation
            </motion.h1>
            <motion.p
              className="text-xl text-hunter-green mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Real-time guest photo collection. Just scan a QR code and swipe up
              to submit photos. No apps required.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              {/* Buttons Container */}
              <motion.div
                className="container mx-auto max-w-6xl text-center space-y-4 space-x-10"
                initial={{ opacity: 1, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                {/* Book Demo Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block"
                >
                  <Link
                    to="https://calendly.com/spevents-party/30min"
                    className="group inline-flex h-12 items-center gap-2 rounded-full bg-sage/20 px-4 
        transition-all duration-300 ease-in-out hover:bg-brunswick-green hover:text-white"
                  >
                    <span
                      className="rounded-full bg-brunswick-green p-2 text-white transition-colors duration-300 
          group-hover:bg-white group-hover:text-brunswick-green"
                    >
                      <CalendarCheck className="h-4 w-4" />
                    </span>
                    <span className="text-lg font-black text-brunswick-green hover:text-white transition-colors duration-300">
                      Book Demo
                    </span>
                  </Link>
                </motion.div>

                {/* See Examples Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block"
                >
                  <Link
                    to="/examples"
                    className="group inline-flex h-12 items-center gap-2 rounded-full bg-sage/20 px-4 
        transition-all duration-300 ease-in-out hover:bg-brunswick-green hover:text-white"
                  >
                    <span
                      className="rounded-full bg-brunswick-green p-2 text-white transition-colors duration-300 
          group-hover:bg-white group-hover:text-brunswick-green"
                    >
                      <GalleryVerticalEnd className="h-4 w-4" />
                    </span>
                    <span className="text-lg font-black text-brunswick-green hover:text-white transition-colors duration-300">
                      See Examples
                    </span>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-8 h-8 text-brunswick-green opacity-50" />
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: Users,
                title: "Guest Engagement",
                description:
                  "Keep guests present and connected while capturing every moment",
              },
              {
                icon: Camera,
                title: "Real-time Gallery",
                description:
                  "Photos appear instantly in a 3D venue visualization",
              },
              {
                icon: LineChart,
                title: "Easy Setup",
                description: "No app downloads required, just scan and capture",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-sage
                  hover:border-fern-green transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <feature.icon className="w-12 h-12 text-fern-green mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-brunswick-green">
                  {feature.title}
                </h3>
                <p className="text-hunter-green">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section id="examples" className="py-20 px-6 bg-hunter-green/5">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4 text-brunswick-green">
              Real Events, Real Memories
            </h2>
            <p className="text-lg text-hunter-green max-w-2xl mx-auto">
              See how Spevents transforms photo sharing across different types
              of events
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {examples.map((example, index) => (
              <motion.div
                key={index}
                className="rounded-xl overflow-hidden bg-white shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <img
                  src={example.image}
                  alt={example.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-brunswick-green">
                    {example.title}
                  </h3>
                  <p className="text-hunter-green">{example.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/*<section id="pricing" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4 text-brunswick-green">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-hunter-green max-w-2xl mx-auto">
              Choose the plan that best fits your event needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={index}
                className="rounded-xl overflow-hidden bg-white shadow-lg border border-sage
                  hover:border-fern-green transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2 text-brunswick-green">
                    {tier.name}
                  </h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-fern-green">
                      {typeof tier.price === 'number' ? `$${tier.price}` : tier.price}
                    </span>
                    {typeof tier.price === 'number' && 
                      <span className="text-hunter-green">/event</span>
                    }
                  </div>
                  <ul className="space-y-4">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-hunter-green">
                        <CheckCircle2 className="w-5 h-5 text-fern-green mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <motion.button 
                    className="w-full mt-8 px-6 py-3 rounded-full bg-fern-green text-white
                      hover:bg-hunter-green transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Demo Section */}

      <Footer />
    </div>
  );
}
