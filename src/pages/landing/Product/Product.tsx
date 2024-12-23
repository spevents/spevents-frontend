import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navigation } from "../Navigation";
import { Footer } from "../../../components/Footer";
import { SAMPLE_PHOTOS } from "./minis/PhotoReviewMini";
import PhotoReviewMini from "./minis/PhotoReviewMini";
import PhotoSlideshowMini from "./minis/PhotoSlideshowMini";
import { ArrowDown, CalendarCheck } from "lucide-react";
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
  };

  const handlePhotoDelete = (photo: { id: number; url: string }) => {
    setUploadedPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    setAvailablePhotos((prev) => [...prev, photo]);
    setReviewCompleted(false);
  };


  return (
    <div className="min-h-screen bg-timberwolf">
      <Navigation />
      <section className="relative flex-grow pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section */}
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
              Real-time Photo Sharing
            </motion.h1>
            <motion.p
              className="text-xl text-hunter-green mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Experience how Spevents makes sharing moments effortless
            </motion.p>
          </motion.div>

          {/* Interactive Demo */}
          <div className="max-w-2xl mx-auto">
            {/* Gallery and Review Container */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <PhotoSlideshowMini
                  photos={uploadedPhotos}
                  expanded={reviewCompleted}
                  onPhotoDelete={handlePhotoDelete}
                />
              </motion.div>

              {!reviewCompleted && (
                <>
                  {/* Swipe Instructions */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col items-center space-y-2 py-2 text-hunter-green/60"
                  >
                    <ArrowDown className="w-5 h-5 animate-bounce" />
                    <p>Swipe up to add photos to the gallery</p>
                  </motion.div>

                  {/* Photo Review Interface */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <PhotoReviewMini
                      onPhotoAction={handlePhotoUpload}
                      onComplete={() => setReviewCompleted(true)}
                    />
                  </motion.div>
                </>
              )}
            </div>

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
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
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
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
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
