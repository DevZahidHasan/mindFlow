"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  CreateNodeProposal, 
  ConnectNodesProposal, 
  ProposedCommandAction 
} from "@/lib/ai/types";
import { 
  confirmCreateNodeAction, 
  confirmConnectNodesAction 
} from "@/features/ai/actions/command-actions";
import { useSpring, SPRING_PRESETS } from "@/lib/hooks/use-spring";

interface ActionConfirmationCardProps {
  proposal: ProposedCommandAction;
  workspaceId: string;
  isResolved?: boolean;
  onResolved: () => void;
}

export const ActionConfirmationCard: React.FC<ActionConfirmationCardProps> = ({
  proposal,
  workspaceId,
  isResolved = false,
  onResolved,
}) => {
  const router = useRouter();
  const [status, setStatus] = useState<"PROPOSED" | "CONFIRMING" | "EXECUTED" | "DISMISSED">(
    isResolved ? "EXECUTED" : "PROPOSED"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Springs for physical confirmation tension
  const isExecuting = status === "CONFIRMING";
  const isSuccess = status === "EXECUTED";
  const isDismissed = status === "DISMISSED";

  const tensionSpring = useSpring(isExecuting ? 1 : isSuccess ? 0 : 0, SPRING_PRESETS.micro);

  const handleConfirm = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status !== "PROPOSED") return;

    setStatus("CONFIRMING");
    setErrorMessage(null);

    try {
      if (proposal.type === "CREATE_NODE") {
        const res = await confirmCreateNodeAction(workspaceId, proposal);
        if (res.success && res.data) {
          setStatus("EXECUTED");
          onResolved();
          router.refresh();
          // Navigate to the newly created note editor
          router.push(`/w/${workspaceId}/notes/${res.data.id}`);
        } else {
          setErrorMessage(res.error?.message || "Failed to create note.");
          setStatus("PROPOSED");
        }
      } else if (proposal.type === "CONNECT_NODES") {
        const res = await confirmConnectNodesAction(workspaceId, proposal);
        if (res.success) {
          setStatus("EXECUTED");
          onResolved();
          router.refresh();
        } else {
          setErrorMessage(res.error?.message || "Failed to connect nodes.");
          setStatus("PROPOSED");
        }
      } else if (proposal.type === "MULTI_CONNECT_NODES") {
        const { confirmMultiConnectNodesAction } = await import("@/features/ai/actions/command-actions");
        const res = await confirmMultiConnectNodesAction(workspaceId, proposal.connections);
        if (res.success) {
          setStatus("EXECUTED");
          onResolved();
          router.refresh();
        } else {
          setErrorMessage(res.error?.message || "Failed to connect cluster.");
          setStatus("PROPOSED");
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Operation failed.");
      setStatus("PROPOSED");
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus("DISMISSED");
    onResolved();
  };

  if (isDismissed) {
    return (
      <div className="p-3 rounded-lg border border-border/30 bg-surface/30 text-xs font-mono text-muted text-center italic">
        Action proposal dismissed.
      </div>
    );
  }

  if (proposal.type === "CREATE_NODE") {
    return (
      <div 
        className={`w-full p-4 rounded-xl border transition-all duration-500 flex flex-col gap-3.5 ${
          isSuccess 
            ? "bg-accent/10 border-accent/60 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
            : "bg-surface/95 border-accent/40 shadow-xl"
        }`}
        style={{
          transform: `scale(${1 - tensionSpring * 0.02})`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isSuccess ? "bg-accent" : "bg-accent animate-pulse"}`} />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent font-semibold">
              Create Knowledge Node
            </span>
          </div>
          {isSuccess && (
            <span className="text-[10px] font-mono text-accent uppercase font-bold">
              ✓ Created in Universe
            </span>
          )}
        </div>

        {/* Title & Preview */}
        <div className="flex flex-col gap-1.5">
          <h4 className="text-base font-display font-medium text-foreground tracking-tight">
            {proposal.title}
          </h4>
          <p className="text-xs font-sans text-muted leading-relaxed line-clamp-3 bg-surface-subtle/80 p-2.5 rounded-lg border border-border/40 font-mono">
            {proposal.content}
          </p>
        </div>

        {/* Rationale */}
        {proposal.rationale && (
          <p className="text-[11px] font-sans text-muted-foreground/80 italic">
            Rationale: {proposal.rationale}
          </p>
        )}

        {errorMessage && (
          <div className="text-xs text-rose-400 font-mono p-2 bg-rose-950/30 rounded border border-rose-800/40">
            {errorMessage}
          </div>
        )}

        {/* Actions */}
        {!isSuccess && (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleConfirm}
              disabled={isExecuting}
              className="flex-1 py-2.5 px-4 rounded-lg bg-accent text-black font-semibold text-xs font-sans hover:bg-accent/90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50 min-h-[44px]"
            >
              {isExecuting ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-black animate-ping" />
                  <span>Creating Node...</span>
                </>
              ) : (
                <>
                  <span className="text-sm font-bold leading-none">+</span>
                  <span>Confirm & Create Note</span>
                </>
              )}
            </button>

            <button
              onClick={handleCancel}
              disabled={isExecuting}
              className="py-2.5 px-4 rounded-lg bg-surface-subtle hover:bg-surface border border-border text-xs font-sans font-medium text-muted hover:text-foreground transition-all cursor-pointer min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  if (proposal.type === "MULTI_CONNECT_NODES") {
    return (
      <div 
        className={`w-full p-4 rounded-xl border transition-all duration-500 flex flex-col gap-3.5 ${
          isSuccess 
            ? "bg-accent/10 border-accent/60 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
            : "bg-surface/95 border-accent/40 shadow-xl"
        }`}
        style={{
          transform: `scale(${1 - tensionSpring * 0.02})`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isSuccess ? "bg-accent" : "bg-accent animate-pulse"}`} />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent font-semibold">
              Connect Knowledge Cluster ({proposal.connections.length} Links)
            </span>
          </div>
          {isSuccess && (
            <span className="text-[10px] font-mono text-accent uppercase font-bold">
              ✓ Cluster Connected in Universe
            </span>
          )}
        </div>

        {/* Multi-Node Connections List */}
        <div className="flex flex-col gap-2 p-2 bg-surface-subtle/80 rounded-lg border border-border/40 max-h-48 overflow-y-auto no-scrollbar">
          {proposal.connections.map((conn, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded bg-surface border border-border/30 text-xs">
              <span className="font-semibold text-foreground truncate max-w-[40%]">
                {conn.sourceTitle}
              </span>
              <span className="text-[9px] font-mono text-accent uppercase bg-accent/10 px-1.5 py-0.5 rounded shrink-0">
                ⟷ {conn.label}
              </span>
              <span className="font-semibold text-foreground truncate max-w-[40%] text-right">
                {conn.targetTitle}
              </span>
            </div>
          ))}
        </div>

        {/* Rationale */}
        {proposal.rationale && (
          <p className="text-[11px] font-sans text-muted-foreground/80 italic">
            Rationale: {proposal.rationale}
          </p>
        )}

        {errorMessage && (
          <div className="text-xs text-rose-400 font-mono p-2 bg-rose-950/30 rounded border border-rose-800/40">
            {errorMessage}
          </div>
        )}

        {/* Actions */}
        {!isSuccess && (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleConfirm}
              disabled={isExecuting}
              className="flex-1 py-2.5 px-4 rounded-lg bg-accent text-black font-semibold text-xs font-sans hover:bg-accent/90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50 min-h-[44px]"
            >
              {isExecuting ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-black animate-ping" />
                  <span>Connecting Cluster...</span>
                </>
              ) : (
                <>
                  <span className="text-sm font-bold leading-none">✓</span>
                  <span>Confirm & Connect All ({proposal.connections.length} Links)</span>
                </>
              )}
            </button>

            <button
              onClick={handleCancel}
              disabled={isExecuting}
              className="py-2.5 px-4 rounded-lg bg-surface-subtle hover:bg-surface border border-border text-xs font-sans font-medium text-muted hover:text-foreground transition-all cursor-pointer min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  // CONNECT_NODES
  return (
    <div 
      className={`w-full p-4 rounded-xl border transition-all duration-500 flex flex-col gap-3.5 ${
        isSuccess 
          ? "bg-accent/10 border-accent/60 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
          : "bg-surface/95 border-accent/40 shadow-xl"
      }`}
      style={{
        transform: `scale(${1 - tensionSpring * 0.02})`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isSuccess ? "bg-accent" : "bg-accent animate-pulse"}`} />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent font-semibold">
            Connect Knowledge Universe
          </span>
        </div>
        {isSuccess && (
          <span className="text-[10px] font-mono text-accent uppercase font-bold">
            ✓ Connected in Universe
          </span>
        )}
      </div>

      {/* Connection Graph Visualization */}
      <div className="flex items-center justify-between gap-3 p-3 bg-surface-subtle/80 rounded-lg border border-border/40">
        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
          <span className="text-[9px] font-mono uppercase text-muted">Source Node</span>
          <span className="text-xs font-sans font-semibold text-foreground truncate">
            {proposal.sourceTitle}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1 shrink-0 px-2">
          <span className="text-[9px] font-mono text-accent font-semibold uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded">
            {proposal.label || "Related"}
          </span>
          <div className="w-12 h-[2px] bg-gradient-to-r from-accent/20 via-accent to-accent/20 animate-pulse" />
        </div>

        <div className="flex-1 flex flex-col gap-0.5 text-right min-w-0">
          <span className="text-[9px] font-mono uppercase text-muted">Target Node</span>
          <span className="text-xs font-sans font-semibold text-foreground truncate">
            {proposal.targetTitle}
          </span>
        </div>
      </div>

      {/* Rationale */}
      {proposal.rationale && (
        <p className="text-[11px] font-sans text-muted-foreground/80 italic">
          Rationale: {proposal.rationale}
        </p>
      )}

      {errorMessage && (
        <div className="text-xs text-rose-400 font-mono p-2 bg-rose-950/30 rounded border border-rose-800/40">
          {errorMessage}
        </div>
      )}

      {/* Actions */}
      {!isSuccess && (
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleConfirm}
            disabled={isExecuting}
            className="flex-1 py-2.5 px-4 rounded-lg bg-accent text-black font-semibold text-xs font-sans hover:bg-accent/90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50 min-h-[44px]"
          >
            {isExecuting ? (
              <>
                <div className="w-2 h-2 rounded-full bg-black animate-ping" />
                <span>Forming Connection...</span>
              </>
            ) : (
              <>
                <span className="text-sm font-bold leading-none">✓</span>
                <span>Confirm & Connect in Universe</span>
              </>
            )}
          </button>

          <button
            onClick={handleCancel}
            disabled={isExecuting}
            className="py-2.5 px-4 rounded-lg bg-surface-subtle hover:bg-surface border border-border text-xs font-sans font-medium text-muted hover:text-foreground transition-all cursor-pointer min-h-[44px]"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
