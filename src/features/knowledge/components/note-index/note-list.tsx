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
      <div className="flex flex-col items-center justify-center h-[70vh] select-none text-center">
        <h2 className="text-3xl md:text-5xl font-display font-light uppercase tracking-tight text-muted/50 mb-8 leading-tight">
          YOUR KNOWLEDGE<br/>HAS NOT TAKEN<br/>SHAPE YET.
        </h2>
        <Link 
          href={`/w/${workspaceId}/import`}
          className="text-xs font-mono text-accent hover:text-foreground transition-colors tracking-widest uppercase border-b border-transparent hover:border-foreground pb-1"
        >
          Create your first idea
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-32 px-6 flex flex-col gap-8 relative overflow-hidden">
      <header className="mb-24 select-none pl-16">
        <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground/60 mb-4">
          KNOWLEDGE
        </h2>
      </header>

      <div className="flex flex-col gap-6">
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
  const scale = 1 - (distFromCenter * 0.05); // slightly shrinks to 0.95 at edges
  const opacity = Math.max(0.2, 1 - (distFromCenter * 1.2)); // fades at edges
  const translateZ = distFromCenter * -100; // moves backward at edges
  const letterSpacing = distFromCenter * 0.1; // subtly stretches text at edges

  const readingTime = note.document_metadata?.reading_time;
  const category = (note.metadata as any)?.category || 'Document';

  return (
    <Link 
      ref={itemRef}
      href={`/w/${workspaceId}/notes/${note.id}`}
      className="group flex flex-col md:flex-row items-baseline gap-4 md:gap-16 py-12 focus-visible:outline-2 focus-visible:outline-accent"
      style={{
        transform: `perspective(1000px) translateZ(${translateZ}px) scale(${scale})`,
        opacity: opacity,
      }}
    >
      <div className="text-sm font-mono text-muted-foreground/30 group-hover:text-accent transition-colors md:w-16 shrink-0 mt-2">
        {index.toString().padStart(2, '0')}
      </div>
      
      <div className="flex-1 flex flex-col gap-3">
        <h3 
          className="text-4xl md:text-5xl lg:text-6xl font-display font-light text-foreground/90 group-hover:text-foreground transition-colors"
          style={{ letterSpacing: `${-0.02 + letterSpacing}em` }}
        >
          {note.title}
        </h3>
        
        <div className="flex gap-3 text-[11px] font-sans tracking-[0.2em] uppercase text-muted-foreground/60 transition-all duration-700">
          <span>{category}</span>
          {readingTime ? (
            <>
              <span className="text-border/40">·</span>
              <span>{readingTime} min read</span>
            </>
          ) : null}
        </div>
      </div>
    </Link>
  );
};
