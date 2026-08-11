"use client";

import * as React from "react";
import { useSpring } from "@/lib/hooks/use-spring";

/**
 * An enhancement-only pointer halo wrapper.
 * Trailing coordinates are driven smoothly in JS by our custom spring solver.
 * CSS transitions are limited strictly to size, border colors, and opacities,
 * completely preventing interpolation offsets and render lags.
 */
export const CustomCursor: React.FC = () => {
  const [target, setTarget] = React.useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = React.useState(false);
  const [state, setState] = React.useState<"default" | "interactive" | "drag" | "text">("default");

  // Trailing inertia driven by our custom heavy spring solver
  const springX = useSpring(target.x, { tension: 70, friction: 32, mass: 1.2 });
  const springY = useSpring(target.y, { tension: 70, friction: 32, mass: 1.2 });

  React.useEffect(() => {
    // Safety check: Disable cursor enhancement on touch viewports or reduced-motion
    const mediaTouch = window.matchMedia("(hover: none)");
    const mediaMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaTouch.matches || mediaMotion.matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) {
        setIsVisible(true);
      }
      setTarget({ x: e.clientX, y: e.clientY });

      const targetEl = e.target as HTMLElement | null;
      if (!targetEl) {
        return;
      }

      // Check context styles of the target hovered element
      const isInteractive =
        targetEl.closest("button") ||
        targetEl.closest("a") ||
        targetEl.closest('[role="button"]') ||
        window.getComputedStyle(targetEl).cursor === "pointer";

      const isText =
        targetEl.closest("input") ||
        targetEl.closest("textarea") ||
        targetEl.closest("[contenteditable]") ||
        window.getComputedStyle(targetEl).cursor === "text";

      const isDrag =
        targetEl.closest('[draggable="true"]') ||
        window.getComputedStyle(targetEl).cursor === "grab" ||
        window.getComputedStyle(targetEl).cursor === "grabbing";

      if (isInteractive) {
        setState("interactive");
      } else if (isText) {
        setState("text");
      } else if (isDrag) {
        setState("drag");
      } else {
        setState("default");
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  const stateStyles = {
    default: "w-6 h-6 border-border opacity-100",
    interactive: "w-10 h-10 border-accent bg-accent/5 opacity-100",
    drag: "w-8 h-8 border-warning bg-warning/5 opacity-100",
    text: "w-0 h-0 opacity-0 border-transparent", // Hide cursor halo during typing
  };

  return (
    <div
      style={{
        transform: `translate3d(${springX}px, ${springY}px, 0) translate(-50%, -50%)`,
      }}
      className={`fixed top-0 left-0 z-[9999] pointer-events-none rounded-full border border-solid transition-[width,height,background-color,border-color,opacity] duration-500 cubic-bezier(0.16, 1, 0.3, 1) custom-cursor-halo hidden lg:block ${stateStyles[state]}`}
    />
  );
};
export default CustomCursor;
