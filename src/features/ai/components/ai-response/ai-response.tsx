"use client";

import React, { useEffect, useState } from "react";
import { RAGResponse } from "@/lib/ai/types";
import { useSpring, SPRING_PRESETS } from "@/lib/hooks/use-spring";
import { useRouter } from "next/navigation";

interface AiResponseProps {
  response: RAGResponse;
  workspaceId: string;
}

export const AiResponse: React.FC<AiResponseProps> = ({ response, workspaceId }) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const opacity = useSpring(mounted ? 1 : 0, SPRING_PRESETS.cinematic);
  const yOffset = useSpring(mounted ? 0 : 40, SPRING_PRESETS.cinematic);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (opacity < 0.01) return null;

  return (
    <div 
      className="w-full max-w-3xl flex flex-col items-center mt-12 text-center pb-24"
      style={{
        opacity,
        transform: `translateY(${yOffset}px)`
      }}
    >
      <div className="w-px h-16 bg-gradient-to-b from-transparent to-accent/50 mb-12" />
      
      <h3 className="text-sm font-mono tracking-[0.3em] uppercase text-accent mb-8">
        Insight
      </h3>

      <div className="text-xl md:text-3xl font-display font-light leading-relaxed text-foreground/90 whitespace-pre-wrap text-left">
        {response.answer}
      </div>

      {response.citations.length > 0 && (
        <div className="w-full mt-24 border-t border-border/40 pt-16 text-left">
          <h4 className="text-xs font-mono tracking-widest uppercase text-muted mb-8">
            Sources
          </h4>
          <div className="flex flex-col gap-4">
            {response.citations.map((citation, index) => (
              <div 
                key={citation.nodeId} 
                className="group border border-neutral-800 bg-neutral-900/50 rounded-lg p-3 hover:bg-neutral-800 transition-colors cursor-pointer"
                onClick={() => router.push(`/w/${workspaceId}/notes/${citation.nodeId}`)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-neutral-500 font-mono">
                    [SOURCE {String(index + 1).padStart(2, '0')}]
                  </span>
                  <span className="text-sm font-medium text-neutral-300">
                    {citation.title}
                  </span>
                </div>
                <p className="text-sm text-neutral-400 line-clamp-2">
                  {citation.excerpt}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
