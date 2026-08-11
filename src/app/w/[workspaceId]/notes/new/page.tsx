import React from "react";
import { NoteEditor } from "@/features/knowledge/components/note-editor/note-editor";
import { AppShell } from "@/features/app-shell/components/app-shell";
import { fetchAppShellData } from "@/features/app-shell/utils/fetch-shell-data";

export const metadata = {
  title: "New Note — MINDSPACE",
};

export default async function NewNotePage({ params }: { params: { workspaceId: string } }) {
  const { workspaceId } = await params;
  const { workspace, workspacesItems, user, displayName } = await fetchAppShellData(workspaceId);

  return (
    <AppShell 
      workspaceId={workspace.id}
      currentWorkspace={{ id: workspace.id, name: workspace.name }}
      workspaces={workspacesItems}
      userEmail={user.email || ""}
      displayName={displayName}
      activeTab="focus"
    >
      <NoteEditor workspaceId={workspace.id} />
    </AppShell>
  );
}
