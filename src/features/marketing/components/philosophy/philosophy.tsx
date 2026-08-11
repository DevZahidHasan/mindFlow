"use client";

import * as React from "react";
import { TextSplit } from "@/components/ui/text-split";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

/**
 * Editorial Philosophy section.
 * Renders large-scale display typography, asymmetric layouts, and left-accent borders.
 * Uses staggered scroll-linked reveals to reveal content in a cascading spatial flow.
 */
export const Philosophy: React.FC = () => {
  return (
    <section
      id="philosophy"
      className="w-full py-40 border-t border-border/40 select-none relative overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col gap-20">
        
        {/* Header with Clipping Mask reveal boundary */}
        <div className="overflow-hidden py-2">
          <ScrollReveal delayMs={50} className="flex flex-col gap-1">
            <span className="text-xs font-mono text-accent uppercase tracking-widest block mb-4">
              THE HUMAN EDGE
            </span>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-display font-medium text-foreground tracking-tighter uppercase leading-none">
              <TextSplit text="YOUR THOUGHTS ARE" delayMs={100} className="block" />
              <TextSplit text="NOT DIRECTORIES." delayMs={400} className="block text-accent" />
            </h2>
          </ScrollReveal>
        </div>

        {/* Asymmetric Columns with independent staggered scroll reveals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 text-muted font-sans text-base md:text-lg leading-relaxed mt-4">
          <ScrollReveal delayMs={150}>
            <div className="border-l-2 border-accent/20 pl-6 md:pl-8 py-2">
              <p>
                Standard knowledge tools force you to categorize information into files and rigid folder
                nesting structures before you know what they mean. This approach goes against the
                associative nature of human cognitive thought.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={300}>
            <div className="border-l-2 border-border/20 pl-6 md:pl-8 py-2">
              <p>
                MINDSPACE mirrors memory. Every idea sits in a spatial universe, connecting naturally
                based on context, relevance, and semantic association. The tool grows with you,
                helping you discover relationships you might have missed.
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* Cinematic Quote with Border Drawing and delayed reveal */}
        <ScrollReveal delayMs={450} className="w-full">
          <div className="relative mt-8 pt-10 max-w-3xl">
            {/* Top divider gradient accent line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-accent via-border to-transparent" />
            <blockquote className="text-xl sm:text-2xl md:text-4xl font-display text-foreground tracking-tight italic font-light leading-snug">
              "Ideas shouldn't be boxed. They should be linked."
            </blockquote>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
export default Philosophy;
