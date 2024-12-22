import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from './Navigation';
import { Footer } from '../../components/Footer';
import { SAMPLE_PHOTOS } from './minis/PhotoReviewMini';
import PhotoReviewMini  from './minis/PhotoReviewMini';
import PhotoSlideshowMini from './minis/PhotoSlideshowMini';
import { ArrowDown } from 'lucide-react';

export function ProductPage() {
  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{ id: number; url: string }>>([]);
  const [reviewCompleted, setReviewCompleted] = useState(false);
  const [availablePhotos, setAvailablePhotos] = useState<Array<{ id: number; url: string }>>(SAMPLE_PHOTOS);

  const handlePhotoUpload = (photo: { id: number; url: string }) => {
    setUploadedPhotos(prev => [...prev, photo]);
  };

  const handlePhotoDelete = (photo: { id: number; url: string }) => {
    setUploadedPhotos(prev => prev.filter(p => p.id !== photo.id));
    setAvailablePhotos(prev => [...prev, photo]);
    setReviewCompleted(false);
  };

  return (
    <div className="min-h-screen bg-timberwolf">
      <Navigation />
      
      <section className="pt-24 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-brunswick-green">
              Real-time Photo Sharing
            </h1>
            <p className="text-xl text-hunter-green max-w-2xl mx-auto">
              Experience how Spevents makes sharing moments effortless
            </p>
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
                  description: "Just scan and share"
                },
                {
                  title: "Real-time Updates",
                  description: "Photos appear instantly"
                },
                {
                  title: "Multiple Views",
                  description: "Grid, fun, or presentation"
                }
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
                  <p className="text-hunter-green text-sm">{feature.description}</p>
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
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-fern-green text-white rounded-full text-lg font-medium
                  hover:bg-hunter-green transition-colors"
              >
                Try Demo Event
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}