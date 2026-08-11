"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createNodeAction, updateNodeAction } from "../../actions/knowledge-actions";
import { KnowledgeNode } from "../../schemas/node.schema";
import { useSpring, SPRING_PRESETS } from "@/lib/hooks/use-spring";
import { RelatedPanel } from "../related-knowledge/related-panel";
import { RelationshipLine } from "../relationship-editor/relationship-line";

type SaveState = "DRAFT" | "EDITING" | "SAVING" | "STORED";

interface NoteEditorProps {
  workspaceId: string;
  initialNote?: KnowledgeNode;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ workspaceId, initialNote }) => {
  const router = useRouter();
  const [title, setTitle] = useState(initialNote?.title || "");
  const [content, setContent] = useState(initialNote?.content || "");
  
  const [saveState, setSaveState] = useState<SaveState>(initialNote ? "STORED" : "DRAFT");
  const [nodeId, setNodeId] = useState<string | undefined>(initialNote?.id);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Note -> Node Transformation Physics
  // 1 when node is persisted, 0 when draft
  const isPersisted = nodeId !== undefined;
  const nodePresenceSpring = useSpring(isPersisted ? 1 : 0, SPRING_PRESETS.cinematic);
  
  // Autosave indicator orbital movement
  const isSaving = saveState === "SAVING";
  const orbitSpeed = useSpring(isSaving ? 1 : 0, SPRING_PRESETS.micro);

  const handleSave = useCallback(async (currentTitle: string, currentContent: string) => {
    if (!currentTitle.trim()) return;
    
    setSaveState("SAVING");
    
    // Simulate deliberate save time for perceived value
    await new Promise(r => setTimeout(r, 600));

    if (!nodeId) {
      // Create new node
      const result = await createNodeAction({
        workspace_id: workspaceId,
        title: currentTitle,
        type: "note",
        content: currentContent,
        metadata: {}
      });
      
      if (result?.success && result.data) {
        setNodeId(result.data.id);
        setSaveState("STORED");
        // Update URL without full refresh to preserve cinematic transformation
        window.history.replaceState(null, "", `/w/${workspaceId}/notes/${result.data.id}`);
      } else {
        setSaveState("EDITING"); // Revert on fail
      }
    } else {
      // Update existing node
      const result = await updateNodeAction({
        id: nodeId,
        workspace_id: workspaceId,
        title: currentTitle,
        content: currentContent,
      });
      
      if (result?.success) {
        setSaveState("STORED");
      } else {
        setSaveState("EDITING");
      }
    }
  }, [nodeId, workspaceId]);

  // Debounced Autosave Effect
  useEffect(() => {
    if (saveState === "SAVING") return;
    
    // Don't auto-save immediately on mount
    if (!title.trim() && !nodeId) return;
    
    // If we have no changes from initial, don't trigger EDITING
    if (initialNote && title === initialNote.title && content === initialNote.content && saveState === "STORED") return;

    if (saveState === "STORED") {
      setSaveState("EDITING");
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleSave(title, content);
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [title, content, handleSave, saveState, nodeId, initialNote]);

  // Keyboard shortcut to manually save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave(title, content);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [title, content, handleSave]);

  return (
    <div className="w-full max-w-3xl mx-auto min-h-screen pt-32 pb-64 px-6 md:px-12 flex flex-col relative">
      
      {/* Transformation: Contextual Node Marker */}
      <div 
        className="absolute -left-4 top-40 flex items-center justify-center pointer-events-none transition-colors"
        style={{
          opacity: nodePresenceSpring,
          transform: `scale(${nodePresenceSpring}) translateX(${(1 - nodePresenceSpring) * -20}px)`,
        }}
      >
        <div className="w-2 h-2 rounded-full bg-accent/50" />
        <div 
          className="absolute w-12 h-[1px] bg-accent/20 left-2 origin-left"
          style={{ transform: `scaleX(${nodePresenceSpring})` }}
        />
      </div>

      <header className="flex justify-between items-center mb-16 relative">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-4">
          <span>NOTE {nodeId ? nodeId.slice(0, 4) : "NEW"}</span>
          
          {/* Subtle Autosave Indicator */}
          <div className="flex items-center gap-3">
            <span className="text-muted/50">/</span>
            <span className="w-16 transition-opacity text-right">{saveState}</span>
            <div className="relative w-4 h-4 flex items-center justify-center">
              {/* Central Core */}
              <div 
                className="w-1.5 h-1.5 rounded-full transition-all duration-[1500ms] ease-out z-10"
                style={{
                  backgroundColor: saveState === "STORED" ? 'var(--color-accent)' : 'var(--color-foreground)',
                  opacity: saveState === "STORED" ? 0.8 : saveState === "DRAFT" ? 0.3 : 0.6,
                  transform: `scale(${saveState === "SAVING" ? 1.2 : 1})`,
                }}
              />
              
              {/* Outer Unstable Orbit (Draft/Editing) */}
              <div 
                className="absolute inset-0 rounded-full border border-dashed border-foreground/20 transition-all duration-1000"
                style={{
                  opacity: (saveState === "DRAFT" || saveState === "EDITING") ? 1 : 0,
                  transform: `scale(${saveState === "EDITING" ? 1.1 : 1}) rotate(${orbitSpeed * 45}deg)`,
                  transition: 'transform 2s linear infinite, opacity 1s',
                }}
              />

              {/* Contracting Orbit (Saving) */}
              <div 
                className="absolute inset-[-4px] rounded-full border border-foreground/40 transition-all duration-700"
                style={{
                  opacity: saveState === "SAVING" ? 1 : 0,
                  transform: `scale(${saveState === "SAVING" ? 0.8 : 1.2}) rotate(${orbitSpeed * 360}deg)`,
                  transition: saveState === "SAVING" ? 'transform 1s linear infinite, opacity 0.5s' : 'opacity 0.5s',
                }}
              />
              
              {/* Orbital Fragments (Saving) */}
              {saveState === "SAVING" && (
                <>
                  <div className="absolute top-0 w-1 h-1 rounded-full bg-accent/60 animate-ping" style={{ animationDuration: '1s' }} />
                  <div className="absolute bottom-0 right-0 w-0.5 h-0.5 rounded-full bg-accent/80 animate-ping" style={{ animationDuration: '0.8s', animationDelay: '0.2s' }} />
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Editor Surface */}
      <div 
        className="flex flex-col gap-8 relative z-10"
        style={{
          // Subtle spatial shift when converted to node
          transform: `translateZ(${nodePresenceSpring * 10}px) scale(${1 - nodePresenceSpring * 0.01})`,
        }}
      >
        <div className="relative">
          {isPersisted && nodeId && <RelationshipLine sourceId={nodeId} />}
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Concept"
            className="bg-transparent border-none outline-none text-4xl md:text-5xl lg:text-6xl font-display font-light tracking-tight leading-[1.1] resize-none overflow-hidden placeholder:text-muted/20 w-full pl-6 -ml-6"
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
        </div>

        <div className="w-12 h-[1px] bg-border/50" />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Knowledge is not stored in isolated containers..."
          className="bg-transparent border-none outline-none text-lg md:text-xl font-sans font-light leading-relaxed tracking-wide text-foreground/80 resize-none min-h-[50vh] placeholder:text-muted/20"
        />
      </div>

      {isPersisted && nodeId && <RelatedPanel currentNodeId={nodeId} workspaceId={workspaceId} content={content} />}
    </div>
  );
};
