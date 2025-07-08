// src/components/dashboard/CommunityContent.tsx

import { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, TrendingUp } from "lucide-react";
import Carousel from "./Carousel";

const CommunityContent = memo(() => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center py-12 bg-white dark:bg-sp_dark_surface rounded-2xl border border-sp_eggshell/30 dark:border-sp_lightgreen/20">
        <div className="w-24 h-24 bg-gradient-to-br from-sp_lightgreen to-sp_midgreen rounded-full flex items-center justify-center mx-auto mb-6">
          <Globe className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-sp_darkgreen dark:text-sp_dark_text mb-2">
          Community Templates
        </h2>
        <p className="text-sp_green/70 dark:text-sp_dark_muted mb-6">
          Discover and share beautiful photo wall designs
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-sp_eggshell/50 dark:bg-sp_lightgreen/10 text-sp_green dark:text-sp_lightgreen rounded-xl">
          <span className="w-2 h-2 bg-sp_midgreen dark:bg-sp_lightgreen rounded-full mr-2 animate-pulse"></span>
          Coming Soon
        </div>
      </div>

      {/* Community Carousel */}
      <Carousel title="Featured Templates">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className={`${isMobile ? "w-full" : "w-1/3"} flex-shrink-0 px-2`}
          >
            <div className="bg-white dark:bg-sp_dark_surface rounded-xl overflow-hidden border border-sp_eggshell/30 dark:border-sp_lightgreen/20">
              <div className="h-48 bg-gradient-to-br from-sp_lightgreen/20 to-sp_midgreen/20 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-sp_green/50 dark:text-sp_dark_muted mx-auto mb-2" />
                  <p className="text-sp_green/70 dark:text-sp_dark_muted text-sm">
                    Template {item}
                  </p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-sp_darkgreen dark:text-sp_dark_text">
                  Coming Soon
                </p>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </motion.div>
  );
});

CommunityContent.displayName = "CommunityContent";

export default CommunityContent;
