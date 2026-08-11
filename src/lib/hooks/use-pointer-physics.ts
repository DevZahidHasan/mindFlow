import { useState, useEffect, RefObject } from 'react';
import { useSpring, SPRING_PRESETS } from './use-spring';

export interface PointerPhysicsConfig {
  /** Maximum pixel movement in X/Y */
  maxDisplacement?: number;
  /** Spring configuration for smoothing */
  springConfig?: Parameters<typeof useSpring>[1];
  /** Whether to track global window pointer or container pointer */
  global?: boolean;
}

/**
 * Returns continuous smoothed X/Y displacement based on pointer position.
 * Returns values from -1 to 1 representing position relative to center.
 */
export function usePointerPhysics(
  containerRef?: RefObject<HTMLElement | null>,
  {
    maxDisplacement = 20,
    springConfig = SPRING_PRESETS.ui,
    global = false,
  }: PointerPhysicsConfig = {}
) {
  // Store raw target values [-1, 1]
  const [targetX, setTargetX] = useState(0);
  const [targetY, setTargetY] = useState(0);

  // Apply spring smoothing
  const smoothedX = useSpring(targetX, springConfig);
  const smoothedY = useSpring(targetY, springConfig);

  useEffect(() => {
    let ticking = false;

    const handlePointerMove = (e: PointerEvent) => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        let x = 0;
        let y = 0;

        if (global) {
          x = (e.clientX / window.innerWidth) * 2 - 1;
          y = (e.clientY / window.innerHeight) * 2 - 1;
        } else if (containerRef?.current) {
          const rect = containerRef.current.getBoundingClientRect();
          // Normalize position relative to container center
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          // Clamp to container bounds
          const clientX = Math.max(rect.left, Math.min(rect.right, e.clientX));
          const clientY = Math.max(rect.top, Math.min(rect.bottom, e.clientY));
          
          x = ((clientX - centerX) / (rect.width / 2)) || 0;
          y = ((clientY - centerY) / (rect.height / 2)) || 0;
        }

        setTargetX(x);
        setTargetY(y);
        ticking = false;
      });
    };

    const handlePointerLeave = () => {
      setTargetX(0);
      setTargetY(0);
    };

    const target = global ? window : (containerRef?.current || window);
    
    target.addEventListener('pointermove', handlePointerMove as EventListener, { passive: true });
    target.addEventListener('pointerleave', handlePointerLeave as EventListener, { passive: true });

    return () => {
      target.removeEventListener('pointermove', handlePointerMove as EventListener);
      target.removeEventListener('pointerleave', handlePointerLeave as EventListener);
    };
  }, [containerRef, global]);

  return {
    x: smoothedX * maxDisplacement,
    y: smoothedY * maxDisplacement,
    normalizedX: smoothedX,
    normalizedY: smoothedY,
  };
}
