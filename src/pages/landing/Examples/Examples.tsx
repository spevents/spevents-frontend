import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CalendarCheck } from "lucide-react";
import ExampleShowcase from "./ExampleShowcase";
import { fadeIn } from "../Navigation";

export function ExamplesPage() {
  return (
    <div className="w-full py-20">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          className="text-center mb-16"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-6 text-brunswick-green"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Event Examples
          </motion.h2>
          <motion.p
            className="text-xl text-hunter-green mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Here are some real events and photos that were taken using Spevents!
          </motion.p>
          <ExampleShowcase />
        </motion.div>

                  {/* Call to Action */}
                  <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <Link
                to="https://calendly.com/spevents-party/30min"
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
              </Link>
            </motion.div>
          </motion.div>
      </div>
    </div>
  );
}