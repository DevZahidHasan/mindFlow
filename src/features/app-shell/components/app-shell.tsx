"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { WorkspaceItem } from "./workspace-switcher";
import { SearchDialog } from "@/features/knowledge/components/knowledge-search/search-dialog";

import { AiSessionProvider } from "@/features/ai/context/ai-session-context";

interface AppShellProps {
  children: React.ReactNode;
  workspaceId: string;
  currentWorkspace: WorkspaceItem;
  workspaces: WorkspaceItem[];
  userEmail: string;
  displayName: string;
  activeTab?: string;
}

const AppShellInner: React.FC<AppShellProps> = ({
  children,
  workspaceId,
  currentWorkspace,
  workspaces,
  userEmail,
  displayName,
  activeTab = "universe",
}) => {
  const [commandOpen, setCommandOpen] = React.useState(false);

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
        <aside className="w-80 h-full border-l border-border/40 bg-surface-subtle p-6 select-none shrink-0 hidden lg:flex flex-col gap-6 overflow-y-auto no-scrollbar">
          <div id="inspector-portal-target" className="w-full flex flex-col gap-5" />

          <div id="inspector-default-content" className="flex flex-col gap-6 w-full">
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
          </div>
        </aside>
      </div>

      {/* Mobile bottom navigations */}
      <MobileNav
        workspaceId={workspaceId}
        activeTab={activeTab}
        onTriggerCommand={handleTriggerCommand}
      />

      {/* Command Center Spatial Overlay */}
      <SearchDialog 
        open={commandOpen} 
        onOpenChange={setCommandOpen}
        workspaceId={workspaceId}
      />
    </div>
  );
};

export const AppShell: React.FC<AppShellProps> = (props) => {
  return (
    <AiSessionProvider>
      <AppShellInner {...props} />
    </AiSessionProvider>
  );
};

export default AppShell;
