import * as React from "react";
import Link from "next/link";
import { AccountMenu } from "./account-menu";

interface TopbarProps {
  workspaceId: string;
  userEmail: string;
  displayName: string;
  onTriggerCommand: () => void;
  onTriggerMenu?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  workspaceId,
  userEmail,
  displayName,
  onTriggerCommand,
  onTriggerMenu,
}) => {
  return (
    <header className="h-16 border-b border-border/40 bg-surface flex items-center justify-between px-4 md:px-6 select-none shrink-0 z-20 gap-2 md:gap-4">
      {/* Left Area: Mobile Menu + Brand Logo */}
      <div className="flex items-center gap-3">
        {onTriggerMenu && (
          <button 
            onClick={onTriggerMenu}
            className="md:hidden p-2 -ml-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-subtle transition-colors focus-visible:outline-2 focus-visible:outline-accent"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <Link
          href={`/w/${workspaceId}`}
          className="font-display font-medium text-lg tracking-tight text-foreground flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span className="hidden md:block w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
          MINDSPACE
        </Link>
      </div>

      {/* Command Center Trigger Button */}
      <button
        onClick={onTriggerCommand}
        className="flex items-center justify-between w-full max-w-sm px-4 h-9 bg-surface-subtle border border-border hover:border-muted rounded-full text-muted hover:text-foreground text-xs font-sans transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Search or execute command...
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 bg-surface border border-border text-[9px] font-mono rounded text-muted select-none">
          <span>⌘</span>
          <span>K</span>
        </kbd>
      </button>

      {/* Right Account Trigger */}
      <div className="flex items-center gap-4">
        <AccountMenu
          workspaceId={workspaceId}
          userEmail={userEmail}
          displayName={displayName}
        />
      </div>
    </header>
  );
};
export default Topbar;
