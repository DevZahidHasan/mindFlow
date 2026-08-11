"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreateWorkspaceForm } from "@/features/workspaces/components/create-workspace-form";

export interface WorkspaceItem {
  id: string;
  name: string;
}

interface WorkspaceSwitcherProps {
  currentWorkspace: WorkspaceItem;
  workspaces: WorkspaceItem[];
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  currentWorkspace,
  workspaces,
}) => {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [showCreate, setShowCreate] = React.useState(false);

  const handleSelectWorkspace = (id: string) => {
    setOpen(false);
    setShowCreate(false);
    router.push(`/w/${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-elevated text-sm font-sans font-medium text-foreground transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Switch workspace"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-accent" />
          <span className="max-w-[120px] truncate">{currentWorkspace.name}</span>
          <svg
            className="w-4 h-4 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md w-full p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-display uppercase tracking-tight">
            {showCreate ? "Create Workspace" : "Select Workspace"}
          </DialogTitle>
        </DialogHeader>

        {showCreate ? (
          <div className="flex flex-col gap-4 animate-[fadeInUp_0.4s_cubic-bezier(0.16,1,0.3,1)]">
            <CreateWorkspaceForm />
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => setShowCreate(false)}
              className="font-mono text-xs text-muted"
            >
              ← Back to list
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto">
              {workspaces.map((w) => {
                const isActive = w.id === currentWorkspace.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => handleSelectWorkspace(w.id)}
                    className={`flex items-center justify-between w-full p-3 rounded-lg text-left text-sm font-sans transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-accent/15 border border-accent/30 text-accent font-semibold"
                        : "bg-surface border border-transparent hover:border-border hover:bg-surface-elevated text-foreground"
                    }`}
                  >
                    <span className="truncate">{w.name}</span>
                    {isActive && (
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider bg-accent/20 px-2 py-0.5 rounded text-accent">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-border/40 pt-4 flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowCreate(true)}
                className="w-full text-xs font-mono uppercase tracking-widest"
              >
                + New Workspace
              </Button>
              <DialogClose asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="px-4 text-xs font-mono uppercase tracking-widest"
                >
                  Cancel
                </Button>
              </DialogClose>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
export default WorkspaceSwitcher;
