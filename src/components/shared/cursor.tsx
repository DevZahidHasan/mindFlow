"use client";

import * as React from "react";

/**
 * An enhancement-only pointer halo wrapper.
 * Honors prefers-reduced-motion and touch device modes by shutting down,
 * and never blocks clicks or focus indicators.
 */
export const CustomCursor: React.FC = () => {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = React.useState(false);
  const [state, setState] = React.useState<"default" | "interactive" | "drag" | "text">("default");

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
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement | null;
      if (!target) {
        return;
      }

      // Check context styles of the target hovered element
      const isInteractive =
        target.closest("button") ||
        target.closest("a") ||
        target.closest('[role="button"]') ||
        window.getComputedStyle(target).cursor === "pointer";

      const isText =
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("[contenteditable]") ||
        window.getComputedStyle(target).cursor === "text";

      const isDrag =
        target.closest('[draggable="true"]') ||
        window.getComputedStyle(target).cursor === "grab" ||
        window.getComputedStyle(target).cursor === "grabbing";

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
    default: "w-6 h-6 border-border",
    interactive: "w-10 h-10 border-accent bg-accent/5 scale-110",
    drag: "w-8 h-8 border-warning bg-warning/5 cursor-grab",
    text: "opacity-0 scale-0", // Hide cursor halo during typing to avoid visual clutter
  };

  return (
    <div
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
      }}
      className={`fixed top-0 left-0 z-[9999] pointer-events-none rounded-full border border-solid transition-all duration-200 ease-out custom-cursor-halo hidden lg:block ${stateStyles[state]}`}
    />
  );
};
export default CustomCursor;
