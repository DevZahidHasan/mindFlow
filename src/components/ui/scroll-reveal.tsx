"use client";

import * as React from "react";
import { useSpring } from "@/lib/hooks/use-spring";

export interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

/**
 * ScrollReveal with viewport limits and page-bottom fallback guards.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = "",
  delayMs = 0,
}) => {
  const [targetProgress, setTargetProgress] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);

  // Calibrate spring solver for smooth, responsive transition
  const smoothProgress = useSpring(targetProgress, {
    tension: 80,
    friction: 20,
    mass: 1.0,
  });

  React.useEffect(() => {
    const mediaMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaMotion.matches) {
      setTargetProgress(1);
      return;
    }

    const handleScroll = () => {
      if (!ref.current) return;

      // 1. Absolute bottom safety guard
      const scrollY = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;

      // If page is scrolled to the absolute bottom (with 30px boundary tolerance)
      if (scrollY + windowHeight >= docHeight - 30) {
        setTargetProgress(1);
        return;
      }

      // 2. Viewport-relative coordinate tracking
      const rect = ref.current.getBoundingClientRect();
      
      // Convert time-based delay into a spatial stagger offset
      const staggerOffset = delayMs * 0.3; 
      
      // Start reveal early when top edge enters 95% of viewport height
      const triggerStart = windowHeight * 0.95 + staggerOffset;
      // Complete reveal when top edge reaches 65% of viewport height
      const triggerEnd = windowHeight * 0.65 + staggerOffset;

      const totalDist = triggerStart - triggerEnd;
      const currentOffset = triggerStart - rect.top;

      const rawProgress = currentOffset / totalDist;
      const clamped = Math.max(0, Math.min(1, rawProgress));

      setTargetProgress(clamped);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Check initial positioning
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Spatial translations
  const opacity = smoothProgress;
  const translateY = (1 - smoothProgress) * 32; // Glides 32px
  const scale = 1.04 - smoothProgress * 0.04; // 4% scale transition

  return (
    <div
      ref={ref}
      style={{
        opacity,
        transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
        willChange: "transform, opacity",
      }}
      className={`w-full ${className}`}
    >
      {children}
    </div>
  );
};
export default ScrollReveal;
