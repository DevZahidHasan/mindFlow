import * as React from "react";
import { redirect } from "next/navigation";
import { AuthService } from "@/features/auth/services/auth-service";
import { WorkspaceService } from "@/features/workspaces/services/workspace-service";
import { WorkspaceRepository } from "@/features/workspaces/repositories/workspace-repository";
import { WorkspaceDashboard } from "@/features/workspaces/components/workspace-dashboard";
import { KnowledgeService } from "@/features/knowledge/services/knowledge.service";
import { createClient } from "@/lib/supabase/server";

interface WorkspacePageProps {
  params: Promise<{
    workspaceId: string;
  }>;
  searchParams: Promise<{
    tab?: string;
    focus?: string;
    project?: string;
    collection?: string;
  }>;
}

export default async function WorkspaceDashboardPage({
  params,
  searchParams,
}: WorkspacePageProps) {
  const { workspaceId } = await params;
  const { tab, focus } = await searchParams;

  // 1. Authenticate user session
  const user = await AuthService.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Fetch workspace and verify membership (fails secure, redirecting on error)
  let workspace;
  try {
    workspace = await WorkspaceService.getWorkspaceForUser(workspaceId, user.id);
  } catch (err) {
    redirect("/w");
  }

  // 3. Fetch workspaces list for the switcher dropdown
  const workspacesList = await WorkspaceRepository.getUserWorkspaces(user.id);
  const workspacesItems = workspacesList
    .filter((w) => w.workspace !== null)
    .map((w) => ({
      id: w.workspace!.id,
      name: w.workspace!.name,
    }));

  // 4. Retrieve profile configs
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const displayName = profile?.display_name || user.email || "User Profile";

  // 5. Fetch knowledge nodes, edges, projects, collections, and timeline stream
  const [nodes, edges, timelineEvents, projects, collections] = await Promise.all([
    KnowledgeService.getWorkspaceNodes(workspace.id),
    KnowledgeService.getWorkspaceEdges(workspace.id),
    (await import("@/features/timeline/services/timeline.service")).TimelineService.getWorkspaceTimeline(workspace.id, { limit: 100 }),
    (await import("@/features/projects/services/project.service")).ProjectService.getWorkspaceProjects(workspace.id),
    (await import("@/features/collections/services/collection.service")).CollectionService.getWorkspaceCollections(workspace.id),
  ]);

  const { project: filterProjectId, collection: filterCollectionId } = await searchParams;

  let projectNodeIds: string[] = [];
  if (filterProjectId) {
    const { ProjectService } = await import("@/features/projects/services/project.service");
    projectNodeIds = await ProjectService.getProjectNodeIds(workspace.id, filterProjectId);
  }

  let collectionNodeIds: string[] = [];
  if (filterCollectionId) {
    const { CollectionService } = await import("@/features/collections/services/collection.service");
    collectionNodeIds = await CollectionService.getCollectionNodeIds(workspace.id, filterCollectionId);
  }

  return (
    <WorkspaceDashboard
      workspaceId={workspace.id}
      workspaceName={workspace.name}
      userEmail={user.email || ""}
      displayName={displayName}
      workspaces={workspacesItems}
      activeTab={tab}
      focusedNodeId={focus}
      filterProjectId={filterProjectId}
      filterCollectionId={filterCollectionId}
      nodes={nodes}
      edges={edges}
      timelineEvents={timelineEvents}
      projects={projects}
      collections={collections}
      projectNodeIds={projectNodeIds}
      collectionNodeIds={collectionNodeIds}
    />
  );
}
