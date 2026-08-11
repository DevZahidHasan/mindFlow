"use client";

import * as React from "react";
import { AppShell } from "@/features/app-shell/components/app-shell";
import { WorkspaceIntro } from "./workspace-intro";
import { WorkspaceItem } from "@/features/app-shell/components/workspace-switcher";
import { KnowledgeEdge } from "@/features/knowledge/schemas/edge.schema";
import { KnowledgeNode } from "@/features/knowledge/schemas/node.schema";
import { NoteList } from "@/features/knowledge/components/note-index/note-list";
import { KnowledgeUniverse } from "@/features/knowledge/components/knowledge-universe";

interface WorkspaceDashboardProps {
  workspaceId: string;
  workspaceName: string;
  userEmail: string;
  displayName: string;
  workspaces: WorkspaceItem[];
  activeTab?: string;
  focusedNodeId?: string;
  nodes?: KnowledgeNode[];
  edges?: KnowledgeEdge[];
}

export const WorkspaceDashboard: React.FC<WorkspaceDashboardProps> = ({
  workspaceId,
  workspaceName,
  userEmail,
  displayName,
  workspaces,
  activeTab = "universe",
  focusedNodeId,
  nodes = [],
  edges = [],
}) => {
  const [introComplete, setIntroComplete] = React.useState(false);
  const [isListView, setIsListView] = React.useState(false);

  // Read saved completion flags to allow skipping on returning entries during the same session
  React.useEffect(() => {
    const key = `mindspace_intro_complete_v2_${workspaceId}`;
    if (sessionStorage.getItem(key) === "true") {
      setIntroComplete(true);
    }
  }, [workspaceId]);

  const handleCompleteIntro = () => {
    const key = `mindspace_intro_complete_v2_${workspaceId}`;
    sessionStorage.setItem(key, "true");
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
          <div className="flex-1 w-full h-full relative overflow-hidden bg-background">
            {/* Absolute positioning for the List Toggle Control */}
            <div className="absolute top-8 right-8 z-50 flex items-center gap-2">
              <button
                onClick={() => setIsListView(!isListView)}
                className="px-4 py-2 rounded-full border border-border/40 bg-surface/80 backdrop-blur text-[10px] uppercase font-mono tracking-widest text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                title="Toggle WebGL Graph / List View"
              >
                {isListView ? "Launch Universe" : "List View"}
              </button>
            </div>
            
            {isListView ? (
              <div className="w-full h-full overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-1000">
                <NoteList notes={nodes} workspaceId={workspaceId} />
              </div>
            ) : (
              <div className="w-full h-full animate-in fade-in zoom-in-95 duration-1000">
                <KnowledgeUniverse nodes={nodes} edges={edges} workspaceId={workspaceId} focusedNodeId={focusedNodeId} />
              </div>
            )}
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
