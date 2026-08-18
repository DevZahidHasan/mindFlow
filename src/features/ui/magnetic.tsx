"use client";

import React, { useRef, useState } from "react";
import { useSpring, SPRING_PRESETS } from "@/lib/hooks/use-spring";

interface MagneticProps {
  children: React.ReactElement;
  intensity?: number;
  magneticRadius?: number;
}

export const Magnetic: React.FC<MagneticProps> = ({ 
  children, 
  intensity = 0.3,
  magneticRadius = 150
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Smooth out the position with springs
  const x = useSpring(position.x, SPRING_PRESETS.micro);
  const y = useSpring(position.y, SPRING_PRESETS.micro);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Calculate distance from center of element to mouse
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    // If within radius, apply magnetic pull
    if (distance < magneticRadius) {
      setIsHovered(true);
      setPosition({
        x: distanceX * intensity,
        y: distanceY * intensity
      });
    } else {
      setIsHovered(false);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate3d(${x}px, ${y}px, 0)`,
        willChange: "transform",
        zIndex: isHovered ? 10 : 1
      }}
      className="inline-block"
    >
      {React.cloneElement(children as React.ReactElement<{ style?: React.CSSProperties }>, {
        style: {
          ...(children as React.ReactElement<{ style?: React.CSSProperties }>).props.style,
          transition: "transform 0.2s ease-out",
        }
      })}
    </div>
  );
};
