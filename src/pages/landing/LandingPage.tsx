// src/pages/landing/LandingPage.tsx
import { motion } from "framer-motion";
import { CalendarCheck, Github, Users, Camera, LineChart } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8 }
};

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-timberwolf">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 bg-timberwolf/80 backdrop-blur-sm z-50 border-b border-sage/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-brunswick-green">
              spevents
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/fbablu/spevents"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-hunter-green hover:text-brunswick-green transition-colors"
              >
                <Github className="w-5 h-5" />
                <span className="hidden sm:inline">Star on GitHub</span>
              </a>
              <a
                href="https://app.spevents.live"
                className="px-4 py-2 bg-brunswick-green text-white rounded-lg hover:bg-hunter-green transition-colors"
              >
                Host Sign In
              </a>
              <a
                href="https://join.spevents.live"
                className="px-4 py-2 bg-sage text-brunswick-green rounded-lg hover:bg-fern-green hover:text-white transition-colors"
              >
                Join Event
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
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
              transition={{ duration: 0.8 }}
            >
              Easy Guest Photo Curation
            </motion.h1>
            <motion.p
              className="text-xl text-hunter-green mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Real-time guest photo collection. Just scan a QR code and swipe up to submit photos. 
              No apps required.
            </motion.p>

            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <a
                href="https://calendly.com/spevents-party/30min"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-sage/20 px-6 
                  transition-all duration-300 ease-in-out hover:bg-brunswick-green"
              >
                <span className="rounded-full bg-brunswick-green p-2 text-white transition-colors 
                  group-hover:bg-white group-hover:text-brunswick-green">
                  <CalendarCheck className="h-4 w-4" />
                </span>
                <span className="text-lg font-black text-brunswick-green transition-colors 
                  group-hover:text-white">
                  Book Demo
                </span>
              </a>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            {[
              {
                icon: Users,
                title: "Guest Engagement",
                description: "Keep guests present and connected while capturing every moment"
              },
              {
                icon: Camera,
                title: "Real-time Gallery",
                description: "Photos appear instantly in a slideshow visualization"
              },
              {
                icon: LineChart,
                title: "Easy Setup",
                description: "No app downloads required, just scan and capture"
              }
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
    </div>
  );
};