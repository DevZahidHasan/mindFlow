"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createNodeAction, updateNodeAction } from "../../actions/knowledge-actions";
import { KnowledgeNode } from "../../schemas/node.schema";
import { useSpring, SPRING_PRESETS } from "@/lib/hooks/use-spring";
import { RelatedPanel } from "../related-knowledge/related-panel";
import { RelationshipLine } from "../relationship-editor/relationship-line";
import { InspectorPortal } from "@/features/app-shell/context/inspector-context";

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

  const [summaryState, setSummaryState] = useState<"IDLE" | "UNDERSTANDING" | "DISTILLING" | "FORMING" | "READY">("IDLE");
  const [summaryText, setSummaryText] = useState<string>(initialNote?.metadata?.ai_summary || "");

  // Note -> Node Transformation Physics
  // 1 when node is persisted, 0 when draft
  const isPersisted = nodeId !== undefined && saveState !== "DRAFT";
  const nodePresenceSpring = useSpring(isPersisted ? 1 : 0, SPRING_PRESETS.cinematic);
  
  // Autosave indicator orbital movement
  const isSaving = saveState === "SAVING";
  const orbitSpeed = useSpring(isSaving ? 1 : 0, SPRING_PRESETS.micro);

  // Summary animation springs
  const isSummarizing = summaryState !== "IDLE" && summaryState !== "READY";
  const summaryOrbitSpring = useSpring(isSummarizing ? 1 : 0, SPRING_PRESETS.cinematic);
  const contentShrinkSpring = useSpring(isSummarizing ? 1 : 0, SPRING_PRESETS.editorial);
  const summaryRevealSpring = useSpring(summaryState === "READY" ? 1 : 0, SPRING_PRESETS.cinematic);

  const handleGenerateSummary = async () => {
    if (!nodeId || !workspaceId) return;
    
    // Sequence states based on prompt guidelines
    setSummaryState("UNDERSTANDING");
    
    const summaryRequest = import("../../../ai/actions/summary-actions").then(m => m.generateSummaryAction(workspaceId, nodeId));

    // Guarantee minimum cinematic screen time for states
    await new Promise(r => setTimeout(r, 600));
    setSummaryState("DISTILLING");
    
    await new Promise(r => setTimeout(r, 600));
    setSummaryState("FORMING");

    const res = await summaryRequest;

    if (res.success && res.data) {
      setSummaryText(res.data);
      setSummaryState("READY");
    } else {
      setSummaryState("IDLE");
    }
  };

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
        <div className="w-2 h-2 rounded-full bg-accent/50 relative">
          {/* AI Summarization Orbit */}
          {summaryState !== "IDLE" && summaryState !== "READY" && (
             <div 
               className="absolute inset-[-8px] border border-dashed border-accent/40 rounded-full"
               style={{
                 opacity: summaryOrbitSpring,
                 transform: `rotate(${summaryOrbitSpring * 360}deg)`,
                 transition: 'transform 2s linear infinite'
               }}
             />
          )}
        </div>
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

        {/* AI Summarize Action */}
        {isPersisted && nodeId && (
          <div className="flex items-center gap-4 text-xs font-mono tracking-widest uppercase">
            {summaryState !== "IDLE" && summaryState !== "READY" && (
              <span className="text-accent animate-pulse">{summaryState}</span>
            )}
            <button 
              onClick={handleGenerateSummary}
              disabled={summaryState !== "IDLE" && summaryState !== "READY"}
              className="px-4 py-2 text-foreground/50 hover:text-accent transition-colors disabled:opacity-50"
            >
              Insight
            </button>
          </div>
        )}
      </header>

      {/* Editor Surface */}
      <div 
        className="flex flex-col gap-8 relative z-10 transition-transform duration-[1500ms] ease-out"
        style={{
          // Subtle spatial shift when converted to node or summarizing
          transform: `translateZ(${nodePresenceSpring * 10}px) scale(${1 - nodePresenceSpring * 0.01 - contentShrinkSpring * 0.02}) translateY(${summaryRevealSpring * 40}px)`,
          opacity: 1 - contentShrinkSpring * 0.4
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

        {/* AI Summary Display */}
        {(summaryText || summaryState === "READY") && (
          <div 
            className="pl-6 border-l border-accent/30 max-w-2xl py-2 my-4 transition-all duration-[1500ms] ease-out overflow-hidden"
            style={{
              opacity: summaryText ? 1 : summaryRevealSpring,
              maxHeight: summaryText ? '500px' : `${summaryRevealSpring * 500}px`
            }}
          >
            <p className="text-sm md:text-base font-serif italic leading-relaxed text-foreground/80">
              {summaryText}
            </p>
          </div>
        )}

        <div className="w-12 h-[1px] bg-border/50" />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Knowledge is not stored in isolated containers..."
          className="bg-transparent border-none outline-none text-lg md:text-xl font-sans font-light leading-relaxed tracking-wide text-foreground/80 resize-none min-h-[50vh] placeholder:text-muted/20"
        />
      </div>

      {/* Teleport RelatedPanel to the right Context Inspector sidebar */}
      {isPersisted && nodeId && (
        <InspectorPortal>
          <RelatedPanel currentNodeId={nodeId} workspaceId={workspaceId} content={content} />
        </InspectorPortal>
      )}
    </div>
  );
};
