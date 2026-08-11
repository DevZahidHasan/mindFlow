"use client";

import React, { useMemo } from "react";
import { KnowledgeNode } from "../../schemas/node.schema";
import { KnowledgeEdge } from "../../schemas/edge.schema";
import { usePointerPhysics } from "@/lib/hooks/use-pointer-physics";
import { useSpring, SPRING_PRESETS } from "@/lib/hooks/use-spring";

// Defining locally to avoid import cycle if schemas not fully exported
interface RelatedPanelProps {
  currentNodeId: string;
  relatedNodes?: Array<{ node: KnowledgeNode; edge: any }>; // Will refine types
}

export const RelatedPanel: React.FC<RelatedPanelProps> = ({ currentNodeId, relatedNodes = [] }) => {
  const pointer = usePointerPhysics(undefined, {
    global: true,
    maxDisplacement: 20,
    springConfig: SPRING_PRESETS.editorial,
  });

  // Spatial arrangement
  const arrangedNodes = useMemo(() => {
    // If we have actual related nodes, arrange them in an orbit or list.
    // For now, we simulate a few spatial concepts.
    if (relatedNodes.length === 0) {
      return [
        { id: "ghost-1", title: "Add connection", x: 60, y: -20, opacity: 0.2 },
        { id: "ghost-2", title: "Drag to connect", x: 80, y: 40, opacity: 0.1 },
      ];
    }
    
    return relatedNodes.map((n, i) => {
      const angle = (i / relatedNodes.length) * Math.PI * 2;
      const radius = 60 + Math.random() * 40;
      return {
        id: n.node.id,
        title: n.node.title,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        opacity: 0.8,
      };
    });
  }, [relatedNodes]);

  return (
    <div className="absolute right-0 top-32 w-64 h-64 pointer-events-none hidden lg:block border-l border-transparent">
      {/* Subtle indicator */}
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground/30 absolute -top-8 right-8">
        Orbit
      </div>
      
      <div 
        className="relative w-full h-full"
        style={{
          transform: `translate(${pointer.x * 0.5}px, ${pointer.y * 0.5}px)`
        }}
      >
        {arrangedNodes.map((n) => (
          <div
            key={n.id}
            className="absolute p-2 cursor-pointer pointer-events-auto group"
            style={{
              left: `calc(50% + ${n.x}px)`,
              top: `calc(50% + ${n.y}px)`,
              opacity: n.opacity,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/30 group-hover:bg-accent transition-colors" />
              <span className="text-xs font-sans text-foreground/50 group-hover:text-foreground transition-colors whitespace-nowrap">
                {n.title}
              </span>
            </div>
            
            {/* Edge line to center (current note) */}
            <svg className="absolute inset-0 w-[200px] h-[200px] pointer-events-none -z-10" style={{ overflow: "visible", left: "-100px", top: "-100px" }}>
               <line 
                 x1="100" y1="100" 
                 x2={100 - n.x} y2={100 - n.y} 
                 stroke="currentColor" 
                 strokeWidth="0.5" 
                 className="text-border/30 group-hover:text-accent/50 transition-colors" 
               />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
};
