"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { useSpring, SPRING_PRESETS } from "@/lib/hooks/use-spring";
import { useRouter } from "next/navigation";
import { searchNodesAction } from "../../actions/knowledge-actions";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({ open, onOpenChange, workspaceId }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string, title: string, type: string }[]>([]);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Snappier transitions for opening the full-screen spatial mode
  const openProgress = useSpring(open ? 1 : 0, SPRING_PRESETS.ui);
  const searchFocus = useSpring(query.length > 0 ? 1 : 0, SPRING_PRESETS.editorial);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setTimeout(() => {
        setQuery("");
        setResults([]);
      }, 250); 
    }
  }, [open]);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([
        { id: "new", title: "Create new knowledge", type: "action" }
      ]);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const res = await searchNodesAction(query, workspaceId);
        if (res?.success && res.data) {
          const dbResults = res.data.map((n: any) => ({
            id: n.id,
            title: n.title,
            type: "node",
          }));
          setResults(dbResults.length > 0 ? dbResults : [
             { id: "new", title: `Create "${query}"`, type: "action" }
          ]);
        }
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, workspaceId]);

  if (!open && openProgress < 0.01) return null;

  const bgOpacity = openProgress * 0.98;
  const contentScale = 0.9 + openProgress * 0.1;

  const handleSelect = (id: string, type: string) => {
    onOpenChange(false);
    if (type === "action" && id === "new") {
      router.push(`/w/${workspaceId}/import`);
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
        className="w-full max-w-5xl px-8 flex flex-col items-center justify-center relative z-10"
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
          className="w-full relative mt-16 h-80 flex justify-center perspective-[1200px]"
          style={{
            opacity: searchFocus,
            transform: `translateZ(${searchFocus * 50}px)`,
          }}
        >
          {results.map((res, index) => {
            // Calculate spatial arrangement (continuous interpolation)
            const isDominant = index === 0;
            const distance = index * 60;
            const zIndex = 20 - index;
            const scale = 1 - index * 0.05;
            const yOffset = index * 75;

            return (
              <button
                key={res.id}
                onClick={() => handleSelect(res.id, res.type)}
                className="absolute flex items-center justify-between w-full max-w-2xl px-8 py-6 bg-surface border border-border/50 hover:border-accent transition-all duration-700 ease-out cursor-pointer group shadow-2xl"
                style={{
                  transform: `translateY(${yOffset}px) scale(${scale}) translateZ(${-distance}px)`,
                  zIndex,
                  opacity: 1 - index * 0.15,
                }}
              >
                <span className={`font-sans tracking-wide transition-colors ${isDominant ? 'text-2xl text-foreground' : 'text-xl text-foreground/70 group-hover:text-foreground'}`}>
                  {res.title}
                </span>
                <span className="text-xs font-mono uppercase tracking-widest text-muted group-hover:text-accent transition-colors">
                  {res.type === 'action' ? 'Create' : 'Open'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
