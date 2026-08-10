"use client";

import * as React from "react";
import { useSpring } from "@/lib/hooks/use-spring";

export interface MagneticProps {
  children: React.ReactElement<{ style?: React.CSSProperties }>;
  radius?: number;      // Activation distance (px)
  maxOffset?: number;   // Maximum displacement (px)
  tension?: number;     // Spring stiffness
  friction?: number;    // Spring damping
}

export const Magnetic: React.FC<MagneticProps> = ({
  children,
  radius = 24,
  maxOffset = 8,
  tension = 150,
  friction = 18,
}) => {
  const [target, setTarget] = React.useState({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Animate components independently in 2D space
  const x = useSpring(target.x, { tension, friction });
  const y = useSpring(target.y, { tension, friction });

  const handlePointerMove = (e: React.PointerEvent) => {
    // Disable on touch devices
    if (e.pointerType === "touch" || !containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;
    const distance = Math.hypot(distX, distY);

    if (distance < radius) {
      // Calculate interpolation offset (stronger pull near center)
      const force = (radius - distance) / radius;
      const pullX = distX * force * (maxOffset / radius);
      const pullY = distY * force * (maxOffset / radius);
      setTarget({ x: pullX, y: pullY });
    } else {
      setTarget({ x: 0, y: 0 });
    }
  };

  const handlePointerLeave = () => {
    setTarget({ x: 0, y: 0 });
  };

  // Re-map transform style variables to child component
  const childStyle = children.props.style || {};

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="inline-block"
    >
      {React.cloneElement(children, {
        style: {
          ...childStyle,
          transform: `translate3d(${x}px, ${y}px, 0)`,
        },
      })}
    </div>
  );
};
