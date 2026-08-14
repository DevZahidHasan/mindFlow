"use client";

import React, { useEffect, useState } from "react";
import { SemanticConnection } from "@/lib/ai/types";
import { useRouter } from "next/navigation";

interface RelatedPanelProps {
  currentNodeId: string;
  workspaceId: string;
  content: string;
}

const ConnectionCard = ({ 
  n, 
  workspaceId, 
  currentNodeId 
}: { 
  n: SemanticConnection; 
  workspaceId: string;
  currentNodeId: string;
}) => {
  const router = useRouter();
  const [status, setStatus] = useState<"SUGGESTED" | "CONNECTING" | "CONNECTED">(
    n.isConnected ? "CONNECTED" : "SUGGESTED"
  );

  useEffect(() => {
    if (n.isConnected) {
      setStatus("CONNECTED");
    }
  }, [n.isConnected]);

  const isConnecting = status === "CONNECTING";
  const isConnected = status === "CONNECTED";

  const handleConnect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status !== "SUGGESTED") return;

    setStatus("CONNECTING");
    
    try {
      const { acceptSemanticRelationshipAction } = await import("../../actions/edge-actions");
      const res = await acceptSemanticRelationshipAction(workspaceId, currentNodeId, n.targetNodeId);
      
      if (res.success) {
        setStatus("CONNECTED");
        router.refresh();
      } else {
        setStatus("SUGGESTED");
      }
    } catch (err) {
      setStatus("SUGGESTED");
    }
  };

  const handleExplore = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/w/${workspaceId}/notes/${n.targetNodeId}`);
  };

  return (
    <div 
      className={`w-full p-4 rounded-xl border transition-all duration-300 flex flex-col gap-3 ${
        isConnected 
          ? "bg-accent/5 border-accent/40 shadow-[0_0_15px_rgba(212,175,55,0.08)]" 
          : "bg-surface/90 hover:bg-surface border-border/70 hover:border-accent/50 shadow-md"
      }`}
    >
      {/* Top row: Indicator dot + Note title */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isConnected ? "bg-accent shadow-[0_0_8px_var(--color-accent)]" : "bg-muted-foreground/60"
            }`}
          />
          <h4 className="font-sans font-semibold text-sm text-foreground truncate">
            {n.title}
          </h4>
        </div>

        {isConnected ? (
          <span className="text-[10px] font-mono uppercase tracking-wider text-accent bg-accent/15 px-2 py-0.5 rounded-full shrink-0 font-semibold">
            ✓ Connected
          </span>
        ) : (
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-surface-subtle px-2 py-0.5 rounded-full shrink-0">
            Suggested
          </span>
        )}
      </div>

      {/* Explanation / Context */}
      {n.explanation && (
        <p className="text-xs text-muted leading-relaxed font-sans line-clamp-2">
          {n.explanation}
        </p>
      )}

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2 pt-1">
        {!isConnected && (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="flex-1 py-2 px-3 rounded-lg bg-accent text-black font-semibold text-xs font-sans hover:bg-accent/90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            title="Create permanent connection line in 3D Universe"
          >
            {isConnecting ? (
              <>
                <div className="w-2 h-2 rounded-full bg-black animate-ping" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span className="text-sm font-bold leading-none">+</span>
                <span>Connect</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={handleExplore}
          className={`py-2 px-3 rounded-lg border text-xs font-sans font-medium transition-all cursor-pointer flex items-center justify-center gap-1 ${
            isConnected
              ? "flex-1 bg-surface border-border hover:border-accent text-foreground hover:bg-surface-subtle"
              : "bg-surface-subtle hover:bg-surface border-border/80 text-muted-foreground hover:text-foreground"
          }`}
          title="Open note in editor"
        >
          <span>Open Note</span>
          <span className="text-xs">↗</span>
        </button>
      </div>
    </div>
  );
};

export const RelatedPanel: React.FC<RelatedPanelProps> = ({ currentNodeId, workspaceId, content }) => {
  const [suggestions, setSuggestions] = useState<SemanticConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!workspaceId || !currentNodeId) return;

    const timer = setTimeout(() => {
      setIsLoading(true);
      import("../../../ai/actions/ai-actions").then(async (m) => {
        const res = await m.getRelationshipSuggestionsAction(workspaceId, currentNodeId, content);
        if (res.success && res.data) {
          setSuggestions(res.data);
        }
        setIsLoading(false);
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [content, workspaceId, currentNodeId]);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Side Panel Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <span className="text-[10px] font-mono text-muted uppercase tracking-widest">
          Semantic Orbit & Connections
        </span>
        {isLoading && (
          <span className="text-[10px] font-mono text-accent animate-pulse uppercase">
            Scanning...
          </span>
        )}
      </div>

      {/* List of Connection Cards */}
      <div className="flex flex-col gap-3">
        {suggestions.length > 0 ? (
          suggestions.map((n) => (
            <ConnectionCard 
              key={n.targetNodeId} 
              n={n} 
              workspaceId={workspaceId} 
              currentNodeId={currentNodeId} 
            />
          ))
        ) : isLoading ? (
          <div className="p-6 rounded-xl border border-border/40 bg-surface/50 flex flex-col items-center justify-center gap-2 text-center">
            <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <span className="text-xs font-mono text-muted">Analyzing connections...</span>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-border/40 bg-surface/30 flex flex-col gap-2">
            <span className="text-xs font-sans font-semibold text-foreground">
              Semantic Orbit Active
            </span>
            <p className="text-xs font-sans text-muted leading-relaxed">
              As you write, concepts sharing overlap with this note will appear here so you can connect them directly into your 3D Universe.
            </p>
          </div>
        )}
      </div>

      {/* Side Panel Telemetry Footer */}
      <div className="p-4 rounded-xl bg-surface border border-border/60 flex flex-col gap-1.5 mt-2">
        <span className="text-[9px] font-mono uppercase text-muted">Active Node Target</span>
        <span className="text-xs font-mono text-accent font-semibold">
          NOTE {currentNodeId.slice(0, 8)}
        </span>
        <span className="text-xs text-muted-foreground">Status: Connected to Universe Core</span>
      </div>
    </div>
  );
};
