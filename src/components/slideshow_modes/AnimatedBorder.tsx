import React, { useEffect, useState, ReactNode } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

interface AnimatedBorderProps {
  children: ReactNode;
  className?: string;
  isMainContentVisible?: boolean;
}

const AnimatedBorder: React.FC<AnimatedBorderProps> = ({ 
  children, 
  className = '',
  isMainContentVisible = false 
}) => {
  const [isClient, setIsClient] = useState(false);
  const { scrollYProgress } = useScroll();
  const pathLength = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 90
  });

  // Adjust opacity based on both scroll position and main content visibility
  const baseOpacity = isMainContentVisible ? 0.3 : 1;
  const borderOpacity = useTransform(
    pathLength, 
    [0, 0.5, 1], 
    [baseOpacity, baseOpacity * 0.6, baseOpacity * 0.3]
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* SVG Border Container */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          // src/components/opening_border/henna_border.svg
        >
          {/* Henna-inspired corner patterns */}
          {[
            [0, 0], // Top-left
            [100, 0], // Top-right
            [0, 100], // Bottom-left
            [100, 100] // Bottom-right
          ].map(([x, y], index) => (
            <motion.path
              key={`henna-corner-${index}`}
              d={`
                M ${x},${y}
                c ${x === 0 ? '10' : '-10'},0 ${x === 0 ? '15' : '-15'},5 ${x === 0 ? '20' : '-20'},10
                c ${x === 0 ? '-5' : '5'},-3 ${x === 0 ? '-8' : '8'},-6 ${x === 0 ? '-10' : '10'},-8
                c ${x === 0 ? '8' : '-8'},4 ${x === 0 ? '12' : '-12'},8 ${x === 0 ? '15' : '-15'},12
                c ${x === 0 ? '-12' : '12'},-6 ${x === 0 ? '-18' : '18'},-12 ${x === 0 ? '-20' : '20'},-15
                ${y === 0 ? 'c 0,8 -2,15 -5,20' : 'c 0,-8 -2,-15 -5,-20'}
                ${y === 0 ? 'c 5,0 10,-2 15,-5' : 'c 5,0 10,2 15,5'}
              `}
              stroke="url(#borderGradient)"
              strokeWidth="0.3"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              style={{ opacity: borderOpacity }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                delay: index * 0.2,
              }}
            />
          ))}

          {/* Henna-inspired patterns along the sides */}
          {[0, 100].map((pos, index) => (
            <React.Fragment key={`henna-side-${index}`}>
              {/* Vertical patterns */}
              <motion.path
                d={`
                  M ${pos},20 
                  c ${pos === 0 ? '10' : '-10'},5 ${pos === 0 ? '5' : '-5'},15 ${pos === 0 ? '15' : '-15'},20
                  c ${pos === 0 ? '-10' : '10'},-5 ${pos === 0 ? '-5' : '5'},-15 ${pos === 0 ? '-15' : '15'},-20
                  m 0,30
                  c ${pos === 0 ? '8' : '-8'},3 ${pos === 0 ? '4' : '-4'},9 ${pos === 0 ? '12' : '-12'},12
                  c ${pos === 0 ? '-8' : '8'},-3 ${pos === 0 ? '-4' : '4'},-9 ${pos === 0 ? '-12' : '12'},-12
                  m 0,30
                  c ${pos === 0 ? '10' : '-10'},5 ${pos === 0 ? '5' : '-5'},15 ${pos === 0 ? '15' : '-15'},20
                  c ${pos === 0 ? '-10' : '10'},-5 ${pos === 0 ? '-5' : '5'},-15 ${pos === 0 ? '-15' : '15'},-20
                `}
                stroke="url(#borderGradient)"
                strokeWidth="0.3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                style={{ opacity: borderOpacity }}
                transition={{
                  duration: 1.5,
                  ease: "easeInOut",
                  delay: 1 + index * 0.3,
                }}
              />
            </React.Fragment>
          ))}

          {/* Decorative flower patterns */}
          {[25, 75].map((y, index) => (
            <motion.path
              key={`flower-${index}`}
              d={`
                M 0,${y} 
                c 5,0 8,-5 10,-8
                s 5,-5 8,-5
                s 6,3 6,6
                s -3,6 -6,6
                s -6,-3 -6,-6
                m 20,0
                c 0,-4 4,-8 8,-8
                s 8,4 8,8
                s -4,8 -8,8
                s -8,-4 -8,-8
              `}
              stroke="url(#borderGradient)"
              strokeWidth="0.2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              style={{ opacity: borderOpacity }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
                delay: 2 + index * 0.2,
              }}
            />
          ))}

          {/* Enhanced gradient definition */}
          <defs>
            <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#bf9b30" />
              <stop offset="25%" stopColor="#e36414" />
              <stop offset="50%" stopColor="#bf9b30" />
              <stop offset="75%" stopColor="#e36414" />
              <stop offset="100%" stopColor="#bf9b30" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Content */}
      {isClient && children}
    </div>
  );
};

export default AnimatedBorder;