// src/components/Logo.tsx
import { FC } from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: FC<LogoProps> = ({ className = "w-auto h-8" }) => {
  return (
    <svg 
      viewBox="0 0 1200 200" 
      className={className}
      fill="currentColor"
    >
      <text
        x="0"
        y="150"
        fontFamily="Quicksand"
        fontSize="200"
        fontWeight="500"
      >
        spevents
      </text>
      <path
        d="M1100,0 L1200,100 L1100,200"
        fill="none"
        stroke="currentColor"
        strokeWidth="40"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};