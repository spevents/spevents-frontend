// src/components/landing/Features.tsx
import { motion } from "framer-motion";
import { Camera, Users, LineChart } from "lucide-react";

interface FeaturesProps {
  isDark: boolean;
}

export const Features = ({ isDark }: FeaturesProps) => {
  const features = [
    {
      icon: Camera,
      title: "Instant Uploads",
      description:
        "Guests scan QR codes to upload photos instantly to your event wall",
    },
    {
      icon: Users,
      title: "Live Photo Wall",
      description: "Watch photos appear in real-time on any screen or display",
    },
    {
      icon: LineChart,
      title: "Easy Setup",
      description: "Create events in minutes with our intuitive dashboard",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={`py-20 ${
        isDark ? "bg-sp_darkgreen/50" : "bg-sp_lightgreen/10"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className={`text-4xl font-bold mb-6 ${
              isDark ? "text-sp_eggshell" : "text-sp_darkgreen"
            }`}
          >
            Everything You Need
          </h2>
          <p
            className={`text-xl max-w-2xl mx-auto ${
              isDark ? "text-sp_lightgreen" : "text-sp_darkgreen/80"
            }`}
          >
            Simple, powerful tools to capture and share every moment of your
            event
          </p>
        </div>

        <div
          className={`grid md:grid-cols-2 lg:grid-cols-${features.length} gap-8`}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`text-center p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${
                isDark
                  ? "bg-sp_green/30 border-sp_midgreen hover:bg-sp_green/40"
                  : "bg-white/60 border-sp_lightgreen/30 hover:bg-white/80"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  isDark ? "bg-sp_lightgreen/20" : "bg-sp_darkgreen/10"
                }`}
              >
                <feature.icon
                  className={`w-8 h-8 ${
                    isDark ? "text-sp_lightgreen" : "text-sp_darkgreen"
                  }`}
                />
              </div>
              <h3
                className={`text-xl font-semibold mb-3 ${
                  isDark ? "text-sp_eggshell" : "text-sp_darkgreen"
                }`}
              >
                {feature.title}
              </h3>
              <p
                className={
                  isDark ? "text-sp_lightgreen" : "text-sp_darkgreen/70"
                }
              >
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};
