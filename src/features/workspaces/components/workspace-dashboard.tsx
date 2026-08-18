"use client";

import * as React from "react";
import { AppShell } from "@/features/app-shell/components/app-shell";
import { WorkspaceIntro } from "./workspace-intro";
import { WorkspaceItem } from "@/features/app-shell/components/workspace-switcher";
import { KnowledgeEdge } from "@/features/knowledge/schemas/edge.schema";
import { KnowledgeNode } from "@/features/knowledge/schemas/node.schema";
import { NoteList } from "@/features/knowledge/components/note-index/note-list";
import { KnowledgeUniverse } from "@/features/knowledge/components/knowledge-universe";
import { TimelineView } from "@/features/timeline/components/timeline-view";
import { ProjectsView } from "@/features/projects/components/projects-view";
import { CollectionsView } from "@/features/collections/components/collections-view";
import { TimelineEvent } from "@/features/timeline/schemas/timeline.schema";
import { Project } from "@/features/projects/schemas/project.schema";
import { Collection } from "@/features/collections/schemas/collection.schema";

interface WorkspaceDashboardProps {
  workspaceId: string;
  workspaceName: string;
  userEmail: string;
  displayName: string;
  workspaces: WorkspaceItem[];
  activeTab?: string;
  focusedNodeId?: string;
  filterProjectId?: string;
  filterCollectionId?: string;
  nodes?: KnowledgeNode[];
  edges?: KnowledgeEdge[];
  timelineEvents?: TimelineEvent[];
  projects?: Project[];
  collections?: Collection[];
  projectNodeIds?: string[];
  collectionNodeIds?: string[];
}

export const WorkspaceDashboard: React.FC<WorkspaceDashboardProps> = ({
  workspaceId,
  workspaceName,
  userEmail,
  displayName,
  workspaces,
  activeTab = "universe",
  focusedNodeId,
  filterProjectId,
  filterCollectionId,
  nodes = [],
  edges = [],
  timelineEvents = [],
  projects = [],
  collections = [],
  projectNodeIds = [],
  collectionNodeIds = [],
}) => {
  const [introComplete, setIntroComplete] = React.useState(false);
  const [isListView, setIsListView] = React.useState(false);

  // Filter nodes & edges if a project or collection filter is active
  const filteredNodes = React.useMemo(() => {
    if (filterProjectId) {
      return nodes.filter(n => projectNodeIds.includes(n.id));
    }
    if (filterCollectionId) {
      return nodes.filter(n => collectionNodeIds.includes(n.id));
    }
    return nodes;
  }, [nodes, filterProjectId, projectNodeIds, filterCollectionId, collectionNodeIds]);

  const filteredEdges = React.useMemo(() => {
    const validIds = new Set(filteredNodes.map(n => n.id));
    return edges.filter(e => validIds.has(e.source_id) && validIds.has(e.target_id));
  }, [edges, filteredNodes]);

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

  // Renders view states dynamically using URL parameter triggers
  const renderTabContent = () => {
    switch (activeTab) {
      case "projects":
        return <ProjectsView workspaceId={workspaceId} projects={projects} nodes={nodes} />;
      case "collections":
        return <CollectionsView workspaceId={workspaceId} collections={collections} />;
      case "timeline":
        return (
          <TimelineView
            workspaceId={workspaceId}
            events={timelineEvents}
            focusedNodeId={focusedNodeId}
          />
        );
      case "focus":
        return (
          <div className="flex flex-col gap-4 animate-[fadeInUp_1s_cubic-bezier(0.16,1,0.3,1)] select-none max-w-2xl mx-auto py-12 px-6">
            <span className="text-xs font-mono text-accent uppercase tracking-widest">
              Workspace Focus Space
            </span>
            <h1 className="text-3xl font-display font-medium text-foreground tracking-tight uppercase">
              Focus Environment
            </h1>
            <p className="text-sm text-muted leading-relaxed font-sans">
              Welcome to your calm writing zone. Open any note from the Universe or Timeline to begin an uninterrupted editorial focus session.
            </p>
          </div>
        );
      case "universe":
      default:
        return (
          <div className="flex-1 w-full h-full relative overflow-hidden bg-background">
            {/* Absolute positioning for List & Project Filter Controls */}
            <div className="absolute top-8 right-8 z-50 flex items-center gap-2">
              {filterProjectId && (
                <span className="px-3 py-1.5 rounded-full border border-accent/40 bg-accent/10 text-[10px] uppercase font-mono tracking-wider text-accent">
                  Project Lens Active
                </span>
              )}
              {filterCollectionId && (
                <span className="px-3 py-1.5 rounded-full border border-accent/40 bg-accent/10 text-[10px] uppercase font-mono tracking-wider text-accent">
                  Collection Lens Active
                </span>
              )}
              <button
                onClick={() => setIsListView(!isListView)}
                className="px-4 py-2 rounded-full border border-border/40 bg-surface/80 backdrop-blur text-[10px] uppercase font-mono tracking-widest text-muted-foreground hover:text-foreground hover:border-accent transition-colors cursor-pointer"
                title="Toggle WebGL Graph / List View"
              >
                {isListView ? "Launch Universe" : "List View"}
              </button>
            </div>
            
            {isListView ? (
              <div className="w-full h-full overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-1000">
                <NoteList notes={filteredNodes} workspaceId={workspaceId} />
              </div>
            ) : (
              <div className="w-full h-full animate-in fade-in zoom-in-95 duration-1000">
                <KnowledgeUniverse 
                  nodes={filteredNodes} 
                  edges={filteredEdges} 
                  workspaceId={workspaceId} 
                  focusedNodeId={focusedNodeId} 
                />
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
      <div key={activeTab} className="w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] fill-mode-both">
        {renderTabContent()}
      </div>
    </AppShell>
  );
};
export default WorkspaceDashboard;
