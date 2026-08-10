"use client";

import * as React from "react";
import { GraphNode } from "../../data/graph-mock";

export interface DetailPanelProps {
  node: GraphNode | null;
  onClose: () => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ node, onClose }) => {
  const closeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (node) {
      // Focus close control immediately upon opening for screen readers
      closeRef.current?.focus();

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      window.addEventListener("keydown", handleEscape);
      return () => {
        window.removeEventListener("keydown", handleEscape);
      };
    }
  }, [node, onClose]);

  if (!node) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${node.label} details`}
      className="absolute inset-x-0 bottom-0 z-20 bg-surface-elevated/95 backdrop-blur-md border-t border-border p-6 rounded-b-2xl transition-transform duration-250 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-mono text-accent uppercase tracking-widest block mb-1">
            CONCEPT PROFILE
          </span>
          <h4 className="text-xl font-display font-medium text-foreground">
            {node.label}
          </h4>
        </div>
        
        <button
          ref={closeRef}
          onClick={onClose}
          className="p-1 rounded-full text-muted hover:text-foreground hover:bg-surface border border-transparent hover:border-border transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Close details panel"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="text-sm text-foreground/90 font-sans leading-relaxed mb-6">
        {node.description}
      </p>

      <div className="grid grid-cols-3 gap-4 border-t border-border/60 pt-4 font-sans text-xs">
        <div>
          <span className="text-muted block mb-1">Connections</span>
          <span className="font-semibold text-accent">{node.relatedConcepts.length} concepts</span>
        </div>
        <div>
          <span className="text-muted block mb-1">Associated Notes</span>
          <span className="font-semibold">{node.notesCount} notes</span>
        </div>
        <div>
          <span className="text-muted block mb-1">References</span>
          <span className="font-semibold">{node.referencesCount} citations</span>
        </div>
      </div>

      {/* Relational tag labels footer */}
      <div className="mt-4 flex gap-2 overflow-x-auto py-1">
        {node.relatedConcepts.map((concept) => (
          <span
            key={concept}
            className="text-[10px] bg-surface border border-border px-2 py-0.5 rounded-full text-muted font-mono select-none"
          >
            {concept}
          </span>
        ))}
      </div>
    </div>
  );
};
export default DetailPanel;
