import {
  Camera,
  Users,
  CalendarCheck,
  GalleryVerticalEnd,
  LineChart,
  ChevronDown,
} from "lucide-react";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navigation } from "./Navigation";
import { Footer } from "../../components/Footer";
import { fadeIn } from "./Navigation";
import { ProductPage } from "./Product/Product";
import { ExamplesPage } from "./Examples/Examples";

export function LandingPage() {
  // const examples = [
  //   {
  //     title: "Weddings",
  //     description:
  //       "Capture precious moments from multiple angles as guests celebrate your special day.",
  //     image:
  //       "https://images.unsplash.com/flagged/photo-1620830102229-9db5c00d4afc?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  //   },
  //   {
  //     title: "Corporate Events",
  //     description:
  //       "Keep everyone engaged while creating a shared photo collection of team activities.",
  //     image:
  //       "https://images.unsplash.com/photo-1560439514-4e9645039924?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  //   },
  //   {
  //     title: "Celebrations",
  //     description:
  //       "From birthdays to anniversaries, preserve memories from every perspective.",
  //     image:
  //       "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2969&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  //   },
  // ];

  return (
    <div className="min-h-screen bg-timberwolf flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section id="home" className="relative flex-grow pt-32 pb-20 px-6">
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
              Real-time guest photo collection. Just scan a QR code and swipe up
              to submit photos. No apps required.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Buttons Container */}
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
                initial={{ opacity: 1, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                {/* Book Demo Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block w-full sm:w-auto"
                >
                  <Link
                    to="https://calendly.com/spevents-party/30min"
                    className="group inline-flex h-12 items-center gap-2 rounded-full bg-sage/20 px-4 
                      transition-all duration-300 ease-in-out hover:bg-brunswick-green w-full sm:w-auto"
                  >
                    <span
                      className="rounded-full bg-brunswick-green p-2 text-white transition-colors 
                        group-hover:bg-white group-hover:text-brunswick-green"
                    >
                      <CalendarCheck className="h-4 w-4" />
                    </span>
                    <span
                      className="text-lg font-black text-brunswick-green transition-colors 
                        group-hover:text-white"
                    >
                      Book Demo
                    </span>
                  </Link>
                </motion.div>

                {/* See Examples Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block w-full sm:w-auto"
                >
                  <Link
                    to="/#examples"
                    className="group inline-flex h-12 items-center gap-2 rounded-full bg-sage/20 px-4 
                      transition-all duration-300 ease-in-out hover:bg-brunswick-green w-full sm:w-auto"
                  >
                    <span
                      className="rounded-full bg-brunswick-green p-2 text-white transition-colors 
                        group-hover:bg-white group-hover:text-brunswick-green"
                    >
                      <GalleryVerticalEnd className="h-4 w-4" />
                    </span>
                    <span
                      className="text-lg font-black text-brunswick-green transition-colors 
                        group-hover:text-white"
                    >
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
                  "Photos appear instantly in a slideshow visualization",
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

      <div className="w-full h-px bg-sage/20 "></div>
      {/* Product Section */}
      <section id="product">
        <div className="container mx-auto max-w-6xl">
          <ProductPage />
        </div>
      </section>

      <div className="w-full h-px bg-sage/20 "></div>

      {/* Examples Section */}
      <section id="examples">
        <div className="container mx-auto max-w-6xl">
          <ExamplesPage />
        </div>
      </section>

      <Footer />
    </div>
  );
}
