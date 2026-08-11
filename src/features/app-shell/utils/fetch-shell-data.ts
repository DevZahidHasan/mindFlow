import { AuthService } from "@/features/auth/services/auth-service";
import { WorkspaceService } from "@/features/workspaces/services/workspace-service";
import { WorkspaceRepository } from "@/features/workspaces/repositories/workspace-repository";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WorkspaceItem } from "../components/workspace-switcher";

export async function fetchAppShellData(workspaceId: string) {
  const user = await AuthService.getUser();
  if (!user) {
    redirect("/login");
  }

  let workspace;
  try {
    workspace = await WorkspaceService.getWorkspaceForUser(workspaceId, user.id);
  } catch (err) {
    redirect("/w");
  }

  const workspacesList = await WorkspaceRepository.getUserWorkspaces(user.id);
  const workspacesItems: WorkspaceItem[] = workspacesList
    .filter((w) => w.workspace !== null)
    .map((w) => ({
      id: w.workspace!.id,
      name: w.workspace!.name,
    }));

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const displayName = profile?.display_name || user.email || "User Profile";

  return {
    user,
    workspace,
    workspacesItems,
    displayName,
  };
}
