import { useState, useEffect, useRef } from "react";

export interface SpringConfig {
  tension?: number;   // Stiffness coefficient
  friction?: number;  // Damping coefficient
  mass?: number;      // Inertia multiplier
  precision?: number; // Convergence threshold
}

export const SPRING_PRESETS = {
  micro: { tension: 120, friction: 22, mass: 1, precision: 0.005 },        // 250-500ms snappy response
  ui: { tension: 80, friction: 36, mass: 1.2, precision: 0.005 },          // 500-900ms standard UI
  editorial: { tension: 40, friction: 40, mass: 1.5, precision: 0.005 },   // 900-1600ms graceful settling
  cinematic: { tension: 20, friction: 45, mass: 2.0, precision: 0.005 },   // 1400-2600ms slow, deliberate
} as const;

/**
 * A lightweight, stable delta-time spring physics hook.
 * Resolves infinite render loops by storing configuration in refs and decoupling rAF from re-render cascades.
 */
export function useSpring(targetValue: number, config: SpringConfig = {}) {
  const tension = config.tension ?? 80;
  const friction = config.friction ?? 36;
  const mass = config.mass ?? 1.2;
  const precision = config.precision ?? 0.005;

  const [current, setCurrent] = useState(targetValue);
  const stateRef = useRef({
    current: targetValue,
    target: targetValue,
    velocity: 0,
    lastTime: 0,
    animating: false,
    rId: 0,
  });

  // Always sync target coordinate
  stateRef.current.target = targetValue;

  const configRef = useRef({ tension, friction, mass, precision });
  configRef.current = { tension, friction, mass, precision };

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      const state = stateRef.current;
      if (state.rId) {
        cancelAnimationFrame(state.rId);
        state.rId = 0;
      }
    };
  }, []);

  // Update target coordinates and manage loop lifecycle
  useEffect(() => {
    const state = stateRef.current;
    const { precision: prec } = configRef.current;

    // If already at target within precision, snap and return
    if (Math.abs(state.current - targetValue) <= prec && Math.abs(state.velocity) <= prec) {
      if (state.current !== targetValue) {
        state.current = targetValue;
        state.velocity = 0;
        setCurrent(targetValue);
      }
      return;
    }

    // If loop is already running, it will automatically read the updated stateRef.current.target
    if (state.animating) {
      return;
    }

    // Graceful override: respect prefers-reduced-motion
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mediaQuery.matches) {
        state.current = targetValue;
        state.velocity = 0;
        setCurrent(targetValue);
        return;
      }
    }

    state.animating = true;
    state.lastTime = 0;

    const loop = (timestamp: number) => {
      const { tension: k, friction: c, mass: m, precision: p } = configRef.current;
      
      if (!state.lastTime) {
        state.lastTime = timestamp;
        state.rId = requestAnimationFrame(loop);
        return;
      }

      // Delta time capped to prevent explosions on tab unfocus
      let dt = (timestamp - state.lastTime) / 1000;
      state.lastTime = timestamp;
      if (dt > 0.05) dt = 0.05;

      // Fixed-step Euler integration for unconditional stability
      const TIME_STEP = 0.008; // 8ms internal physics step
      let timeAccumulator = dt;
      let iterations = 0;

      while (timeAccumulator > 0 && iterations < 10) {
        const step = Math.min(timeAccumulator, TIME_STEP);
        
        // Hooke's Law with damping: Force = -k * x - c * v
        const displacement = state.current - state.target;
        const springForce = -k * displacement;
        const dampingForce = -c * state.velocity;
        const force = springForce + dampingForce;
        const acceleration = force / m;

        state.velocity += acceleration * step;
        state.current += state.velocity * step;
        
        timeAccumulator -= step;
        iterations++;
      }

      // Convergence check
      const isSettled =
        Math.abs(state.current - state.target) < p &&
        Math.abs(state.velocity) < p;

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
  }, [targetValue]);

  return current;
}

