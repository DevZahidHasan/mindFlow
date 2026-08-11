import * as React from "react";
import { redirect } from "next/navigation";
import { AuthService } from "@/features/auth/services/auth-service";
import { WorkspaceRepository } from "@/features/workspaces/repositories/workspace-repository";
import { CreateWorkspaceForm } from "@/features/workspaces/components/create-workspace-form";
import { SpatialAuthBackground } from "@/features/auth/components/spatial-auth-background";

export const metadata = {
  title: "Workspaces — MINDSPACE",
  description: "Select or establish your secure workspace container.",
};

export default async function WorkspacesRootPage() {
  const user = await AuthService.getUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch workspaces
  const list = await WorkspaceRepository.getUserWorkspaces(user.id);

  // If they have workspaces, redirect to the first one
  if (list.length > 0 && list[0].workspace) {
    redirect(`/w/${list[0].workspace.id}`);
  }

  // If no workspaces, render a screen to create one
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-6 relative overflow-hidden">
      <SpatialAuthBackground />

      <div className="w-full max-w-sm flex flex-col gap-8 z-10 text-center">
        <header className="flex flex-col gap-2 select-none animate-[fadeInUp_1s_cubic-bezier(0.16,1,0.3,1)]">
          <span className="font-display font-medium text-2xl tracking-tight text-foreground flex items-center justify-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-accent" />
            MINDSPACE
          </span>
          <h1 className="text-xl font-display font-medium uppercase tracking-tight">
            Create Your First Workspace
          </h1>
          <p className="text-sm text-muted font-sans">
            To begin using MINDSPACE, you need to establish a secure tenant workspace container.
          </p>
        </header>

        <div className="animate-[fadeInUp_1s_cubic-bezier(0.16,1,0.3,1)_delay-[100ms]_both]">
          <CreateWorkspaceForm />
        </div>
      </div>
    </div>
  );
}
