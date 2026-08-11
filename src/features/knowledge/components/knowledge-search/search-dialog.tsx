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
  const [aiState, setAiState] = useState<"IDLE" | "THINKING" | "RETRIEVING" | "SYNTHESIZING" | "INSIGHT">("IDLE");
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Animation Springs
  const openProgress = useSpring(open ? 1 : 0, SPRING_PRESETS.ui);
  const searchFocus = useSpring(query.length > 0 && aiState === "IDLE" ? 1 : 0, SPRING_PRESETS.editorial);
  
  // AI State Animation Mapping
  const aiProgress = useSpring(
    aiState === "THINKING" ? 0.25 :
    aiState === "RETRIEVING" ? 0.5 :
    aiState === "SYNTHESIZING" ? 0.8 :
    aiState === "INSIGHT" ? 1.0 : 0,
    SPRING_PRESETS.cinematic
  );

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setTimeout(() => {
        setQuery("");
        setResults([]);
        setAiState("IDLE");
        setAiResponse(null);
      }, 250); 
    }
  }, [open]);

  useEffect(() => {
    if (aiState !== "IDLE" || query.trim().length === 0) {
      if (query.trim().length === 0) {
        setResults([{ id: "new", title: "Create new knowledge", type: "action" }]);
      }
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const res = await searchNodesAction(query, workspaceId);
        const dbResults = res?.success && res.data ? res.data.map((n: any) => ({
          id: n.id,
          title: n.title,
          type: "node",
        })) : [];
        
        setResults([
          { id: "ai", title: `Ask AI: "${query}"`, type: "ai-action" },
          ...dbResults,
          { id: "new", title: `Create "${query}"`, type: "action" }
        ]);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, workspaceId, aiState]);

  const handleAiSearch = async () => {
    if (!query.trim()) return;
    
    // Sequence states based on prompt guidelines
    setAiState("THINKING");
    
    // Start backend request in parallel
    const aiRequest = import("../../../ai/actions/ai-actions").then(m => m.askAiAction(workspaceId, query));

    // Guarantee minimum cinematic screen time for states so it looks premium
    await new Promise(r => setTimeout(r, 800));
    setAiState("RETRIEVING");
    
    await new Promise(r => setTimeout(r, 800));
    setAiState("SYNTHESIZING");

    // Wait for the actual AI to finish (it might already be done)
    const res = await aiRequest;

    if (res.success && res.data) {
      setAiResponse(res.data);
      setAiState("INSIGHT");
    } else {
      // Fallback to error or empty state
      setAiState("IDLE");
    }
  };

  const handleSelect = (id: string, type: string) => {
    if (type === "ai-action") {
      handleAiSearch();
      return;
    }
    
    onOpenChange(false);
    if (type === "action" && id === "new") {
      router.push(`/w/${workspaceId}/import`);
    } else {
      // Cinematic: Focus the node in the universe first
      router.push(`/w/${workspaceId}?tab=universe&focus=${id}`);
    }
  };

  if (!open && openProgress < 0.01) return null;

  const bgOpacity = openProgress * 0.98;
  // If AI is active, content scales differently
  const contentScale = aiState === "IDLE" ? (0.9 + openProgress * 0.1) : (1.0 - aiProgress * 0.1);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ pointerEvents: open ? "auto" : "none" }}
    >
      <div className="absolute inset-0 bg-background" style={{ opacity: bgOpacity }} onClick={() => aiState === "IDLE" && onOpenChange(false)} />
      
      {/* Grid overlay subtly reacts to AI state */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none transition-transform duration-[3000ms] ease-out"
        style={{ 
          opacity: bgOpacity * (1 - aiProgress * 0.5),
          transform: `scale(${1 + aiProgress * 0.2}) translateZ(0)`
        }}
      />

      <div 
        className="w-full h-full max-w-5xl px-8 flex flex-col items-center pt-[20vh] relative z-10 overflow-y-auto overflow-x-hidden no-scrollbar"
        style={{
          transform: `scale(${contentScale}) translateY(${(1 - openProgress) * 40}px)`,
          opacity: openProgress,
        }}
      >
        <span className="text-xs font-mono uppercase tracking-[0.3em] text-accent mb-8 transition-opacity duration-1000" style={{ opacity: aiState === "IDLE" ? 1 : 0 }}>
          Search Knowledge
        </span>

        {/* Input area acts as the gravitational center during AI states */}
        <div 
          className="w-full relative transition-all duration-[2000ms] ease-out flex justify-center"
          style={{
            transform: `translateY(${aiProgress * -10}vh) scale(${1 - aiProgress * 0.2})`,
          }}
        >
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={aiState !== "IDLE"}
            placeholder="What are you looking for?"
            className="w-full bg-transparent border-none outline-none text-4xl md:text-6xl lg:text-7xl font-display font-light text-center placeholder:text-muted/20 pb-4 disabled:opacity-80"
            onKeyDown={(e) => {
              if (e.key === "Escape") onOpenChange(false);
              if (e.key === "Enter" && results.length > 0) {
                handleSelect(results[0].id, results[0].type);
              }
            }}
          />
        </div>

        {/* AI Synthesis Visualization (Orbital convergence) */}
        {aiState !== "IDLE" && aiState !== "INSIGHT" && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center pt-24" style={{ opacity: aiProgress }}>
             <div 
               className="w-64 h-64 border border-accent/30 rounded-full animate-spin" 
               style={{ animationDuration: '10s' }}
             />
             <div 
               className="absolute w-32 h-32 border border-foreground/20 rounded-full animate-spin" 
               style={{ animationDuration: '6s', animationDirection: 'reverse' }}
             />
             <div className="absolute font-mono text-xs tracking-widest uppercase text-accent animate-pulse">
               {aiState}
             </div>
          </div>
        )}

        {/* Normal Search Results */}
        {aiState === "IDLE" && (
          <div 
            className="w-full relative mt-16 h-[50vh] flex justify-center perspective-[1200px]"
            style={{
              opacity: searchFocus,
              transform: `translateZ(${searchFocus * 50}px)`,
            }}
          >
            {results.map((res, index) => {
              const isDominant = index === 0;
              const distance = index * 60;
              const zIndex = 20 - index;
              const scale = 1 - index * 0.05;
              const yOffset = index * 75;

              const isAi = res.type === "ai-action";

              return (
                <button
                  key={res.id}
                  onClick={() => handleSelect(res.id, res.type)}
                  className={`absolute flex items-center justify-between w-full max-w-2xl px-8 py-6 bg-surface border transition-all duration-700 ease-out cursor-pointer group shadow-2xl ${
                    isAi ? "border-accent text-accent hover:bg-accent/5" : "border-border/50 hover:border-accent"
                  }`}
                  style={{
                    transform: `translateY(${yOffset}px) scale(${scale}) translateZ(${-distance}px)`,
                    zIndex,
                    opacity: 1 - index * 0.15,
                  }}
                >
                  <span className={`font-sans tracking-wide transition-colors ${isDominant ? 'text-2xl' : 'text-xl'} ${isAi ? 'text-accent' : isDominant ? 'text-foreground' : 'text-foreground/70 group-hover:text-foreground'}`}>
                    {res.title}
                  </span>
                  <span className={`text-xs font-mono uppercase tracking-widest transition-colors ${isAi ? 'text-accent' : 'text-muted group-hover:text-accent'}`}>
                    {isAi ? 'Ask' : res.type === 'action' ? 'Create' : 'Open'}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* AI Insight Rendering */}
        {aiState === "INSIGHT" && aiResponse && (
          <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
             {/* Using lazy load to avoid circular deps if any, but regular import is fine too */}
             {React.createElement(require('../../../ai/components/ai-response/ai-response').AiResponse, { response: aiResponse, workspaceId })}
          </div>
        )}
      </div>
    </div>
  );
};
