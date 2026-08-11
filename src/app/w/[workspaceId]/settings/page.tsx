import * as React from "react";
import { redirect } from "next/navigation";
import { AuthService } from "@/features/auth/services/auth-service";
import { WorkspaceService } from "@/features/workspaces/services/workspace-service";
import { WorkspaceRepository } from "@/features/workspaces/repositories/workspace-repository";
import { AppShell } from "@/features/app-shell/components/app-shell";
import { WorkspaceSettingsForm } from "@/features/workspaces/components/workspace-settings-form";
import { ProfileSettingsForm } from "@/features/auth/components/profile-settings-form";
import { createClient } from "@/lib/supabase/server";

interface SettingsPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export const metadata = {
  title: "Settings — MINDSPACE",
  description: "Configure your profile details and active workspace memberships.",
};

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { workspaceId } = await params;

  // 1. Authenticate user session
  const user = await AuthService.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Fetch workspace and verify membership (fails secure, redirecting on mismatch)
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

  const userMembership = workspacesList.find((w) => w.workspace?.id === workspaceId);
  const userRole = userMembership?.role || "member";

  // 4. Retrieve profile configs
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const displayName = profile?.display_name || user.email || "User Profile";

  // 5. Fetch membership roster
  const roster = await WorkspaceService.getWorkspaceMembersForUser(workspaceId, user.id);

  return (
    <AppShell
      workspaceId={workspace.id}
      currentWorkspace={{ id: workspace.id, name: workspace.name }}
      workspaces={workspacesItems}
      userEmail={user.email || ""}
      displayName={displayName}
      activeTab="settings"
    >
      <div className="flex flex-col gap-12 animate-[fadeInUp_1s_cubic-bezier(0.16,1,0.3,1)] pb-12">
        {/* Header Title */}
        <header className="flex flex-col gap-2 select-none border-b border-border/40 pb-6">
          <span className="text-xs font-mono text-accent uppercase tracking-widest">
            Workspace Configuration
          </span>
          <h1 className="text-3xl font-display font-medium text-foreground tracking-tight uppercase">
            Settings & Members
          </h1>
        </header>

        {/* Forms Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <WorkspaceSettingsForm
            workspaceId={workspace.id}
            initialName={workspace.name}
            userRole={userRole}
          />

          <ProfileSettingsForm initialDisplayName={displayName} />
        </div>

        {/* Roster Block */}
        <section className="flex flex-col gap-6 w-full border border-border/40 p-6 bg-surface rounded-xl select-none">
          <header className="flex flex-col gap-1 border-b border-border/20 pb-4">
            <h3 className="text-base font-display font-medium uppercase tracking-tight text-foreground">
              Membership Roster
            </h3>
            <p className="text-xs text-muted font-sans">
              Roster displays authorized users with permitted access roles to this tenant container.
            </p>
          </header>

          <div className="flex flex-col gap-3">
            {roster.map((m) => {
              const name = m.profile?.display_name || "Workspace Member";
              const initials = name.substring(0, 2).toUpperCase();
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3.5 bg-surface-subtle border border-border/40 rounded-lg hover:border-border transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-border text-foreground flex items-center justify-center font-display font-medium text-xs">
                      {initials}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-sans font-medium text-foreground">
                        {name}
                      </span>
                      <span className="text-[10px] font-mono text-muted">
                        JOINED: {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                      m.role === "owner"
                        ? "bg-accent/20 text-accent"
                        : m.role === "admin"
                        ? "bg-warning/20 text-warning"
                        : "bg-muted/20 text-muted"
                    }`}
                  >
                    {m.role}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
