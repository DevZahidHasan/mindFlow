"use client";

import * as React from "react";
import { useSpring } from "@/lib/hooks/use-spring";
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

// Helper functions for continuous interpolation
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
const interpolate = (t: number, start: number, end: number) => start + t * (end - start);
const getOpacity = (t: number, startFadeIn: number, fullIn: number, startFadeOut: number, fullOut: number) => {
  if (t <= startFadeIn || t >= fullOut) return 0;
  if (t >= fullIn && t <= startFadeOut) return 1;
  if (t < fullIn) return (t - startFadeIn) / (fullIn - startFadeIn);
  return 1 - (t - startFadeOut) / (fullOut - startFadeOut);
};

export const StorySection: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [rawProgress, setRawProgress] = React.useState(0);

  // Smooth scroll progress using our heavy math spring solver to provide inertia and trailing
  const smoothProgress = useSpring(rawProgress, {
    tension: 80, // Snappier response
    friction: 20, // Clean damping
    mass: 1.0, // Natural physical feel
  });

  React.useEffect(() => {
    const mediaMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaMotion.matches) {
      setRawProgress(0.5); // Fallback to a static mid-state
      return;
    }

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalHeight = rect.height - window.innerHeight;
      if (totalHeight <= 0) return;

      const progress = -rect.top / totalHeight;
      setRawProgress(clamp(progress, 0, 1));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Compute interpolation stages based on the smoothed scroll position
  // 1. Text reveals
  const text01Opacity = getOpacity(smoothProgress, -0.1, 0.0, 0.15, 0.25);
  const text01TranslateY = (smoothProgress - 0.10) * 100;

  const text02Opacity = getOpacity(smoothProgress, 0.15, 0.25, 0.40, 0.50);
  const text02TranslateY = (smoothProgress - 0.325) * 100;

  const text03Opacity = getOpacity(smoothProgress, 0.40, 0.50, 0.65, 0.75);
  const text03TranslateY = (smoothProgress - 0.575) * 100;

  const text04Opacity = getOpacity(smoothProgress, 0.65, 0.75, 1.0, 1.1);
  const text04TranslateY = (smoothProgress - 0.875) * 100;

  // 2. Note card to pill morphing (Active between 0.05 and 0.25 progress)
  const tMorph = clamp((smoothProgress - 0.05) / 0.2, 0, 1);
  const cardWidth = interpolate(tMorph, 85, 30); // 85% to 30% width
  const cardHeight = interpolate(tMorph, 240, 40); // 240px to 40px height
  const cardPadding = interpolate(tMorph, 20, 8); // Padding decreases
  const cardBg = tMorph > 0.8 ? "var(--color-accent)" : "var(--color-surface-subtle)";
  const cardBorder = tMorph > 0.8 ? "var(--color-accent)" : "var(--color-border)";
  const cardTextCol = tMorph > 0.8 ? "var(--color-accent-foreground)" : "var(--color-foreground)";
  const cardRadius = interpolate(tMorph, 16, 9999); // Becomes a pill

  // 3. Sprouting lines (Active between 0.25 and 0.50 progress)
  const tSprout = clamp((smoothProgress - 0.25) / 0.25, 0, 1);
  const lineSproutLength = tSprout * 100; // Stroke dashoffset slider

  // 4. Mesh expansion (Active between 0.50 and 0.75 progress)
  const tMesh = clamp((smoothProgress - 0.5) / 0.25, 0, 1);
  const meshOpacity = tMesh * 0.4;

  // 5. AI suggestion glow and tooltip (Active between 0.75 and 0.98 progress)
  const tAI = clamp((smoothProgress - 0.75) / 0.23, 0, 1);
  const aiTooltipTranslateY = (1 - tAI) * 12;

  return (
    <div ref={containerRef} id="story" className="relative h-[400vh] w-full mt-24">
      {/* Sticky view frame */}
      <div className="sticky top-0 h-[100dvh] w-full flex items-center overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full max-w-[1400px] mx-auto px-6 md:px-12 items-center">
          
          {/* Left panel: Story text descriptions (Continuous scroll slides) */}
          <div className="lg:col-span-5 flex flex-col gap-6 relative h-[260px] lg:h-[320px] justify-center">
            
            {/* Step 1 */}
            <div
              style={{
                opacity: text01Opacity,
                transform: `translate3d(0, ${text01TranslateY}px, 0)`,
                pointerEvents: text01Opacity > 0.5 ? "auto" : "none",
              }}
              className="absolute inset-x-0 flex flex-col gap-4 will-change-[transform,opacity]"
            >
              <div className="text-xs font-mono text-accent uppercase tracking-widest">
                Step 01 / Product Journey
              </div>
              <h3 className="text-3xl font-display font-medium text-foreground tracking-tight">
                {steps[0].title}
              </h3>
              <div className="text-sm font-semibold text-foreground">{steps[0].tagline}</div>
              <p className="text-sm text-muted leading-relaxed font-sans">
                {steps[0].description}
              </p>
            </div>

            {/* Step 2 */}
            <div
              style={{
                opacity: text02Opacity,
                transform: `translate3d(0, ${text02TranslateY}px, 0)`,
                pointerEvents: text02Opacity > 0.5 ? "auto" : "none",
              }}
              className="absolute inset-x-0 flex flex-col gap-4 will-change-[transform,opacity]"
            >
              <div className="text-xs font-mono text-accent uppercase tracking-widest">
                Step 02 / Product Journey
              </div>
              <h3 className="text-3xl font-display font-medium text-foreground tracking-tight">
                {steps[1].title}
              </h3>
              <div className="text-sm font-semibold text-foreground">{steps[1].tagline}</div>
              <p className="text-sm text-muted leading-relaxed font-sans">
                {steps[1].description}
              </p>
            </div>

            {/* Step 3 */}
            <div
              style={{
                opacity: text03Opacity,
                transform: `translate3d(0, ${text03TranslateY}px, 0)`,
                pointerEvents: text03Opacity > 0.5 ? "auto" : "none",
              }}
              className="absolute inset-x-0 flex flex-col gap-4 will-change-[transform,opacity]"
            >
              <div className="text-xs font-mono text-accent uppercase tracking-widest">
                Step 03 / Product Journey
              </div>
              <h3 className="text-3xl font-display font-medium text-foreground tracking-tight">
                {steps[2].title}
              </h3>
              <div className="text-sm font-semibold text-foreground">{steps[2].tagline}</div>
              <p className="text-sm text-muted leading-relaxed font-sans">
                {steps[2].description}
              </p>
            </div>

            {/* Step 4 */}
            <div
              style={{
                opacity: text04Opacity,
                transform: `translate3d(0, ${text04TranslateY}px, 0)`,
                pointerEvents: text04Opacity > 0.5 ? "auto" : "none",
              }}
              className="absolute inset-x-0 flex flex-col gap-4 will-change-[transform,opacity]"
            >
              <div className="text-xs font-mono text-accent uppercase tracking-widest">
                Step 04 / Product Journey
              </div>
              <h3 className="text-3xl font-display font-medium text-foreground tracking-tight">
                {steps[3].title}
              </h3>
              <div className="text-sm font-semibold text-foreground">{steps[3].tagline}</div>
              <p className="text-sm text-muted leading-relaxed font-sans">
                {steps[3].description}
              </p>
            </div>

          </div>

          {/* Right panel: Visual interactive transformations */}
          <div className="lg:col-span-7 h-[340px] lg:h-[420px] w-full bg-surface border border-border rounded-2xl flex items-center justify-center relative shadow-xl overflow-hidden select-none">
            {/* Background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

            {/* SVG Connection Lines Layer (Interactive stroke-dashoffset growth) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {/* Connection: Center -> Mind */}
              <line
                x1="50%"
                y1="50%"
                x2="20%"
                y2="20%"
                strokeDasharray="120"
                strokeDashoffset={interpolate(tSprout, 120, 0)}
                className="stroke-accent stroke-2"
                style={{ opacity: tSprout * 0.6 }}
              />
              {/* Connection: Center -> Research */}
              <line
                x1="50%"
                y1="50%"
                x2="75%"
                y2="25%"
                strokeDasharray="120"
                strokeDashoffset={interpolate(tSprout, 120, 0)}
                className="stroke-accent stroke-2"
                style={{ opacity: tSprout * 0.6 }}
              />
              {/* Connection: Center -> Ideas */}
              <line
                x1="50%"
                y1="50%"
                x2="30%"
                y2="75%"
                strokeDasharray="120"
                strokeDashoffset={interpolate(tSprout, 120, 0)}
                className="stroke-border stroke-2"
                style={{ opacity: tSprout * 0.4 }}
              />
              
              {/* Mesh connection: Mind -> Research (Stage 3 Explore) */}
              <line
                x1="20%"
                y1="20%"
                x2="75%"
                y2="25%"
                strokeDasharray="200"
                strokeDashoffset={interpolate(tMesh, 200, 0)}
                className="stroke-border stroke-2"
                style={{ opacity: meshOpacity * 0.6 }}
              />
              {/* Mesh connection: Ideas -> Creativity (Stage 3 Explore) */}
              <line
                x1="30%"
                y1="75%"
                x2="70%"
                y2="70%"
                strokeDasharray="150"
                strokeDashoffset={interpolate(tMesh, 150, 0)}
                className="stroke-border stroke-2"
                style={{ opacity: meshOpacity * 0.8 }}
              />
              
              {/* AI suggested Edge (Pulsing and drawing in discover) */}
              <line
                x1="15%"
                y1="45%"
                x2="70%"
                y2="70%"
                strokeDasharray="220"
                strokeDashoffset={interpolate(tAI, 220, 0)}
                className="stroke-accent stroke-3 animate-breathe"
                style={{ opacity: tAI }}
              />
            </svg>

            {/* Central Morphing Note Card / Node */}
            <div
              style={{
                width: `${cardWidth}%`,
                height: `${cardHeight}px`,
                padding: `${cardPadding}px`,
                backgroundColor: cardBg,
                borderColor: cardBorder,
                color: cardTextCol,
                borderRadius: `${cardRadius}px`,
              }}
              className="absolute border flex flex-col justify-start z-10 overflow-hidden shadow-2xl transition-colors duration-300"
            >
              {tMorph < 0.8 ? (
                <div
                  style={{ opacity: 1 - tMorph * 1.5 }}
                  className="flex flex-col gap-2 w-full h-full"
                >
                  <div className="flex justify-between items-center border-b border-border pb-2.5 mb-1 select-none">
                    <span className="text-[8px] font-mono text-muted uppercase">NOTE_EDITOR.md</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                  </div>
                  <h4 className="text-base font-display font-medium">Cognitive Mapping Insights</h4>
                  <p className="text-xs font-sans text-muted leading-relaxed mt-1">
                    We organize documents in files, but human memory works associationally. MINDSPACE bridges this gap...
                  </p>
                  <Skeleton variant="pulse" className="h-3 w-3/4 mt-2" />
                  <Skeleton variant="pulse" className="h-3 w-1/2 mt-1" />
                </div>
              ) : (
                <span
                  style={{ opacity: (tMorph - 0.8) * 5 }}
                  className="text-xs font-display font-medium tracking-tight whitespace-nowrap m-auto"
                >
                  Cognitive Map
                </span>
              )}
            </div>

            {/* Peripheral Graph Nodes */}
            {/* Mind Node */}
            <div
              style={{
                opacity: tSprout,
                transform: `scale(${interpolate(tSprout, 0.75, 1)})`,
              }}
              className="absolute top-[20%] left-[20%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10"
            >
              <div className="w-4 h-4 rounded-full bg-foreground border border-background shadow-md" />
              <span className="text-[9px] font-display font-medium text-muted whitespace-nowrap">
                Mind
              </span>
            </div>

            {/* Research Node */}
            <div
              style={{
                opacity: tSprout,
                transform: `scale(${interpolate(tSprout, 0.75, 1)})`,
              }}
              className="absolute top-[25%] left-[75%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10"
            >
              <div className="w-4 h-4 rounded-full bg-foreground border border-background shadow-md" />
              <span className="text-[9px] font-display font-medium text-muted whitespace-nowrap">
                Research
              </span>
            </div>

            {/* Ideas Node */}
            <div
              style={{
                opacity: tSprout,
                transform: `scale(${interpolate(tSprout, 0.75, 1)})`,
              }}
              className="absolute top-[75%] left-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10"
            >
              <div className="w-4 h-4 rounded-full bg-border border border-background shadow-md" />
              <span className="text-[9px] font-display font-medium text-muted whitespace-nowrap">
                Ideas
              </span>
            </div>

            {/* Creativity Node (Stage 3 Explore) */}
            <div
              style={{
                opacity: tMesh,
                transform: `scale(${interpolate(tMesh, 0.75, 1)})`,
              }}
              className="absolute top-[70%] left-[70%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10"
            >
              <div className="w-4 h-4 rounded-full bg-border border border-background shadow-md" />
              <span className="text-[9px] font-display font-medium text-muted whitespace-nowrap">
                Creativity
              </span>
            </div>

            {/* AI Node (Stage 4 Discover) */}
            <div
              style={{
                opacity: tAI,
                transform: `scale(${interpolate(tAI, 0.75, 1)})`,
              }}
              className="absolute top-[45%] left-[15%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10"
            >
              <div className="w-5 h-5 rounded-full bg-accent border border-background shadow-lg shadow-accent/20 animate-[breathe_3s_ease-in-out_infinite]" />
              <span className="text-[9px] font-display font-medium text-accent whitespace-nowrap">
                Artificial Intelligence
              </span>
            </div>

            {/* AI Suggestion Tooltip (Stage 4 Discover) */}
            <div
              style={{
                opacity: tAI,
                transform: `translate3d(0, ${aiTooltipTranslateY}px, 0)`,
              }}
              className="absolute top-[55%] left-[28%] p-3 bg-surface border border-accent/40 rounded-xl shadow-2xl flex flex-col gap-0.5 pointer-events-none z-20"
            >
              <span className="text-[8px] font-mono text-accent uppercase tracking-widest font-semibold">
                AI RELATIONSHIP DISCOVERY
              </span>
              <span className="text-[10px] text-foreground font-sans">
                Suggested connection found by context
              </span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
export default StorySection;
