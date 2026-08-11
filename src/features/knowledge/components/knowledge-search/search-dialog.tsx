"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSpring, SPRING_PRESETS } from "@/lib/hooks/use-spring";
import { useRouter } from "next/navigation";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({ open, onOpenChange, workspaceId }) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Cinematic transitions for opening the full-screen spatial mode
  const openProgress = useSpring(open ? 1 : 0, SPRING_PRESETS.cinematic);
  const searchFocus = useSpring(query.length > 0 ? 1 : 0, SPRING_PRESETS.editorial);

  useEffect(() => {
    if (open) {
      // Focus input with a slight delay so it doesn't conflict with transition
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setTimeout(() => setQuery(""), 500); // clear after close animation
    }
  }, [open]);

  // Prevent rendering if completely closed to save performance
  if (!open && openProgress < 0.01) return null;

  const bgOpacity = openProgress * 0.98;
  const contentScale = 0.9 + openProgress * 0.1;

  // Mock results for now
  const results = [
    { id: "new", title: "Create new note", type: "action" },
    { id: "1", title: "Artificial Intelligence", type: "node" },
    { id: "2", title: "Cognitive Science", type: "node" },
  ].filter(r => r.title.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (id: string, type: string) => {
    onOpenChange(false);
    if (type === "action" && id === "new") {
      router.push(`/w/${workspaceId}/notes/new`);
    } else {
      router.push(`/w/${workspaceId}/notes/${id}`);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ pointerEvents: open ? "auto" : "none" }}
    >
      {/* Dark spatial background */}
      <div 
        className="absolute inset-0 bg-background"
        style={{ opacity: bgOpacity }}
        onClick={() => onOpenChange(false)}
      />

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none"
        style={{ opacity: bgOpacity }}
      />

      <div 
        className="w-full max-w-4xl px-8 flex flex-col items-center justify-center relative z-10"
        style={{
          transform: `scale(${contentScale}) translateY(${(1 - openProgress) * 40}px)`,
          opacity: openProgress,
        }}
      >
        <span className="text-xs font-mono uppercase tracking-[0.3em] text-accent mb-8">
          Search Knowledge
        </span>

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What are you looking for?"
          className="w-full bg-transparent border-none outline-none text-4xl md:text-6xl lg:text-7xl font-display font-light text-center placeholder:text-muted/20 pb-4"
          onKeyDown={(e) => {
            if (e.key === "Escape") onOpenChange(false);
            if (e.key === "Enter" && results.length > 0) {
              handleSelect(results[0].id, results[0].type);
            }
          }}
        />

        {/* Spatial Results */}
        <div 
          className="w-full relative mt-16 h-64 flex justify-center perspective-[1000px]"
          style={{
            opacity: searchFocus,
            transform: `translateZ(${searchFocus * 50}px)`,
          }}
        >
          {results.map((res, index) => {
            // Calculate spatial arrangement
            const isDominant = index === 0;
            const distance = index * 40;
            const zIndex = 10 - index;
            const scale = 1 - index * 0.1;
            const yOffset = index * 60;

            return (
              <button
                key={res.id}
                onClick={() => handleSelect(res.id, res.type)}
                className="absolute flex items-center justify-between w-full max-w-md px-6 py-4 bg-surface border border-border/50 hover:border-accent transition-all duration-700 ease-out cursor-pointer group"
                style={{
                  transform: `translateY(${yOffset}px) scale(${scale}) translateZ(${-distance}px)`,
                  zIndex,
                  opacity: 1 - index * 0.2,
                }}
              >
                <span className={`font-sans tracking-wide ${isDominant ? 'text-lg text-foreground' : 'text-sm text-foreground/70'}`}>
                  {res.title}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted group-hover:text-accent">
                  {res.type === 'action' ? 'Execute' : 'Open'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
