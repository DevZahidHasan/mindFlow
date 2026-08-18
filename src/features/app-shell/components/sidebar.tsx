import * as React from "react";
import Link from "next/link";
import { WorkspaceSwitcher, WorkspaceItem } from "./workspace-switcher";
import { Magnetic } from "@/features/ui/magnetic";

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
    { id: "universe", label: "Knowledge Universe", icon: "✦" },
    { id: "projects", label: "Strategic Projects", icon: "◈" },
    { id: "collections", label: "Collections", icon: "❖" },
    { id: "timeline", label: "Knowledge Log", icon: "⚓" },
    { id: "focus", label: "Focus Space", icon: "●" },
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
        <div className="flex flex-col gap-2 mb-6">
          <Magnetic intensity={0.15}>
            <Link
              href={`/w/${workspaceId}/import`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans font-medium bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20 transition-all duration-150 shadow-sm block w-full"
            >
              <span className="text-xs">＋</span>
              Import Knowledge
            </Link>
          </Magnetic>
          <Magnetic intensity={0.15}>
            <Link
              href={`/w/${workspaceId}/notes/new`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans font-medium bg-surface text-foreground/80 hover:bg-surface-hover border border-border/50 hover:border-border transition-all duration-150 shadow-sm block w-full"
            >
              <span className="text-xs font-mono">✎</span>
              Write Manual Note
            </Link>
          </Magnetic>
        </div>
        
        <span className="text-[10px] font-mono text-muted uppercase tracking-widest mb-2 px-1">
          Views
        </span>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Magnetic key={item.id} intensity={0.1}>
              <Link
                href={`/w/${workspaceId}?tab=${item.id}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans font-medium transition-all duration-150 block w-full ${
                  isActive
                    ? "text-accent bg-accent/5 border border-accent/10 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-hover border border-transparent"
                }`}
              >
                <span className={`text-xs ${isActive ? "text-accent animate-pulse" : "text-muted"}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </Magnetic>
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
