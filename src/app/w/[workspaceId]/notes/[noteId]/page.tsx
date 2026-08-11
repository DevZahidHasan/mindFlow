import React from "react";
import { notFound } from "next/navigation";
import { NoteEditor } from "@/features/knowledge/components/note-editor/note-editor";
import { AppShell } from "@/features/app-shell/components/app-shell";
import { KnowledgeService } from "@/features/knowledge/services/knowledge.service";
import { fetchAppShellData } from "@/features/app-shell/utils/fetch-shell-data";

export async function generateMetadata({ params }: { params: Promise<{ noteId: string; workspaceId: string }> }) {
  try {
    const { noteId, workspaceId } = await params;
    const note = await KnowledgeService.getNode(noteId, workspaceId);
    return { title: `${note.title} — MINDSPACE` };
  } catch {
    return { title: "Note Not Found — MINDSPACE" };
  }
}

export default async function EditNotePage({ params }: { params: Promise<{ noteId: string; workspaceId: string }> }) {
  const { workspaceId, noteId } = await params;
  
  let note;
  try {
    note = await KnowledgeService.getNode(noteId, workspaceId);
  } catch (error) {
    notFound();
  }

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
      <NoteEditor workspaceId={workspace.id} initialNote={note} />
    </AppShell>
  );
}
