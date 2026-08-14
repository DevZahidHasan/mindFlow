"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { useSpring, SPRING_PRESETS } from "@/lib/hooks/use-spring";
import { useRouter } from "next/navigation";
import { searchNodesAction } from "../../actions/knowledge-actions";
import { useAiSession } from "@/features/ai/context/ai-session-context";
import { ActionConfirmationCard } from "@/features/ai/components/action-confirmation-card";
import { executeCommandIntentAction } from "@/features/ai/actions/command-actions";
import { AmbiguousNodeCandidate } from "@/lib/ai/types";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

const QUICK_ACTIONS = [
  { id: "explore", label: "✦ Explore my knowledge", query: "What are the core concepts in my workspace?" },
  { id: "synthesize", label: "✦ Synthesize this workspace", query: "Summarize everything in this workspace" },
  { id: "disconnect", label: "✦ Find related concepts", query: "Which notes share related topics or connections?" },
  { id: "create", label: "✦ Create a note", query: "Create note about " },
  { id: "connect", label: "✦ Connect knowledge", query: "Connect " },
];

export const SearchDialog: React.FC<SearchDialogProps> = ({ open, onOpenChange, workspaceId }) => {
  const {
    session,
    setSession,
    appendUserMessage,
    appendAssistantMessage,
    resolveAction,
    clearSession,
  } = useAiSession();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string; title: string; type: string }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Animation Springs
  const openProgress = useSpring(open ? 1 : 0, SPRING_PRESETS.ui);
  const searchFocus = useSpring(query.length > 0 && session.messages.length === 0 ? 1 : 0, SPRING_PRESETS.editorial);

  // AI State Animation Mapping
  const isAiActive =
    session.status === "THINKING" ||
    session.status === "RETRIEVING" ||
    session.status === "SYNTHESIZING" ||
    session.status === "PROPOSING";

  const aiProgress = useSpring(
    session.status === "THINKING"
      ? 0.25
      : session.status === "RETRIEVING"
      ? 0.5
      : session.status === "SYNTHESIZING"
      ? 0.8
      : session.status === "PROPOSING"
      ? 0.95
      : session.status === "INSIGHT"
      ? 1.0
      : 0,
    SPRING_PRESETS.cinematic
  );

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.messages, session.status]);

  // Fast FTS search as user types when no active conversational thread
  useEffect(() => {
    if (session.messages.length > 0 || isAiActive) {
      setResults([]);
      return;
    }

    if (query.trim().length === 0) {
      setResults([{ id: "new", title: "Create new knowledge", type: "action" }]);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const res = await searchNodesAction(query, workspaceId);
        const dbResults =
          res?.success && res.data
            ? res.data.map((n: any) => ({
                id: n.id,
                title: n.title,
                type: "node",
              }))
            : [];

        setResults([
          { id: "ai", title: `Ask Command AI: "${query}"`, type: "ai-action" },
          ...dbResults,
          { id: "new", title: `Create "${query}"`, type: "action" },
        ]);
        setSelectedIndex(0);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [query, workspaceId, session.messages.length, isAiActive]);

  // Execute full Command & Intent Pipeline
  const handleExecuteCommand = async (commandQuery: string = query) => {
    const trimmed = commandQuery.trim();
    if (!trimmed || isAiActive) return;

    appendUserMessage(trimmed);
    setQuery("");

    // Step 1: Simulated sequence states for perceived cinematic quality
    await new Promise(r => setTimeout(r, 600));
    setSession(prev => ({ ...prev, status: "RETRIEVING" }));

    await new Promise(r => setTimeout(r, 600));
    setSession(prev => ({ ...prev, status: "SYNTHESIZING" }));

    try {
      // Build conversation history for multi-turn context
      const history = session.messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await executeCommandIntentAction(workspaceId, trimmed, history);

      if (res.success && res.data) {
        const result = res.data;

        if (result.intent === "CREATE_NODE" && result.proposedAction && result.proposedAction.type === "CREATE_NODE") {
          appendAssistantMessage(
            `I have prepared a knowledge creation proposal for "${result.proposedAction.title}". Please confirm to permanently create it:`,
            undefined,
            result.proposedAction
          );
        } else if (result.intent === "CONNECT_NODES" && result.proposedAction && result.proposedAction.type === "CONNECT_NODES") {
          appendAssistantMessage(
            `I have generated a relationship proposal between "${result.proposedAction.sourceTitle}" and "${result.proposedAction.targetTitle}". Please review and confirm:`,
            undefined,
            result.proposedAction
          );
        } else if (result.intent === "CONNECT_NODES" && result.proposedAction && result.proposedAction.type === "MULTI_CONNECT_NODES") {
          appendAssistantMessage(
            `I have generated a cluster connection proposal across ${result.proposedAction.connections.length} links. Please review and confirm:`,
            undefined,
            result.proposedAction
          );
        } else if (result.intent === "CONNECT_NODES" && result.ambiguousCandidates) {
          appendAssistantMessage(
            result.rationale || "Multiple candidate notes matched your query. Please select the intended node:",
            undefined,
            undefined,
            result.ambiguousCandidates
          );
        } else {
          appendAssistantMessage(
            result.answer || "No synthesis available.",
            result.citations || []
          );
        }
      } else {
        appendAssistantMessage(
          res.error?.message || "I encountered an issue processing your request. Please verify your workspace status."
        );
        setSession(prev => ({ ...prev, status: "ERROR" }));
      }
    } catch (err: any) {
      appendAssistantMessage("An unexpected error occurred while executing the command.");
      setSession(prev => ({ ...prev, status: "ERROR" }));
    }
  };

  const handleSelectAmbiguousCandidate = (slot: "source" | "target", candidate: AmbiguousNodeCandidate) => {
    handleExecuteCommand(`Connect ${candidate.title}`);
  };

  const handleSelect = (id: string, type: string) => {
    if (type === "ai-action") {
      handleExecuteCommand();
      return;
    }

    onOpenChange(false);
    if (type === "action" && id === "new") {
      router.push(`/w/${workspaceId}/import`);
    } else {
      router.push(`/w/${workspaceId}?tab=universe&focus=${id}`);
    }
  };

  const handleClearSession = () => {
    clearSession();
    setQuery("");
    inputRef.current?.focus();
  };

  if (!open && openProgress < 0.01) return null;

  const bgOpacity = openProgress * 0.98;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ pointerEvents: open ? "auto" : "none" }}
    >
      {/* Dark backdrop */}
      <div
        className="absolute inset-0 bg-background"
        style={{ opacity: bgOpacity }}
        onClick={() => !isAiActive && onOpenChange(false)}
      />

      {/* Grid overlay subtly reacts to AI state */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none transition-transform duration-[3000ms] ease-out"
        style={{
          opacity: bgOpacity * (1 - aiProgress * 0.5),
          transform: `scale(${1 + aiProgress * 0.1}) translateZ(0)`,
        }}
      />

      {/* Main Command Center Container */}
      <div
        className="w-full h-full max-w-4xl px-4 md:px-8 flex flex-col items-center pt-[10vh] pb-12 relative z-10 overflow-y-auto no-scrollbar"
        style={{
          opacity: openProgress,
        }}
      >
        {/* Top Header Mode Indicators */}
        <div className="flex items-center justify-between w-full max-w-2xl mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-accent font-semibold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              MINDSPACE AI Command Center
            </span>
          </div>

          <div className="flex items-center gap-3">
            {session.messages.length > 0 && (
              <button
                onClick={handleClearSession}
                className="text-xs font-mono uppercase tracking-widest text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                Clear History
              </button>
            )}
            <kbd className="text-[10px] font-mono text-muted/60 bg-surface px-2 py-0.5 rounded border border-border/40">
              ESC
            </kbd>
          </div>
        </div>

        {/* Search & Prompt Input Cockpit */}
        <div className="w-full max-w-2xl relative mb-6">
          <div className="w-full p-2 bg-surface/90 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl focus-within:border-accent/80 transition-all flex items-center gap-3">
            <span className="text-accent text-lg pl-3 font-mono">✦</span>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              disabled={isAiActive}
              placeholder={
                session.messages.length > 0
                  ? "Ask follow-up question or command..."
                  : "Search concepts, ask questions, or propose actions..."
              }
              className="w-full bg-transparent border-none outline-none text-base md:text-lg font-sans font-light text-foreground placeholder:text-muted/40 disabled:opacity-60"
              onKeyDown={e => {
                if (e.key === "Escape") onOpenChange(false);
                if (e.key === "ArrowDown" && results.length > 0) {
                  e.preventDefault();
                  setSelectedIndex(prev => (prev + 1) % results.length);
                }
                if (e.key === "ArrowUp" && results.length > 0) {
                  e.preventDefault();
                  setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
                }
                if (e.key === "Enter") {
                  if (results.length > 0 && session.messages.length === 0) {
                    handleSelect(results[selectedIndex]?.id, results[selectedIndex]?.type);
                  } else {
                    handleExecuteCommand();
                  }
                }
              }}
            />
            <button
              onClick={() => handleExecuteCommand()}
              disabled={!query.trim() || isAiActive}
              className="px-4 py-2 bg-accent text-black font-semibold text-xs font-sans rounded-xl hover:bg-accent/90 active:scale-95 transition-all cursor-pointer disabled:opacity-40 shrink-0 min-h-[36px]"
            >
              Run ↵
            </button>
          </div>
        </div>

        {/* Ambient Quick Actions (when idle and no message history) */}
        {session.messages.length === 0 && !query.trim() && (
          <div className="w-full max-w-2xl flex flex-wrap gap-2.5 justify-center py-4 animate-in fade-in duration-700">
            {QUICK_ACTIONS.map(action => (
              <button
                key={action.id}
                onClick={() => {
                  setQuery(action.query);
                  inputRef.current?.focus();
                }}
                className="px-3.5 py-2 rounded-xl bg-surface/60 hover:bg-surface border border-border/60 hover:border-accent/40 text-xs font-mono text-muted hover:text-foreground transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Conversational Stream Area (Multi-turn History) */}
        {session.messages.length > 0 && (
          <div className="w-full max-w-2xl flex flex-col gap-6 my-4">
            {session.messages.map(turn => (
              <div
                key={turn.id}
                className={`flex flex-col gap-2.5 ${
                  turn.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {/* Role badge */}
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
                  {turn.role === "user" ? "You" : "Command AI"}
                </span>

                {/* Content Bubble */}
                <div
                  className={`p-4 rounded-2xl max-w-full md:max-w-xl text-sm font-sans leading-relaxed ${
                    turn.role === "user"
                      ? "bg-accent/15 border border-accent/30 text-foreground font-medium rounded-tr-sm"
                      : "bg-surface border border-border/70 text-foreground/90 rounded-tl-sm shadow-xl"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{turn.content}</p>

                  {/* Proposed Action Confirmation Card */}
                  {turn.proposedAction && (
                    <div className="mt-4">
                      <ActionConfirmationCard
                        proposal={turn.proposedAction}
                        workspaceId={workspaceId}
                        isResolved={turn.isActionResolved}
                        onResolved={() => resolveAction(turn.id)}
                      />
                    </div>
                  )}

                  {/* Ambiguous Note Disambiguation Selector */}
                  {turn.ambiguousCandidates && (
                    <div className="mt-4 flex flex-col gap-2 p-3 bg-surface-subtle rounded-xl border border-border/50">
                      <span className="text-[10px] font-mono uppercase text-accent font-semibold">
                        Select Matching Note:
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {turn.ambiguousCandidates.candidates.map(candidate => (
                          <button
                            key={candidate.id}
                            onClick={() =>
                              handleSelectAmbiguousCandidate(
                                turn.ambiguousCandidates!.slot,
                                candidate
                              )
                            }
                            className="text-left px-3 py-2 rounded-lg bg-surface hover:bg-accent/10 border border-border/40 hover:border-accent text-xs font-sans text-foreground transition-all flex items-center justify-between"
                          >
                            <span className="font-medium truncate">{candidate.title}</span>
                            <span className="text-[10px] font-mono text-muted uppercase">
                              Select ↗
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Citations list */}
                  {turn.citations && turn.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/40 flex flex-col gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
                        Sources & Grounding:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {turn.citations.map((c, i) => (
                          <div
                            key={c.nodeId}
                            onClick={() => {
                              onOpenChange(false);
                              router.push(`/w/${workspaceId}/notes/${c.nodeId}`);
                            }}
                            className="p-2.5 rounded-lg bg-surface-subtle hover:bg-surface border border-border/50 hover:border-accent transition-all cursor-pointer flex flex-col gap-0.5"
                          >
                            <span className="text-xs font-sans font-semibold text-foreground truncate">
                              [{i + 1}] {c.title}
                            </span>
                            <p className="text-[11px] text-muted line-clamp-1">{c.excerpt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* AI Thinking Animation Spinner */}
        {isAiActive && (
          <div className="my-8 flex flex-col items-center justify-center gap-3">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="w-16 h-16 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
              <div className="absolute w-8 h-8 border-2 border-foreground/10 border-b-accent rounded-full animate-spin" style={{ animationDirection: "reverse" }} />
              <span className="absolute text-xs">✦</span>
            </div>
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-accent animate-pulse">
              {session.status}
            </span>
          </div>
        )}

        {/* Real-time FTS Search Results (when typing query without conversation) */}
        {session.messages.length === 0 && query.trim() && !isAiActive && (
          <div className="w-full max-w-2xl flex flex-col gap-2 mt-4">
            {results.map((res, index) => {
              const isSelected = index === selectedIndex;
              const isAi = res.type === "ai-action";

              return (
                <button
                  key={res.id}
                  onClick={() => handleSelect(res.id, res.type)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200 cursor-pointer text-left ${
                    isSelected
                      ? "bg-surface border-accent shadow-lg scale-[1.01]"
                      : "bg-surface/50 border-border/40 hover:border-border"
                  } ${isAi ? "border-accent/40 bg-accent/5 text-accent" : ""}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono opacity-50">
                      {isAi ? "✦" : res.type === "action" ? "+" : "•"}
                    </span>
                    <span className="font-sans text-sm font-medium text-foreground truncate">
                      {res.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted shrink-0">
                    {isAi ? "Ask AI ↵" : res.type === "action" ? "Create ↵" : "Open ↵"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
