import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Camera,
  MapPin,
} from "lucide-react";





const vabsRothPhotos = import.meta.glob("./ExamplePhotos/VABSxRothRoll/*.jpg", {
  eager: true,
  as: "url",
});


const vabsRothPhotoArray = Object.values(vabsRothPhotos).sort((a, b) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
);


interface Event {
  id: number;
  title: string;
  date: string;
  venue: string;
  guests: string;
  photoCount: string;
  description: string;
  testimonial: string;
  images: string[];
  organizerLinks: Array<{ name: string; link: string }>;
}



const events: Event[] = [
  {
    id: 2, // Mock Shaadi comes first as most recent
    title: "Mock Shaadi 2025",
    date: "January 10, 2025",
    venue: "Student Life Center (SLC)",
    guests: "300+",
    photoCount: "Coming Soon",
    description:
      "Get ready for the WEDDING OF THE YEAR! Join us for our MOCK SHAADI – the most South Asian wedding celebration at Vanderbilt! 🥳🎶",
    testimonial: "Coming Soon",
    images: Array(5).fill("/api/placeholder/1080/1920"),
    organizerLinks: [
      { name: "VABS", link: "https://www.instagram.com/vandy.bengalis/" },
      { name: "PSA", link: "https://www.instagram.com/vandypsa/" },
      { name: "SACE", link: "https://www.instagram.com/vanderbiltsace/" },
    ],
  },
  {
    id: 1,
    title: "VABS x Roth n Roll",
    date: "December 20, 2024",
    venue: "Rothschild College",
    guests: "20-25",
    photoCount: "51",
    description:
      "Books closed, dinner served!! 📚🍴 Take a Bengali-style study break with VABS and @rothschildcollegevu for our Roth 'N' Roll!",
    testimonial:
      "This was awesome! People were engaged and happy to contribute photos for our event",
    images: vabsRothPhotoArray,
    organizerLinks: [
      { name: "VABS", link: "https://www.instagram.com/vandy.bengalis/" },
      {
        name: "Rothschild College",
        link: "https://www.instagram.com/rothschildcollegevu/",
      },
    ],
  },
];



export default function EventShowcase() {
  // Track current image for each event separately
  const [currentImages, setCurrentImages] = useState<Record<number, number>>(
    Object.fromEntries(events.map((event) => [event.id, 0]))
  );
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const handleDragStart = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    // Drag start logic if needed
  };
  const handleDragEnd = (
    eventId: number,
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (Math.abs(info.offset.x) > 100) {
      const currentImage = currentImages[eventId];
      const eventImages =
        events.find((e) => e.id === eventId)?.images.length || 0;
      if (info.offset.x > 0 && currentImage > 0) {
        setCurrentImages((prev) => ({ ...prev, [eventId]: currentImage - 1 }));
      } else if (info.offset.x < 0 && currentImage < eventImages - 1) {
        setCurrentImages((prev) => ({ ...prev, [eventId]: currentImage + 1 }));
      }
    }
  };
  const handleImageNavigation = (
    eventId: number,
    direction: "prev" | "next"
  ) => {
    const currentImage = currentImages[eventId];
    const eventImages =
      events.find((e) => e.id === eventId)?.images.length || 0;
    if (direction === "prev" && currentImage > 0) {
      setCurrentImages((prev) => ({ ...prev, [eventId]: currentImage - 1 }));
    } else if (direction === "next" && currentImage < eventImages - 1) {
      setCurrentImages((prev) => ({ ...prev, [eventId]: currentImage + 1 }));
    }
  };
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="space-y-12">
        {events.map((event) => (
          <div
            key={event.id}
            className="border-t border-sage/20 pt-12 first:border-none first:pt-0"
          >
            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* Photo Carousel */}
              <div className="relative h-[600px] bg-sage  rounded-xl overflow-hidden">
                <motion.div
                  className="absolute inset-0"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragStart={handleDragStart}
                  onDragEnd={(_, info) => handleDragEnd(event.id, _, info)}
                  dragElastic={0.2}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${event.id}-${currentImages[event.id]}`}
                      className="w-full h-full flex justify-center items-center p-8"
                    >
                      <motion.img
                        src={event.images[currentImages[event.id]]}
                        alt={`Event photo ${currentImages[event.id] + 1}`}
                        className="max-h-full max-w-full border-8 border-white rounded-xl"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        draggable={false}
                      />
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
                {/* Navigation Dots */}
                <div className="absolute inset-x-0 bottom-4 flex justify-center space-x-2">
                  {event.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        setCurrentImages((prev) => ({
                          ...prev,
                          [event.id]: idx,
                        }))
                      }
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentImages[event.id] === idx
                          ? "bg-white w-4"
                          : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
                {/* Navigation Arrows */}
                <button
                  onClick={() => handleImageNavigation(event.id, "prev")}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 rounded-full text-white 
                    hover:bg-black/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentImages[event.id] === 0}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleImageNavigation(event.id, "next")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 rounded-full text-white 
                    hover:bg-black/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentImages[event.id] === event.images.length - 1}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>



              {/* Event Details */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-brunswick-green mb-2">
                    {event.title}
                  </h2>
                  <p className="text-hunter-green text-lg">
                    {event.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 text-hunter-green">
                    <Calendar className="w-5 h-5" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-hunter-green">
                    <MapPin className="w-5 h-5" />
                    <span>{event.venue}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-hunter-green">
                    <Users className="w-5 h-5" />
                    <span>{event.guests} Guests</span>
                  </div>
                  <div className="flex items-center space-x-2 text-hunter-green">
                    <Camera className="w-5 h-5" />
                    <span>{event.photoCount} Photos</span>
                  </div>
                </div>

                <blockquote className="border-l-4 border-sage pl-4 py-2 text-hunter-green italic">
                  "{event.testimonial}"
                </blockquote>

                <div className="text-sm text-sage space-x-2">
                  Organized by:{" "}
                  {event.organizerLinks.map((org, idx) => (
                    <React.Fragment key={org.name}>
                      <a
                        href={org.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brunswick-green hover:text-fern-green transition-colors"
                      >
                        @{org.name}
                      </a>
                      {idx < event.organizerLinks.length - 1 && <span>x</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
