"use client";

import * as React from "react";

interface WorkspaceIntroProps {
  workspaceName: string;
  onComplete: () => void;
}

export const WorkspaceIntro: React.FC<WorkspaceIntroProps> = ({
  workspaceName,
  onComplete,
}) => {
  const [stage, setStage] = React.useState(0);

  React.useEffect(() => {
    const mediaMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaMotion.matches) {
      onComplete(); // Skip onboarding if reduced motion is active
      return;
    }

    // Stage 1: Reveal typography
    const t1 = setTimeout(() => setStage(1), 100);
    
    // Stage 2: Fade typography, show network
    const t2 = setTimeout(() => setStage(2), 1500);

    // Stage 3: Finish and enter dashboard
    const t3 = setTimeout(() => {
      setStage(3);
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 w-full h-full bg-background select-none overflow-hidden flex flex-col items-center justify-center">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* 1. TYPOGRAPHY */}
      <div
        className={`absolute z-20 flex flex-col items-center text-center px-6 transition-all duration-1000 pointer-events-none ${
          stage === 1 ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <span className="text-xs font-mono text-accent uppercase tracking-widest mb-4">
          Initializing {workspaceName}
        </span>
        <h2 className="text-[5vw] leading-none font-display font-medium uppercase tracking-tighter flex gap-[4vw]">
          <span className="inline-block transition-transform duration-1000 ease-out">
            YOUR
          </span>
          <span className="inline-block transition-transform duration-1000 ease-out text-accent">
            KNOWLEDGE
          </span>
        </h2>
      </div>

      {/* 2. SPATIAL NETWORK VIEW */}
      <div
        className={`relative w-full max-w-4xl h-[500px] flex items-center justify-center transition-all duration-[1500ms] ease-out ${
          stage >= 2 ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-12"
        }`}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <line x1="50%" y1="50%" x2="25%" y2="20%" strokeDasharray="4 4" className="stroke-accent stroke-2 opacity-60" />
          <line x1="50%" y1="50%" x2="75%" y2="30%" className="stroke-accent stroke-2 opacity-60" />
          <line x1="50%" y1="50%" x2="35%" y2="75%" className="stroke-border stroke-2 opacity-40" />
          <line x1="50%" y1="50%" x2="65%" y2="70%" className="stroke-border stroke-2 opacity-40" />
        </svg>

        {/* Morphing Central Card / Node */}
        <div className="absolute z-10 w-[340px] h-[200px] border border-border bg-surface-subtle p-5 rounded-2xl shadow-2xl flex flex-col gap-2 transition-transform duration-[2000ms] hover:scale-105">
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

        {/* Peripheral concept node elements */}
        <div className="absolute top-[20%] left-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-foreground border border-background shadow-md animate-breathe" />
          <span className="text-[9px] font-mono uppercase tracking-widest text-muted">Mind</span>
        </div>
        <div className="absolute top-[30%] left-[75%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-foreground border border-background shadow-md" />
          <span className="text-[9px] font-mono uppercase tracking-widest text-muted">Ideas</span>
        </div>
        <div className="absolute top-[75%] left-[35%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-border border border-background shadow-md" />
          <span className="text-[9px] font-mono uppercase tracking-widest text-muted">Research</span>
        </div>
        <div className="absolute top-[70%] left-[65%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-border border border-background shadow-md" />
          <span className="text-[9px] font-mono uppercase tracking-widest text-muted">Cognitive</span>
        </div>
      </div>
    </div>
  );
};
export default WorkspaceIntro;
