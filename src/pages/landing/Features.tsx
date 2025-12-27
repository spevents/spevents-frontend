// src/components/landing/Features.tsx
import { motion } from "framer-motion";
import {
  DollarSign,
  Zap,
  Shield,
  Box,
  ShoppingBag,
  Building2,
} from "lucide-react";

interface FeaturesProps {
  isDark: boolean;
}

export const Features = ({ isDark }: FeaturesProps) => {
  const features = [
    {
      icon: DollarSign,
      title: "10x Cost Reduction",
      description:
        "Custom GPU pipelines deliver $5-10 scans vs $100+ with Matterport and traditional solutions",
    },
    {
      icon: Zap,
      title: "Near Real-Time",
      description:
        "Process in minutes, not hours. Validated on thousands of photos at live events",
    },
    {
      icon: Shield,
      title: "Production Ready",
      description:
        "Battle-tested infrastructure with 90%+ cost reduction compared to cloud APIs",
    },
  ];

  const useCases = [
    { icon: Box, label: "AR/VR Experiences" },
    { icon: ShoppingBag, label: "E-commerce 3D" },
    { icon: Building2, label: "Real Estate Tours" },
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
            Why Teams Choose Us
          </h2>
          <p
            className={`text-xl max-w-2xl mx-auto ${
              isDark ? "text-sp_lightgreen" : "text-sp_darkgreen/80"
            }`}
          >
            Infrastructure that makes 3D reconstruction economically viable at
            scale
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
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

        {/* Use Cases */}
        <div className="text-center">
          <p
            className={`text-sm uppercase tracking-wide mb-4 ${
              isDark ? "text-sp_lightgreen/70" : "text-sp_darkgreen/60"
            }`}
          >
            Built for
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  isDark
                    ? "bg-sp_green/40 text-sp_lightgreen"
                    : "bg-sp_darkgreen/10 text-sp_darkgreen"
                }`}
              >
                <useCase.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{useCase.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};
