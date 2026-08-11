"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { WorkspaceItem } from "./workspace-switcher";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface AppShellProps {
  children: React.ReactNode;
  workspaceId: string;
  currentWorkspace: WorkspaceItem;
  workspaces: WorkspaceItem[];
  userEmail: string;
  displayName: string;
  activeTab?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  workspaceId,
  currentWorkspace,
  workspaces,
  userEmail,
  displayName,
  activeTab = "universe",
}) => {
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Keyboard shortcut listener for ⌘K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleTriggerCommand = () => {
    setCommandOpen(true);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden font-sans">
      {/* Top Header */}
      <Topbar
        workspaceId={workspaceId}
        userEmail={userEmail}
        displayName={displayName}
        onTriggerCommand={handleTriggerCommand}
      />

      {/* Main workspace layout grid */}
      <div className="flex-1 flex overflow-hidden pb-16 md:pb-0">
        {/* Sidebar left nav column */}
        <Sidebar
          workspaceId={workspaceId}
          currentWorkspace={currentWorkspace}
          workspaces={workspaces}
          activeTab={activeTab}
        />

        {/* Center main canvas viewport */}
        <main className="flex-1 overflow-y-auto bg-background p-6 md:p-8 flex flex-col justify-start relative">
          {children}
        </main>

        {/* Right context inspector sidebar column */}
        <aside className="w-80 h-full border-l border-border/40 bg-surface-subtle p-6 select-none shrink-0 hidden lg:flex flex-col gap-6">
          <span className="text-[10px] font-mono text-muted uppercase tracking-widest border-b border-border/40 pb-2">
            Context Inspector
          </span>
          <div className="flex flex-col gap-4 text-sm font-sans text-muted">
            <h5 className="font-semibold text-foreground">Active Universe State</h5>
            <p className="leading-relaxed text-xs">
              MINDSPACE dynamic graphs automatically balance layout forces in real time as you write. Click nodes or hover connection edges to load detailed semantic logs here.
            </p>
            <div className="p-4 rounded-lg bg-surface border border-border flex flex-col gap-1.5 mt-2">
              <span className="text-[9px] font-mono uppercase text-muted">Node telemetry</span>
              <span className="text-xs text-foreground font-semibold">
                Workspace: {currentWorkspace.name}
              </span>
              <span className="text-xs text-foreground">Current view: {activeTab.toUpperCase()}</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile bottom navigations */}
      <MobileNav
        workspaceId={workspaceId}
        activeTab={activeTab}
        onTriggerCommand={handleTriggerCommand}
      />

      {/* Command Center Dialog Overlay */}
      <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
        <DialogContent className="max-w-lg w-full p-6 transition-all duration-[600ms] cubic-bezier(0.16, 1, 0.3, 1)">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-sm font-display text-muted uppercase tracking-widest select-none">
              Command Center
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Search concepts or run workspace command..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-subtle"
              autoFocus
            />

            <div className="flex flex-col gap-1.5 select-none mt-2">
              <span className="text-[10px] font-mono text-muted uppercase tracking-widest mb-1.5 px-1">
                Suggested Commands
              </span>
              <button className="flex items-center justify-between w-full p-2.5 rounded-lg text-left text-xs font-sans bg-surface hover:bg-surface-elevated text-foreground transition-all cursor-pointer">
                <span>Create a new markdown note</span>
                <span className="font-mono text-[9px] text-muted uppercase">N</span>
              </button>
              <button className="flex items-center justify-between w-full p-2.5 rounded-lg text-left text-xs font-sans bg-surface hover:bg-surface-elevated text-foreground transition-all cursor-pointer">
                <span>Navigate to Knowledge Universe</span>
                <span className="font-mono text-[9px] text-muted uppercase">G then U</span>
              </button>
              <button className="flex items-center justify-between w-full p-2.5 rounded-lg text-left text-xs font-sans bg-surface hover:bg-surface-elevated text-foreground transition-all cursor-pointer">
                <span>Configure workspace settings</span>
                <span className="font-mono text-[9px] text-muted uppercase">G then S</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default AppShell;
