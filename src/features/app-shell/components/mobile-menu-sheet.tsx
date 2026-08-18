"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useSpring, SPRING_PRESETS } from "@/lib/hooks/use-spring";
import { WorkspaceSwitcher, WorkspaceItem } from "./workspace-switcher";

interface MobileMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  currentWorkspace: WorkspaceItem;
  workspaces: WorkspaceItem[];
}

export const MobileMenuSheet: React.FC<MobileMenuSheetProps> = ({
  open,
  onOpenChange,
  workspaceId,
  currentWorkspace,
  workspaces,
}) => {
  const progress = useSpring(open ? 1 : 0, SPRING_PRESETS.ui);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onOpenChange(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open && progress < 0.01) return null;

  const bgOpacity = progress * 0.8;
  const yOffset = (1 - progress) * 100; // translate down by percentage

  return (
    <div
      className="fixed inset-0 z-[100] md:hidden"
      style={{ pointerEvents: open ? "auto" : "none" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background"
        style={{ opacity: bgOpacity }}
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet Container */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-surface border-t border-border/40 rounded-t-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.4)] flex flex-col will-change-transform"
        style={{ transform: `translateY(${yOffset}%)` }}
      >
        {/* Drag Handle Indicator */}
        <div 
          className="w-full flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing"
          onClick={() => onOpenChange(false)}
        >
          <div className="w-12 h-1.5 rounded-full bg-border/60" />
        </div>

        <div className="flex flex-col gap-8 px-6 pb-12 pt-2 max-h-[80vh] overflow-y-auto no-scrollbar">
          
          {/* Action Links */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-mono text-muted uppercase tracking-widest px-1">
              Actions
            </span>
            <Link
              href={`/w/${workspaceId}/import`}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-sans font-medium bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20 transition-all shadow-sm w-full"
            >
              <span className="text-lg leading-none">＋</span>
              Import Knowledge
            </Link>
            <Link
              href={`/w/${workspaceId}/notes/new`}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-sans font-medium bg-surface-subtle text-foreground/80 border border-border/50 hover:border-border transition-all shadow-sm w-full"
            >
              <span className="text-lg leading-none font-mono">✎</span>
              Write Manual Note
            </Link>
          </div>

          {/* Workspace Switcher */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-mono text-muted uppercase tracking-widest px-1">
              Active Container
            </span>
            <div className="bg-surface-subtle border border-border/40 p-2 rounded-xl">
              <WorkspaceSwitcher currentWorkspace={currentWorkspace} workspaces={workspaces} />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
