"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";

interface WorkspaceIntroProps {
  workspaceName: string;
  onComplete: () => void;
}

export const WorkspaceIntro: React.FC<WorkspaceIntroProps> = ({
  workspaceName,
  onComplete,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const mediaMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaMotion.matches) {
      onComplete(); // Skip onboarding if reduced motion is active
      return;
    }

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalHeight = rect.height - window.innerHeight;
      if (totalHeight <= 0) return;

      const rawProgress = -rect.top / totalHeight;
      const clampedProgress = Math.max(0, Math.min(1, rawProgress));
      setProgress(clampedProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [onComplete]);

  // Stage progress thresholds
  const stage0TextOpacity = Math.max(0, 1 - progress * 4); // Text fades out from 0% to 25%
  const textLeftOffset = -progress * 250; // Drifts left
  const textRightOffset = progress * 250; // Drifts right

  const nodeScale = progress < 0.2 ? 0.8 : Math.max(0.5, 1 - (progress - 0.2) * 1.5); // Card collapses
  const nodesRevealOpacity = progress < 0.25 ? 0 : Math.min(1, (progress - 0.25) * 4); // Nodes appear 25%+
  const linesRevealProgress = progress < 0.5 ? 0 : Math.min(1, (progress - 0.5) * 4); // Lines sprout 50%+
  const ctaOpacity = progress < 0.8 ? 0 : Math.min(1, (progress - 0.8) * 5); // CTA shows 80%+

  return (
    <div
      ref={containerRef}
      className="relative h-[450vh] w-full bg-background select-none overflow-x-hidden"
    >
      {/* Sticky view frame */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* 1. SCROLL-DRIVEN TYPOGRAPHY (Stage 0) */}
        <div
          style={{ opacity: stage0TextOpacity }}
          className="absolute z-20 flex flex-col items-center text-center px-6 transition-opacity duration-300 pointer-events-none"
        >
          <span className="text-xs font-mono text-accent uppercase tracking-widest mb-4">
            Initializing {workspaceName}
          </span>
          <h2 className="text-[5vw] leading-none font-display font-medium uppercase tracking-tighter flex gap-[4vw]">
            <span
              style={{ transform: `translate3d(${textLeftOffset}px, 0, 0)` }}
              className="inline-block transition-transform duration-75 ease-out"
            >
              YOUR
            </span>
            <span
              style={{ transform: `translate3d(${textRightOffset}px, 0, 0)` }}
              className="inline-block transition-transform duration-75 ease-out text-accent"
            >
              KNOWLEDGE
            </span>
          </h2>
          <span className="text-sm font-sans text-muted mt-6 max-w-xs block leading-relaxed">
            Scroll down to structure your semantic universe.
          </span>
        </div>

        {/* 2. SPATIAL NETWORK VIEW (Stage 1+) */}
        <div
          style={{
            transform: `scale(${1 - progress * 0.08})`,
            transition: "transform 100ms ease-out",
          }}
          className="relative w-full max-w-4xl h-[500px] flex items-center justify-center"
        >
          {/* SVG Connection Edges Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Center -> Node 1 (Mind) */}
            <line
              x1="50%"
              y1="50%"
              x2="25%"
              y2="20%"
              strokeDasharray="4 4"
              className="stroke-accent stroke-2 transition-all"
              style={{
                opacity: linesRevealProgress * 0.6,
                strokeDashoffset: (1 - linesRevealProgress) * 100,
              }}
            />
            {/* Center -> Node 2 (Ideas) */}
            <line
              x1="50%"
              y1="50%"
              x2="75%"
              y2="30%"
              className="stroke-accent stroke-2 transition-all"
              style={{
                opacity: linesRevealProgress * 0.6,
                strokeDashoffset: (1 - linesRevealProgress) * 100,
              }}
            />
            {/* Center -> Node 3 (Research) */}
            <line
              x1="50%"
              y1="50%"
              x2="35%"
              y2="75%"
              className="stroke-border stroke-2 transition-all"
              style={{
                opacity: linesRevealProgress * 0.4,
              }}
            />
            {/* Center -> Node 4 (Cognitive Science) */}
            <line
              x1="50%"
              y1="50%"
              x2="65%"
              y2="70%"
              className="stroke-border stroke-2 transition-all"
              style={{
                opacity: linesRevealProgress * 0.4,
              }}
            />
          </svg>

          {/* Morphing Central Card / Node */}
          <div
            style={{
              transform: `scale(${nodeScale}) translate3d(0, 0, 0)`,
              transition: "transform 100ms ease-out, width 600ms, height 600ms",
            }}
            className={`absolute flex flex-col justify-start border transition-all duration-[1000ms] cubic-bezier(0.16, 1, 0.3, 1) z-10 ${
              progress < 0.25
                ? "w-[340px] h-[200px] border-border bg-surface-subtle p-5 rounded-2xl opacity-100 shadow-2xl"
                : "w-36 h-10 border-accent bg-accent text-accent-foreground rounded-full items-center justify-center p-2 text-center shadow-lg shadow-accent/20"
            }`}
          >
            {progress < 0.25 ? (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center border-b border-border pb-2 mb-1">
                  <span className="text-[8px] font-mono text-muted uppercase">ROOT_CONCEPT</span>
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                </div>
                <h4 className="text-sm font-display font-medium text-foreground uppercase">
                  Workspace Core
                </h4>
                <p className="text-[10px] font-sans text-muted leading-relaxed">
                  Every note catalogued here is a concept, dynamically linked based on context and relevance.
                </p>
              </div>
            ) : (
              <span className="text-xs font-display font-medium tracking-tight whitespace-nowrap">
                Workspace Root
              </span>
            )}
          </div>

          {/* Peripheral concept node elements */}
          {/* Node 1: Mind */}
          <div
            style={{ opacity: nodesRevealOpacity }}
            className="absolute top-[20%] left-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 transition-all duration-300"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-foreground border border-background shadow-md animate-breathe" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted">Mind</span>
          </div>

          {/* Node 2: Ideas */}
          <div
            style={{ opacity: nodesRevealOpacity }}
            className="absolute top-[30%] left-[75%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 transition-all duration-300"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-foreground border border-background shadow-md" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted">Ideas</span>
          </div>

          {/* Node 3: Research */}
          <div
            style={{ opacity: nodesRevealOpacity }}
            className="absolute top-[75%] left-[35%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 transition-all duration-300"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-border border border-background shadow-md" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted">
              Research
            </span>
          </div>

          {/* Node 4: Cognitive Science */}
          <div
            style={{ opacity: nodesRevealOpacity }}
            className="absolute top-[70%] left-[65%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 transition-all duration-300"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-border border border-background shadow-md" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted">
              Cognitive
            </span>
          </div>
        </div>

        {/* 3. ENTER INTERACTION BUTTON (Stage 3) */}
        <div
          style={{
            opacity: ctaOpacity,
            pointerEvents: progress >= 0.8 ? "auto" : "none",
          }}
          className="absolute bottom-16 flex flex-col items-center gap-4 transition-all duration-[600ms] ease-out z-30"
        >
          <span className="text-xs font-sans text-muted tracking-wide">
            Universe construction complete.
          </span>
          <Magnetic radius={36} maxOffset={8}>
            <Button
              variant="primary"
              size="lg"
              onClick={onComplete}
              className="shadow-xl shadow-accent/10 text-xs font-mono uppercase tracking-widest"
            >
              Enter Workspace
            </Button>
          </Magnetic>
        </div>

        {/* Progress scroll bar slider */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-0.5 h-32 bg-border/30 rounded-full select-none pointer-events-none hidden md:block">
          <div
            style={{ height: `${progress * 100}%` }}
            className="w-full bg-accent rounded-full transition-all duration-75"
          />
        </div>
      </div>
    </div>
  );
};
export default WorkspaceIntro;
