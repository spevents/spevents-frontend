// src/components/dashboard/CommunityContent.tsx

import { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const MetricsContent = memo(() => {
  const [_isMobile, setIsMobile] = useState(false);

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
          <TrendingUp className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-sp_darkgreen dark:text-sp_dark_text mb-2">
          Guest Metrics
        </h2>
        <p className="text-sp_green/70 dark:text-sp_dark_muted mb-6">
          View your guests metrics history and understand how engaging specific
          events were.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-sp_eggshell/50 dark:bg-sp_lightgreen/10 text-sp_green dark:text-sp_lightgreen rounded-xl">
          <span className="w-2 h-2 bg-sp_midgreen dark:bg-sp_lightgreen rounded-full mr-2 animate-pulse"></span>
          Coming Soon
        </div>
      </div>
    </motion.div>
  );
});

MetricsContent.displayName = "MetricsContent";

export default MetricsContent;
