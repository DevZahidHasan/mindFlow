import { useState, useEffect, useRef } from 'react';
import { useSpring, SPRING_PRESETS } from './use-spring';

export interface ScrollProgressConfig {
  /**
   * Ref to the scroll container (window if undefined)
   */
  containerRef?: React.RefObject<HTMLElement | null>;
  /**
   * Ref to the target element tracking intersection
   */
  targetRef?: React.RefObject<HTMLElement | null>;
  /**
   * Whether to apply spring physics to the progress value
   */
  spring?: boolean;
  /**
   * Spring configuration (defaults to 'cinematic' if spring is true)
   */
  springConfig?: Parameters<typeof useSpring>[1];
  /**
   * Offset mapping [startOffset, endOffset] -> [0, 1] 
   * e.g., ["start end", "end start"]
   */
  offset?: ["start end" | "start center" | "start top", "end start" | "end center" | "end bottom" | "end top"];
}

/**
 * Returns a normalized 0-1 progress value based on scroll position.
 * Respects prefers-reduced-motion (returns immediate values).
 */
export function useScrollProgress({
  containerRef,
  targetRef,
  spring = false,
  springConfig = SPRING_PRESETS.cinematic,
  offset = ["start end", "end start"],
}: ScrollProgressConfig = {}) {
  const [progress, setProgress] = useState(0);
  
  // Apply spring smoothing if requested
  const smoothedProgress = useSpring(progress, spring ? springConfig : { tension: 1000, friction: 100, mass: 1, precision: 0.001 });

  useEffect(() => {
    let ticking = false;

    const calculateProgress = () => {
      const container = containerRef?.current || window;
      const target = targetRef?.current;

      let viewportHeight = window.innerHeight;
      let scrollTop = window.scrollY;

      if (container !== window) {
        const el = container as HTMLElement;
        viewportHeight = el.clientHeight;
        scrollTop = el.scrollTop;
      }

      let startY = 0;
      let endY = viewportHeight;

      if (target) {
        const rect = target.getBoundingClientRect();
        // Calculate absolute position relative to document/container top
        const absoluteTop = rect.top + scrollTop;
        
        // Parse offsets (very simplified parser for demonstration)
        const [startOffsetStr, endOffsetStr] = offset;
        
        // Start: when does progress begin?
        if (startOffsetStr === "start end") {
          // target top hits viewport bottom
          startY = absoluteTop - viewportHeight;
        } else if (startOffsetStr === "start center") {
          startY = absoluteTop - viewportHeight / 2;
        } else if (startOffsetStr === "start top") {
          startY = absoluteTop;
        }

        // End: when does progress end?
        if (endOffsetStr === "end start") {
          // target bottom hits viewport top
          endY = absoluteTop + rect.height;
        } else if (endOffsetStr === "end center") {
          endY = absoluteTop + rect.height - viewportHeight / 2;
        } else if (endOffsetStr === "end top") {
          endY = absoluteTop + rect.height - viewportHeight;
        } else if (endOffsetStr === "end bottom") {
          endY = absoluteTop + rect.height;
        }
      }

      // Calculate normalized 0-1 progress
      const currentScroll = scrollTop;
      let p = (currentScroll - startY) / (endY - startY);
      
      // Clamp
      if (p < 0) p = 0;
      if (p > 1) p = 1;

      setProgress(p);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(calculateProgress);
        ticking = true;
      }
    };

    // Initial calculation
    calculateProgress();

    const scrollContainer = containerRef?.current || window;
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [containerRef, targetRef, offset]);

  // If reduced motion is active, return immediate progress
  // Wait, useSpring already handles reduced motion internally by returning target directly!
  return spring ? smoothedProgress : progress;
}
