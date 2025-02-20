import { useState } from "react";
import { motion } from "framer-motion";
import { SAMPLE_PHOTOS } from "./PhotoReviewMini";
import PhotoReviewMini from "./PhotoReviewMini";
import PhotoSlideshowMini from "./PhotoSlideshowMini";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { fadeIn } from "../Navigation";

export function ProductPage() {
  const [uploadedPhotos, setUploadedPhotos] = useState<
    Array<{ id: number; url: string }>
  >([]);
  const [reviewCompleted, setReviewCompleted] = useState(false);
  const [availablePhotos, setAvailablePhotos] =
    useState<Array<{ id: number; url: string }>>(SAMPLE_PHOTOS);

  const handlePhotoUpload = (photo: { id: number; url: string }) => {
    setUploadedPhotos((prev) => [...prev, photo]);
    setAvailablePhotos((prev) => prev.filter((p) => p.id !== photo.id));
  };

  const handlePhotoDelete = (photo: { id: number; url: string }) => {
    setUploadedPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    setAvailablePhotos((prev) => [...prev, photo]);
    setReviewCompleted(false);
  };

  return (
    <div className="w-full py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Hero Section */}
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
            Real-time Photo Sharing
          </motion.h2>
          <motion.p
            className="text-xl text-hunter-green mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Experience how Spevents makes sharing moments effortless
          </motion.p>
        </motion.div>

        {/* Interactive Demo */}
        <div className="max-w-6xl mx-auto">
          {/* Gallery and Review Container - Side by Side with expansion */}
          <div className="relative">
            <motion.div
              className={`grid gap-8 ${
                reviewCompleted ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
              }`}
            >
              {/* Left Side - Slideshow */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  gridColumn: reviewCompleted ? "span 2" : "auto",
                }}
                transition={{
                  duration: 0.5,
                  layout: { duration: 0.5 },
                }}
                layout
              >
                <PhotoSlideshowMini
                  photos={uploadedPhotos}
                  expanded={reviewCompleted}
                  onPhotoDelete={handlePhotoDelete}
                />
              </motion.div>

              {/* Right Side - Photo Review */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: reviewCompleted ? 0 : 1,
                  x: reviewCompleted ? 100 : 0,
                  display: reviewCompleted ? "none" : "block",
                }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {!reviewCompleted && (
                  <>
                    <PhotoReviewMini
                      photos={availablePhotos}
                      onPhotoAction={handlePhotoUpload}
                      onComplete={() => setReviewCompleted(true)}
                    />

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center justify-center space-x-2 py-4 text-hunter-green/60"
                    >
                      <p>Swipe UP to add photos!</p>
                      <ArrowRight className="w-5 h-5 animate-pulse" />
                    </motion.div>
                  </>
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-12">
            {[
              {
                title: "No App Downloads",
                description: "Just scan and share",
              },
              {
                title: "Real-time Updates",
                description: "Photos appear instantly",
              },
              {
                title: "Multiple Views",
                description: "Grid, fun, or presentation",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-sage
                  hover:border-fern-green transition-all duration-300"
              >
                <h3 className="text-lg font-semibold mb-1 text-brunswick-green">
                  {feature.title}
                </h3>
                <p className="text-hunter-green text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

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
              <a
                href="https://calendly.com/spevents-party/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-sage/20 px-6 
                  transition-all duration-300 ease-in-out hover:bg-brunswick-green"
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
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
