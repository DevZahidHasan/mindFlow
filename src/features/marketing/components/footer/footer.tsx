"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border/40 py-24 select-none">
      <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col gap-16">
        
        {/* Call to Action Section */}
        <div className="flex flex-col items-start gap-6 max-w-2xl">
          <span className="text-xs font-mono text-accent uppercase tracking-widest block">
            CONCLUSION OF STORY
          </span>
          <h2 className="text-5xl font-display font-medium text-foreground tracking-tighter uppercase leading-none">
            GIVE YOUR KNOWLEDGE <br /> A SHAPE.
          </h2>
          <p className="text-muted text-sm font-sans max-w-md">
            Step out of rigid folder structures and enter an evolving visual universe of ideas.
          </p>
          <div className="mt-4">
            <Magnetic radius={36} maxOffset={10}>
              <Button variant="primary" size="lg" className="font-sans">
                Enter your knowledge
              </Button>
            </Magnetic>
          </div>
        </div>

        {/* Links & Copyright section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-t border-border/20 pt-12 text-xs font-mono text-muted">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span>MINDSPACE © 2026</span>
          </div>

          <div className="flex flex-wrap gap-8">
            <Magnetic radius={20} maxOffset={4}>
              <a
                href="#story"
                className="hover:text-foreground transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-accent"
              >
                PRODUCT SHOWCASE
              </a>
            </Magnetic>
            <Magnetic radius={20} maxOffset={4}>
              <a
                href="#philosophy"
                className="hover:text-foreground transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-accent"
              >
                PHILOSOPHY
              </a>
            </Magnetic>
            <Magnetic radius={20} maxOffset={4}>
              <a
                href="/design-system"
                className="hover:text-foreground transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-accent text-accent"
              >
                DESIGN SYSTEM LAB
              </a>
            </Magnetic>
          </div>
        </div>

      </div>
    </footer>
  );
};
export default Footer;
