import * as React from "react";
import Link from "next/link";
import { WorkspaceSwitcher, WorkspaceItem } from "./workspace-switcher";

interface SidebarProps {
  workspaceId: string;
  currentWorkspace: WorkspaceItem;
  workspaces: WorkspaceItem[];
  activeTab?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  workspaceId,
  currentWorkspace,
  workspaces,
  activeTab = "universe",
}) => {
  const navItems = [
    { id: "focus", label: "Focus Space", icon: "●" },
    { id: "universe", label: "Knowledge Universe", icon: "✦" },
    { id: "timeline", label: "Chronological Timeline", icon: "⚓" },
  ];

  return (
    <aside className="w-64 h-full border-r border-border/40 bg-surface-subtle flex flex-col gap-6 p-6 select-none shrink-0 hidden md:flex">
      {/* Workspace switcher block */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-mono text-muted uppercase tracking-widest px-1">
          Active Container
        </span>
        <WorkspaceSwitcher currentWorkspace={currentWorkspace} workspaces={workspaces} />
      </div>

      {/* Nav List */}
      <nav className="flex-1 flex flex-col gap-1.5 mt-4">
        <span className="text-[10px] font-mono text-muted uppercase tracking-widest mb-2 px-1">
          Views
        </span>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Link
              key={item.id}
              href={`/w/${workspaceId}?tab=${item.id}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-all duration-150 focus-visible:outline-2 focus-visible:outline-accent ${
                isActive
                  ? "bg-surface border border-border text-foreground font-semibold shadow-sm"
                  : "text-muted hover:text-foreground hover:bg-surface/50 border border-transparent"
              }`}
            >
              <span className={`text-xs ${isActive ? "text-accent animate-pulse" : "text-muted"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer system details */}
      <div className="flex flex-col gap-1 border-t border-border/20 pt-4 text-[10px] font-mono text-muted select-none">
        <span>TENANT: {workspaceId.substring(0, 8)}...</span>
        <span>ENGINE: PostgreSQL RLS</span>
      </div>
    </aside>
  );
};
export default Sidebar;
