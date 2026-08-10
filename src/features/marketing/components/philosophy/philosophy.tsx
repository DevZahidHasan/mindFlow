"use client";

import * as React from "react";
import { TextSplit } from "@/components/ui/text-split";

export const Philosophy: React.FC = () => {
  return (
    <section id="philosophy" className="w-full py-32 border-t border-border/40 select-none">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <span className="text-xs font-mono text-accent uppercase tracking-widest block mb-6">
          THE HUMAN EDGE
        </span>

        <h2 className="text-4xl lg:text-5xl font-display font-medium text-foreground tracking-tight uppercase leading-tight mb-8">
          <TextSplit text="YOUR THOUGHTS ARE" delayMs={100} className="block" />
          <TextSplit text="NOT DIRECTORIES." delayMs={400} className="block text-accent" />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-muted font-sans text-base leading-relaxed">
          <p>
            Standard knowledge tools force you to categorize information into files and rigid folder nesting structures before you know what they mean. This approach goes against the nature of human cognitive thought.
          </p>
          <p>
            MINDSPACE mirrors memory. Every idea sits in a spatial universe, connecting naturally based on context, relevance, and semantic association. The tool grows with you, helping you discover relationships you might have missed.
          </p>
        </div>

        {/* Big quote statement */}
        <blockquote className="mt-16 pt-8 border-t border-border/20 text-lg md:text-xl font-display text-foreground italic max-w-2xl font-light">
          "Ideas shouldn't be boxed. They should be linked."
        </blockquote>
      </div>
    </section>
  );
};
export default Philosophy;
