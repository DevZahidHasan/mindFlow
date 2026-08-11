import { useState, useEffect, useRef } from "react";

export interface SpringConfig {
  tension?: number;   // Stiffness coefficient
  friction?: number;  // Damping coefficient
  mass?: number;      // Inertia multiplier
  precision?: number; // Convergence threshold
}

/**
 * A lightweight, stable delta-time spring physics hook.
 * Resolves scroll-lock delay bugs by allowing continuous loops to run without
 * cleanup interruptions during active value changes.
 */
export function useSpring(targetValue: number, config: SpringConfig = {}) {
  const {
    tension = 80,       // Moderate tension
    friction = 36,      // High damping
    mass = 1.2,         // Heavy inertia
    precision = 0.005,
  } = config;

  const [current, setCurrent] = useState(targetValue);
  const stateRef = useRef({
    current: targetValue,
    target: targetValue,
    velocity: 0,
    lastTime: 0,
    animating: false,
    rId: 0,
  });

  // Keep target updated across renders
  stateRef.current.target = targetValue;

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      const state = stateRef.current;
      if (state.rId) {
        cancelAnimationFrame(state.rId);
      }
    };
  }, []);

  // Update target coordinates and manage loop lifecycle
  useEffect(() => {
    const state = stateRef.current;

    // Graceful override: respect prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setCurrent(targetValue);
      state.current = targetValue;
      state.velocity = 0;
      return;
    }

    // If loop is already running, let it run (it naturally reads the updated stateRef.current.target)
    if (state.animating) {
      return;
    }

    // Start loop if we are not aligned
    if (Math.abs(state.current - targetValue) > precision) {
      state.animating = true;
      state.lastTime = 0;

      const loop = (timestamp: number) => {
        if (!state.lastTime) {
          state.lastTime = timestamp;
          state.rId = requestAnimationFrame(loop);
          return;
        }

        // Delta time capped to prevent explosions on tab unfocus
        let dt = (timestamp - state.lastTime) / 1000;
        state.lastTime = timestamp;
        if (dt > 0.1) dt = 0.1;

        // Fixed-step Euler integration for unconditional stability
        const TIME_STEP = 0.008; // 8ms internal physics step
        let timeAccumulator = dt;

        while (timeAccumulator > 0) {
          const step = Math.min(timeAccumulator, TIME_STEP);
          
          // Hooke's Law with damping: Force = -k * x - c * v
          const displacement = state.current - state.target;
          const springForce = -tension * displacement;
          const dampingForce = -friction * state.velocity;
          const force = springForce + dampingForce;
          const acceleration = force / mass;

          state.velocity += acceleration * step;
          state.current += state.velocity * step;
          
          timeAccumulator -= step;
        }

        // Convergence check
        const isSettled =
          Math.abs(state.current - state.target) < precision &&
          Math.abs(state.velocity) < precision;

        if (isSettled) {
          state.current = state.target;
          state.velocity = 0;
          state.lastTime = 0;
          state.animating = false;
          state.rId = 0;
          setCurrent(state.target);
        } else {
          setCurrent(state.current);
          state.rId = requestAnimationFrame(loop);
        }
      };

      state.rId = requestAnimationFrame(loop);
    }
  }, [targetValue, tension, friction, mass, precision]);

  return current;
}
