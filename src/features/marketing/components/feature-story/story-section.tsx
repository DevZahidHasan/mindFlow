"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface StoryStep {
  num: string;
  title: string;
  tagline: string;
  description: string;
}

const steps: StoryStep[] = [
  {
    num: "01",
    title: "CAPTURE",
    tagline: "An idea enters MINDSPACE.",
    description:
      "Write freely in a clean, distraction-free markdown interface. Every note is treated as a discrete concept node ready to connect.",
  },
  {
    num: "02",
    title: "CONNECT",
    tagline: "Related knowledge begins forming relationships.",
    description:
      "MINDSPACE maps connections as you write. Discover links automatically or draw explicit relationships to build your personalized web.",
  },
  {
    num: "03",
    title: "EXPLORE",
    tagline: "Your knowledge becomes a visual landscape.",
    description:
      "Fly through your documents spatially. Cluster related topics, filter by theme, and trace paths of thought visually instead of looking at static folders.",
  },
  {
    num: "04",
    title: "DISCOVER",
    tagline: "AI surfaces relationships you may have missed.",
    description:
      "Let semantic intelligence traverse your graph. Discover hidden connections, cite resources automatically, and uncover insights buried deep in your notes.",
  },
];

export const StorySection: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = React.useState(0);

  React.useEffect(() => {
    // Disable scroll tracking animations under prefers-reduced-motion
    const mediaMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaMotion.matches) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      const totalHeight = rect.height - window.innerHeight;
      if (totalHeight <= 0) return;

      // Calculate progress ratio (0 to 1)
      const progress = -rect.top / totalHeight;
      let stage = Math.floor(progress * 4);

      if (stage < 0) stage = 0;
      if (stage > 3) stage = 3;

      setActiveStage(stage);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div ref={containerRef} id="story" className="relative h-[400vh] w-full mt-24">
      {/* Sticky viewport content container */}
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full max-w-6xl mx-auto px-6 md:px-12 items-center">
          
          {/* Left panel: Story text descriptions */}
          <div className="lg:col-span-5 flex flex-col gap-6 relative h-[320px] justify-center">
            {steps.map((step, idx) => {
              const isActive = activeStage === idx;
              return (
                <div
                  key={step.num}
                  className={`absolute inset-x-0 transition-all duration-500 flex flex-col gap-4 ${
                    isActive
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 translate-y-4 pointer-events-none"
                  }`}
                >
                  <div className="text-xs font-mono text-accent uppercase tracking-widest">
                    Step {step.num} / Product Journey
                  </div>
                  <h3 className="text-3xl font-display font-medium text-foreground tracking-tight">
                    {step.title}
                  </h3>
                  <div className="text-sm font-semibold text-foreground">{step.tagline}</div>
                  <p className="text-sm text-muted leading-relaxed font-sans">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right panel: Visual interactive transformations */}
          <div className="lg:col-span-7 h-[400px] w-full bg-surface border border-border rounded-2xl flex items-center justify-center p-8 relative shadow-xl overflow-hidden select-none">
            {/* Background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

            {/* STAGE 01: Capture visual (Mock writing pad) */}
            <div
              className={`absolute inset-8 flex flex-col gap-4 border border-border bg-surface-subtle p-6 rounded-xl transition-all duration-500 ${
                activeStage === 0 ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-[10px] font-mono text-muted uppercase">NOTE_EDITOR.md</span>
                <span className="w-2 h-2 rounded-full bg-accent" />
              </div>
              <h4 className="text-lg font-display font-medium">Cognitive Mapping Insights</h4>
              <p className="text-xs font-sans text-muted leading-relaxed">
                We organize documents into files, but human memory works associationally. MINDSPACE bridges this gap...
              </p>
              <Skeleton variant="pulse" className="h-3 w-3/4 mt-2" />
              <Skeleton variant="pulse" className="h-3 w-1/2" />
            </div>

            {/* STAGE 02: Connect visual (Node sprouting connections) */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                activeStage === 1 ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <svg viewBox="0 0 400 300" className="w-full h-full max-w-[360px]">
                {/* Connecting lines */}
                <line x1="200" y1="150" x2="100" y2="90" className="stroke-accent stroke-2 opacity-80" />
                <line x1="200" y1="150" x2="300" y2="100" className="stroke-accent stroke-2 opacity-80" />
                <line x1="200" y1="150" x2="200" y2="240" className="stroke-border stroke-2 opacity-40" />
                
                {/* Sprouted Nodes */}
                <circle cx="200" cy="150" r="12" className="fill-accent stroke-background stroke-2" />
                <text x="200" y="128" textAnchor="middle" className="text-[10px] font-display fill-foreground">Cognitive Map</text>

                <circle cx="100" cy="90" r="8" className="fill-foreground stroke-background stroke-2" />
                <text x="100" y="74" textAnchor="middle" className="text-[10px] font-display fill-muted">Mind</text>

                <circle cx="300" cy="100" r="8" className="fill-foreground stroke-background stroke-2" />
                <text x="300" y="84" textAnchor="middle" className="text-[10px] font-display fill-muted">Research</text>

                <circle cx="200" cy="240" r="8" className="fill-border stroke-background stroke-2" />
                <text x="200" y="260" textAnchor="middle" className="text-[10px] font-display fill-muted">Ideas</text>
              </svg>
            </div>

            {/* STAGE 03: Explore visual (Expanded network) */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                activeStage === 2 ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <svg viewBox="0 0 400 300" className="w-full h-full max-w-[360px]">
                {/* Mesh connections */}
                <line x1="200" y1="150" x2="100" y2="90" className="stroke-border stroke-2 opacity-40" />
                <line x1="200" y1="150" x2="300" y2="100" className="stroke-border stroke-2 opacity-40" />
                <line x1="200" y1="150" x2="200" y2="240" className="stroke-border stroke-2 opacity-40" />
                <line x1="100" y1="90" x2="300" y2="100" className="stroke-border stroke-2 opacity-20" />
                <line x1="100" y1="90" x2="120" y2="200" className="stroke-border stroke-2 opacity-30" />
                <line x1="200" y1="240" x2="120" y2="200" className="stroke-border stroke-2 opacity-40" />
                
                {/* Nodes */}
                <circle cx="200" cy="150" r="10" className="fill-border stroke-background stroke-2" />
                <circle cx="100" cy="90" r="8" className="fill-border stroke-background stroke-2" />
                <circle cx="300" cy="100" r="8" className="fill-border stroke-background stroke-2" />
                <circle cx="200" cy="240" r="8" className="fill-border stroke-background stroke-2" />
                <circle cx="120" cy="200" r="7" className="fill-border stroke-background stroke-2" />

                <text x="200" y="176" textAnchor="middle" className="text-[10px] font-display fill-foreground/60">Knowledge Universe Preview</text>
              </svg>
            </div>

            {/* STAGE 04: Discover visual (AI pulsing connection discovery) */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                activeStage === 3 ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <svg viewBox="0 0 400 300" className="w-full h-full max-w-[360px]">
                {/* Regular edges */}
                <line x1="200" y1="150" x2="100" y2="90" className="stroke-border stroke-2 opacity-20" />
                <line x1="200" y1="150" x2="200" y2="240" className="stroke-border stroke-2 opacity-20" />
                <line x1="200" y1="240" x2="120" y2="200" className="stroke-border stroke-2 opacity-20" />

                {/* AI suggested Edge (Pulsing Gold) */}
                <line
                  x1="100"
                  y1="90"
                  x2="200"
                  y2="240"
                  className="stroke-accent stroke-3 animate-pulse"
                />
                
                {/* Highlight Nodes */}
                <circle cx="200" cy="150" r="8" className="fill-border/40 stroke-background stroke-2" />
                <circle cx="100" cy="90" r="10" className="fill-foreground stroke-background stroke-2" />
                <circle cx="200" cy="240" r="10" className="fill-foreground stroke-background stroke-2" />

                {/* Annotation Tooltip overlay card */}
                <g transform="translate(140, 110)">
                  <rect width="130" height="46" rx="6" className="fill-surface border border-accent stroke-accent/50 stroke-1" />
                  <text x="8" y="18" className="text-[9px] font-mono fill-accent font-semibold">AI SUGGESTION</text>
                  <text x="8" y="32" className="text-[10px] font-sans fill-foreground">Linked by Semantic Context</text>
                </g>
              </svg>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
export default StorySection;
