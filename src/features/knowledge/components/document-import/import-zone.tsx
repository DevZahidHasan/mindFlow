"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { importDocumentAction } from "../../actions/document-actions";
import { useSpring, SPRING_PRESETS } from "@/lib/hooks/use-spring";

type IngestionState = "IDLE" | "DRAGGING" | "READING" | "UNDERSTANDING" | "PLACING" | "READY" | "ERROR";

interface ImportZoneProps {
  workspaceId: string;
}

export const ImportZone: React.FC<ImportZoneProps> = ({ workspaceId }) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [ingestionState, setIngestionState] = useState<IngestionState>("IDLE");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });

  // Physics springs for visual state mapping
  const isDragging = ingestionState === "DRAGGING";
  const isProcessing = ["READING", "UNDERSTANDING", "PLACING"].includes(ingestionState);
  
  const dragSpring = useSpring(isDragging ? 1 : 0, SPRING_PRESETS.cinematic);
  const processingSpring = useSpring(isProcessing ? 1 : 0, SPRING_PRESETS.cinematic);
  const readySpring = useSpring(ingestionState === "READY" ? 1 : 0, SPRING_PRESETS.cinematic);

  // Process file upload sequence
  const processFile = async (file: File) => {
    if (!file) return;
    
    // Simulate deliberate cinematic reading phases
    setIngestionState("READING");
    await new Promise(r => setTimeout(r, 800));
    
    setIngestionState("UNDERSTANDING");
    await new Promise(r => setTimeout(r, 1200));
    
    setIngestionState("PLACING");
    
    const formData = new FormData();
    formData.append("workspaceId", workspaceId);
    formData.append("file", file);
    
    const result = await importDocumentAction(formData);
    
    if (result.success && result.data) {
      setIngestionState("READY");
      setTimeout(() => {
        router.push(`/w/${workspaceId}/notes/${result.data?.id}`);
      }, 1500);
    } else {
      setErrorMessage(result.error?.message || "Failed to process document.");
      setIngestionState("ERROR");
      setTimeout(() => {
        setIngestionState("IDLE");
      }, 4000);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (ingestionState === "IDLE" || ingestionState === "DRAGGING") {
      setIngestionState("DRAGGING");
      // Update pointer physics tracking
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setPointerPos({ x, y });
    }
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (ingestionState === "DRAGGING") {
      setIngestionState("IDLE");
      setPointerPos({ x: 0, y: 0 });
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setPointerPos({ x: 0, y: 0 });
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className="relative w-full h-[60vh] min-h-[400px] flex flex-col items-center justify-center overflow-hidden"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Background ambient depth */}
      <div 
        className="absolute inset-0 pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          transform: `scale(${1 + dragSpring * 0.05 - processingSpring * 0.1})`,
          opacity: 0.5 + dragSpring * 0.5
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
      </div>

      {/* Central Gravitational Field */}
      <div 
        className="relative z-10 flex flex-col items-center justify-center pointer-events-none"
        style={{
          transform: `
            translate3d(${pointerPos.x * 20 * dragSpring}px, ${pointerPos.y * 20 * dragSpring}px, 0)
            scale(${1 - dragSpring * 0.05 + readySpring * 0.1})
          `,
          opacity: ingestionState === "ERROR" ? 0.3 : 1
        }}
      >
        {/* Animated Rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-[300px] h-[300px] rounded-full border border-border/20 absolute"
            style={{ 
              transform: `scale(${1 + dragSpring * 0.2 - processingSpring * 0.5})`,
              opacity: dragSpring * 0.5 + processingSpring * 0.2
            }}
          />
          <div 
            className="w-[200px] h-[200px] rounded-full border border-accent/20 absolute"
            style={{ 
              transform: `scale(${1 - dragSpring * 0.1 + processingSpring * 0.2}) rotate(${processingSpring * 180}deg)`,
              opacity: dragSpring * 0.8 + processingSpring * 0.5,
              borderStyle: processingSpring > 0 ? "dashed" : "solid"
            }}
          />
        </div>

        {/* Dynamic Typography based on state */}
        <div className="flex flex-col items-center gap-4 transition-all duration-700">
          {ingestionState === "IDLE" && (
            <>
              <h2 className="text-2xl font-display font-light tracking-[0.2em] uppercase text-muted-foreground/80">
                Bring Knowledge In
              </h2>
              <p className="text-xs font-mono text-muted/50 tracking-widest">
                Drop document to ingest
              </p>
            </>
          )}
          {ingestionState === "DRAGGING" && (
            <h2 className="text-2xl font-display font-medium tracking-[0.2em] uppercase text-accent animate-pulse">
              Release to Ingest
            </h2>
          )}
          {ingestionState === "READING" && (
            <h2 className="text-xl font-display font-light tracking-[0.3em] uppercase text-foreground">
              Reading...
            </h2>
          )}
          {ingestionState === "UNDERSTANDING" && (
            <h2 className="text-xl font-display font-light tracking-[0.3em] uppercase text-foreground">
              Understanding...
            </h2>
          )}
          {ingestionState === "PLACING" && (
            <h2 className="text-xl font-display font-light tracking-[0.3em] uppercase text-accent">
              Placing Node...
            </h2>
          )}
          {ingestionState === "READY" && (
            <h2 className="text-xl font-display font-medium tracking-[0.2em] uppercase text-foreground">
              Knowledge Integrated
            </h2>
          )}
        </div>
      </div>

      {/* Accessible fallback */}
      <div className="absolute bottom-8 z-20">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".txt,.md,text/plain,text/markdown"
          onChange={onFileSelect}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={ingestionState !== "IDLE" && ingestionState !== "ERROR"}
          className="text-[10px] font-mono tracking-widest uppercase text-muted hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-1 disabled:opacity-0 disabled:pointer-events-none"
        >
          Select File Manually
        </button>
      </div>

      {/* Error State */}
      {ingestionState === "ERROR" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-background/80 backdrop-blur-sm">
          <p className="text-sm font-sans text-danger tracking-wide mb-4">
            {errorMessage}
          </p>
          <button 
            onClick={() => setIngestionState("IDLE")}
            className="text-xs font-mono tracking-widest uppercase border border-border/50 px-6 py-2 hover:bg-foreground/5 transition-colors"
          >
            Acknowledge
          </button>
        </div>
      )}
    </div>
  );
};
