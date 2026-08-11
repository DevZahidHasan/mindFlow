"use client";

import * as React from "react";
import { GraphCanvas } from "../knowledge-preview/graph-canvas";
import { TextSplit } from "@/components/ui/text-split";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { useRouter } from "next/navigation";

export const Hero: React.FC = () => {
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="w-full flex flex-col min-h-screen justify-between relative overflow-hidden select-none">
      {/* Navigation bar */}
      <nav
        className={`w-full flex justify-between items-center py-6 border-b border-border/40 select-none transition-all duration-[1000ms] cubic-bezier(0.16, 1, 0.3, 1) ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <span className="font-display font-medium text-lg tracking-tight text-foreground flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
          MINDSPACE
        </span>

        <div className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-widest text-muted">
          <a
            href="#story"
            className="hover:text-foreground transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-accent"
          >
            How it works
          </a>
          <a
            href="#philosophy"
            className="hover:text-foreground transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-accent"
          >
            Philosophy
          </a>
        </div>

        <Magnetic radius={24} maxOffset={6}>
          <Button 
            variant="secondary" 
            size="sm" 
            className="font-mono text-xs"
            onClick={() => router.push("/login")}
          >
            ENTER WORKSPACE
          </Button>
        </Magnetic>
      </nav>

      {/* Hero content area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto py-12">
        {/* Left text column */}
        <div className="lg:col-span-6 flex flex-col gap-6 text-left">
          <span
            className={`text-xs font-mono text-accent uppercase tracking-widest block transition-all duration-[1000ms] cubic-bezier(0.16, 1, 0.3, 1) delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            A visual knowledge operating system
          </span>

          <h1 className="text-[length:var(--font-display-xl)] lg:text-[length:var(--font-display-2xl)] font-display font-medium tracking-tighter leading-none text-foreground uppercase">
            <TextSplit text="YOUR KNOWLEDGE" delayMs={200} className="block" />
            <TextSplit text="HAS A SHAPE." delayMs={600} className="block text-accent" />
          </h1>

          <p
            className={`text-muted text-[length:var(--font-body)] max-w-lg leading-relaxed font-sans transition-all duration-[1000ms] cubic-bezier(0.16, 1, 0.3, 1) delay-800 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Capture ideas. Discover hidden relationships. Explore everything you know as an evolving
            visual universe.
          </p>

          <div
            className={`flex gap-4 mt-4 transition-all duration-[1000ms] cubic-bezier(0.16, 1, 0.3, 1) delay-[900ms] ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Magnetic radius={30} maxOffset={8}>
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => router.push("/signup")}
              >
                Give your knowledge a shape
              </Button>
            </Magnetic>
          </div>
        </div>

        {/* Right graph column */}
        <div
          className={`lg:col-span-6 w-full transition-all duration-[1500ms] cubic-bezier(0.16, 1, 0.3, 1) delay-[1100ms] ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <GraphCanvas />
        </div>
      </div>

      {/* Scroll indicator footer */}
      <div
        className={`w-full flex justify-between items-center py-6 text-[10px] font-mono text-muted select-none transition-all duration-[1000ms] cubic-bezier(0.16, 1, 0.3, 1) delay-[1300ms] ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        <span>SCROLL TO BEGIN STORY</span>
        <svg
          className="w-4 h-4 animate-bounce"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};
export default Hero;
