"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { KnowledgeNode } from "../../schemas/node.schema";
import { useScrollProgress } from "@/lib/hooks/use-scroll-progress";
import { useSpring, SPRING_PRESETS } from "@/lib/hooks/use-spring";

interface NoteListProps {
  notes: KnowledgeNode[];
  workspaceId: string;
}

export const NoteList: React.FC<NoteListProps> = ({ notes, workspaceId }) => {
  // If no notes, show empty state
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] opacity-50 select-none">
        <span className="text-sm font-sans tracking-widest uppercase mb-4">No records found</span>
        <Link 
          href={`/w/${workspaceId}/notes/new`}
          className="text-xs text-accent hover:text-foreground transition-colors tracking-widest uppercase"
        >
          Create First Note →
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-32 px-6 flex flex-col gap-8 relative">
      <header className="mb-16 select-none">
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Knowledge Index
        </h2>
      </header>

      <div className="flex flex-col">
        {notes.map((note, index) => (
          <NoteListItem key={note.id} note={note} index={index + 1} workspaceId={workspaceId} />
        ))}
      </div>
    </div>
  );
};

const NoteListItem: React.FC<{ note: KnowledgeNode; index: number; workspaceId: string }> = ({ note, index, workspaceId }) => {
  const itemRef = useRef<HTMLAnchorElement>(null);
  
  // Continuous scroll mapping: from when item enters bottom to when it leaves top
  const scrollProgress = useScrollProgress({
    targetRef: itemRef,
    offset: ["start end", "end start"],
    spring: true,
    springConfig: SPRING_PRESETS.cinematic
  });

  // We want the item to be "active/dominant" when it is near the center of the screen (progress ~ 0.5)
  // Distance from center [0 = center, 1 = edge]
  const distFromCenter = Math.abs(scrollProgress - 0.5) * 2;
  
  // Cinematic transformations
  const scale = 1 - (distFromCenter * 0.1); // shrinks to 0.9 at edges
  const opacity = 1 - (distFromCenter * 0.8); // fades at edges
  const translateZ = distFromCenter * -50; // moves backward at edges

  return (
    <Link 
      ref={itemRef}
      href={`/w/${workspaceId}/notes/${note.id}`}
      className="group flex flex-col md:flex-row items-baseline gap-4 md:gap-16 py-12 border-b border-border/10 hover:border-border/50 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
      style={{
        transform: `perspective(1000px) translateZ(${translateZ}px) scale(${scale})`,
        opacity: opacity,
        // Will-change is avoided unless strictly necessary, CSS transforms are fast
      }}
    >
      <div className="text-xs font-mono text-muted-foreground/50 group-hover:text-accent transition-colors md:w-16 shrink-0">
        {index.toString().padStart(3, '0')}
      </div>
      
      <div className="flex-1 flex flex-col gap-2">
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-display font-light tracking-tight text-foreground/80 group-hover:text-foreground transition-colors">
          {note.title}
        </h3>
        
        <div 
          className="flex gap-4 text-xs font-sans tracking-widest uppercase text-muted-foreground transition-all duration-700 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
        >
          <span>{new Date(note.updated_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <span className="text-border/30">|</span>
          <span className="text-accent/50">OPEN →</span>
        </div>
      </div>
    </Link>
  );
};
