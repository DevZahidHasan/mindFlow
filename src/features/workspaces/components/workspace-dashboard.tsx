"use client";

import * as React from "react";
import { AppShell } from "@/features/app-shell/components/app-shell";
import { WorkspaceIntro } from "./workspace-intro";
import { WorkspaceItem } from "@/features/app-shell/components/workspace-switcher";

interface WorkspaceDashboardProps {
  workspaceId: string;
  workspaceName: string;
  userEmail: string;
  displayName: string;
  workspaces: WorkspaceItem[];
  activeTab?: string;
}

export const WorkspaceDashboard: React.FC<WorkspaceDashboardProps> = ({
  workspaceId,
  workspaceName,
  userEmail,
  displayName,
  workspaces,
  activeTab = "universe",
}) => {
  const [introComplete, setIntroComplete] = React.useState(false);

  // Read saved completion flags to allow skipping on returning entries
  React.useEffect(() => {
    const key = `mindspace_intro_complete_${workspaceId}`;
    if (localStorage.getItem(key) === "true") {
      setIntroComplete(true);
    }
  }, [workspaceId]);

  const handleCompleteIntro = () => {
    const key = `mindspace_intro_complete_${workspaceId}`;
    localStorage.setItem(key, "true");
    setIntroComplete(true);
  };

  if (!introComplete) {
    return <WorkspaceIntro workspaceName={workspaceName} onComplete={handleCompleteIntro} />;
  }

  // Renders view states dynamically using URL parameter triggers (eliminates global state managers)
  const renderTabContent = () => {
    switch (activeTab) {
      case "focus":
        return (
          <div className="flex flex-col gap-4 animate-[fadeInUp_1s_cubic-bezier(0.16,1,0.3,1)] select-none">
            <span className="text-xs font-mono text-accent uppercase tracking-widest">
              Workspace Focus Space
            </span>
            <h1 className="text-3xl font-display font-medium text-foreground tracking-tight uppercase">
              Focus Environment
            </h1>
            <p className="text-sm text-muted max-w-xl leading-relaxed font-sans">
              Welcome to your calm writing zone. Write down concepts, thoughts, and reflections without
              distraction. Future phases will load markdown editor tools and active note cards here.
            </p>
          </div>
        );
      case "timeline":
        return (
          <div className="flex flex-col gap-4 animate-[fadeInUp_1s_cubic-bezier(0.16,1,0.3,1)] select-none">
            <span className="text-xs font-mono text-accent uppercase tracking-widest">
              Chronological Timeline
            </span>
            <h1 className="text-3xl font-display font-medium text-foreground tracking-tight uppercase">
              Knowledge Log
            </h1>
            <p className="text-sm text-muted max-w-xl leading-relaxed font-sans">
              Trace the historical shape of your learnings. View edits, connections, and events in
              chronological order. Future updates will display historical timelines here.
            </p>
          </div>
        );
      case "universe":
      default:
        return (
          <div className="flex flex-col gap-4 animate-[fadeInUp_1s_cubic-bezier(0.16,1,0.3,1)] select-none">
            <span className="text-xs font-mono text-accent uppercase tracking-widest">
              Active Canvas
            </span>
            <h1 className="text-3xl font-display font-medium text-foreground tracking-tight uppercase">
              Knowledge Universe
            </h1>
            <p className="text-sm text-muted max-w-xl leading-relaxed font-sans">
              Explore your documents as a floating, spatial system of interconnected concept nodes.
              Click the sidebar tabs to switch focus views.
            </p>
          </div>
        );
    }
  };

  return (
    <AppShell
      workspaceId={workspaceId}
      currentWorkspace={{ id: workspaceId, name: workspaceName }}
      workspaces={workspaces}
      userEmail={userEmail}
      displayName={displayName}
      activeTab={activeTab}
    >
      {renderTabContent()}
    </AppShell>
  );
};
export default WorkspaceDashboard;
