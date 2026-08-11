"use client";

import React, { useMemo, useEffect, useState } from "react";
import { KnowledgeNode } from "../../schemas/node.schema";
import { usePointerPhysics } from "@/lib/hooks/use-pointer-physics";
import { SemanticConnection } from "@/lib/ai/types";
import { useRouter } from "next/navigation";

interface RelatedPanelProps {
  currentNodeId: string;
  workspaceId: string;
  content: string;
}

export const RelatedPanel: React.FC<RelatedPanelProps> = ({ currentNodeId, workspaceId, content }) => {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<SemanticConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const pointer = usePointerPhysics(undefined, {
    global: true,
    maxDisplacement: 20,
  });

  useEffect(() => {
    // Debounce fetching suggestions when content changes
    if (!content.trim() || !workspaceId || !currentNodeId) return;

    const timer = setTimeout(() => {
      setIsLoading(true);
      import("../../../ai/actions/ai-actions").then(async (m) => {
        const res = await m.getRelationshipSuggestionsAction(workspaceId, currentNodeId, content);
        if (res.success && res.data) {
          setSuggestions(res.data);
        }
        setIsLoading(false);
      });
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [content, workspaceId, currentNodeId]);

  // Spatial arrangement
  const arrangedNodes = useMemo(() => {
    if (suggestions.length === 0) {
      if (isLoading) {
        return [
          { id: "loading", title: "Analyzing semantic context...", x: 80, y: 40, opacity: 0.3, similarity: 0 },
        ];
      }
      return [
        { id: "ghost-1", title: "Type to discover connections", x: 60, y: -20, opacity: 0.2, similarity: 0 },
      ];
    }
    
    return suggestions.map((n, i) => {
      const angle = (i / suggestions.length) * Math.PI * 2;
      const radius = 60 + Math.random() * 60; // Varying orbits
      return {
        id: n.targetNodeId,
        title: n.title,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        opacity: 0.5 + (n.similarity * 0.5), // More similar = more opaque
        similarity: n.similarity,
      };
    });
  }, [suggestions, isLoading]);

  return (
    <div className="absolute right-0 top-32 w-64 h-64 pointer-events-none hidden lg:block border-l border-transparent z-10">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground/30 absolute -top-8 right-8 flex items-center gap-2">
        Semantic Orbit
        {isLoading && <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />}
      </div>
      
      <div 
        className="relative w-full h-full transition-transform duration-500 ease-out"
        style={{
          transform: `translate(${pointer.x * 0.5}px, ${pointer.y * 0.5}px)`
        }}
      >
        {arrangedNodes.map((n) => (
          <div
            key={n.id}
            onClick={() => {
               if (n.similarity > 0) router.push(`/w/${workspaceId}/notes/${n.id}`);
            }}
            className={`absolute p-2 cursor-pointer group ${n.similarity > 0 ? "pointer-events-auto" : "pointer-events-none"}`}
            style={{
              left: `calc(50% + ${n.x}px)`,
              top: `calc(50% + ${n.y}px)`,
              opacity: n.opacity,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-1.5 h-1.5 rounded-full transition-all duration-300 group-hover:scale-150" 
                style={{ backgroundColor: n.similarity > 0.8 ? 'var(--color-accent)' : 'var(--color-foreground)', opacity: n.similarity > 0 ? 0.6 : 0.2 }}
              />
              <span className="text-xs font-sans text-foreground/50 group-hover:text-foreground transition-colors whitespace-nowrap">
                {n.title}
                {n.similarity > 0 && <span className="ml-2 font-mono text-[9px] text-accent/50 opacity-0 group-hover:opacity-100 transition-opacity">{(n.similarity * 100).toFixed(0)}%</span>}
              </span>
            </div>
            
            <svg className="absolute inset-0 w-[200px] h-[200px] pointer-events-none -z-10" style={{ overflow: "visible", left: "-100px", top: "-100px" }}>
               <line 
                 x1="100" y1="100" 
                 x2={100 - n.x} y2={100 - n.y} 
                 stroke="currentColor" 
                 strokeWidth={n.similarity > 0.85 ? "1" : "0.5"} 
                 className="text-border/30 group-hover:text-accent/50 transition-colors" 
               />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
};
