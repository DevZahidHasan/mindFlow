"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSpring, SPRING_PRESETS } from "@/lib/hooks/use-spring";

interface RelationshipLineProps {
  sourceId: string;
  onConnect?: (targetId: string) => void;
}

/**
 * A draggable, physical spring-based SVG line for creating relationships.
 * It simulates tension and magnetic attraction to nearby nodes.
 */
export const RelationshipLine: React.FC<RelationshipLineProps> = ({ sourceId, onConnect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  
  const lineRef = useRef<SVGElement>(null);

  // Apply spring physics to the line end so it drags with physical weight
  const endX = useSpring(targetPos.x, SPRING_PRESETS.micro);
  const endY = useSpring(targetPos.y, SPRING_PRESETS.micro);
  
  // Line tension (thickness/opacity) increases as drag distance increases
  const distance = Math.sqrt(endX * endX + endY * endY);
  const tension = Math.min(1, distance / 300);

  useEffect(() => {
    if (!isDragging) {
      setTargetPos((prev) => (prev.x === 0 && prev.y === 0 ? prev : { x: 0, y: 0 }));
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      // In a real implementation, this would be relative to the source node's center
      // For now we calculate raw delta from initial click (simulated by centering)
      setTargetPos((prev) => ({
        x: e.movementX * 2 + prev.x, // simplistic relative accumulation
        y: e.movementY * 2 + prev.y,
      }));
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      // Logic to detect intersection with a valid target node would go here
      // if (foundTarget) onConnect(foundTarget.id);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging]);

  return (
    <div className="absolute top-1/2 left-0 w-8 h-8 -translate-y-1/2 flex items-center justify-center z-50">
      <button 
        className="w-3 h-3 rounded-full bg-accent hover:scale-150 transition-transform cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100"
        onPointerDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        title="Drag to connect"
      />
      
      {isDragging && (
        <svg 
          ref={lineRef as any}
          className="absolute inset-0 pointer-events-none" 
          style={{ overflow: 'visible', zIndex: -1 }}
        >
          {/* Subtle bezier curve simulating tension */}
          <path
            d={`M 4 4 Q ${endX / 2} ${endY + 20} ${endX + 4} ${endY + 4}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1 + tension * 2}
            opacity={0.3 + tension * 0.4}
            className="text-accent"
          />
          <circle cx={endX + 4} cy={endY + 4} r="4" className="fill-accent" />
        </svg>
      )}
    </div>
  );
};
