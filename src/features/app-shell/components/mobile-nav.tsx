import * as React from "react";
import Link from "next/link";

interface MobileNavProps {
  workspaceId: string;
  activeTab?: string;
  onTriggerCommand: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  workspaceId,
  activeTab = "universe",
  onTriggerCommand,
}) => {
  const navItems = [
    { id: "universe", label: "Universe", icon: "✦" },
    { id: "projects", label: "Projects", icon: "◈" },
    { id: "collections", label: "Collections", icon: "❖" },
    { id: "timeline", label: "Log", icon: "⚓" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border/40 flex items-center justify-around z-30 md:hidden select-none">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <Link
            key={item.id}
            href={`/w/${workspaceId}?tab=${item.id}`}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-2 gap-1 text-[10px] font-mono tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
              isActive ? "text-accent font-semibold" : "text-muted"
            }`}
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span>{item.label.toUpperCase()}</span>
          </Link>
        );
      })}

      <button
        onClick={onTriggerCommand}
        className="flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-2 gap-1 text-[10px] font-mono tracking-wider text-muted hover:text-foreground cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
      >
        <span className="text-base leading-none">🔍</span>
        <span>SEARCH</span>
      </button>
    </nav>
  );
};
export default MobileNav;
