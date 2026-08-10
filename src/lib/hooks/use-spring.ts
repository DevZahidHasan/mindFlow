import { useState, useEffect, useRef } from "react";

export interface SpringConfig {
  tension?: number;   // Stiffness coefficient
  friction?: number;  // Damping coefficient
  mass?: number;      // Inertia multiplier
  precision?: number; // Convergence threshold
}

/**
 * A lightweight, stable delta-time spring physics hook.
 * Avoids infinite execution loops by automatically converging and terminating.
 */
export function useSpring(targetValue: number, config: SpringConfig = {}) {
  const {
    tension = 170,
    friction = 26,
    mass = 1,
    precision = 0.005,
  } = config;

  const [current, setCurrent] = useState(targetValue);
  const stateRef = useRef({
    current: targetValue,
    target: targetValue,
    velocity: 0,
    lastTime: 0,
  });

  // Keep target updated across renders
  stateRef.current.target = targetValue;

  useEffect(() => {
    // Graceful override: respect prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setCurrent(targetValue);
      stateRef.current.current = targetValue;
      stateRef.current.velocity = 0;
      return;
    }

    let rId: number | null = null;

    const loop = (timestamp: number) => {
      const state = stateRef.current;
      if (!state.lastTime) {
        state.lastTime = timestamp;
        rId = requestAnimationFrame(loop);
        return;
      }

      // Delta time in seconds, capped to avoid runaway values on tab resume
      let dt = (timestamp - state.lastTime) / 1000;
      state.lastTime = timestamp;
      if (dt > 0.1) dt = 0.1;

      // Spring formula: Force = -k * x - c * v
      const displacement = state.current - state.target;
      const springForce = -tension * displacement;
      const dampingForce = -friction * state.velocity;
      const force = springForce + dampingForce;
      const acceleration = force / mass;

      // Update velocity and position
      state.velocity += acceleration * dt;
      state.current += state.velocity * dt;

      // Settle check
      const isSettled =
        Math.abs(state.current - state.target) < precision &&
        Math.abs(state.velocity) < precision;

      if (isSettled) {
        state.current = state.target;
        state.velocity = 0;
        state.lastTime = 0;
        setCurrent(state.target);
        rId = null; // Terminate loop
      } else {
        setCurrent(state.current);
        rId = requestAnimationFrame(loop);
      }
    };

    // Trigger loop only if we aren't already aligned
    if (Math.abs(stateRef.current.current - targetValue) > precision) {
      stateRef.current.lastTime = 0;
      rId = requestAnimationFrame(loop);
    }

    return () => {
      if (rId) {
        cancelAnimationFrame(rId);
      }
    };
  }, [targetValue, tension, friction, mass, precision]);

  return current;
}
