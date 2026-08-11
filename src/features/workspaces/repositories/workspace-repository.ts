import { createClient } from "@/lib/supabase/server";
import { AppErrorClass, normalizeError } from "@/lib/errors";

export interface WorkspaceRow {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface UserWorkspaceJoin {
  role: string;
  workspace: {
    id: string;
    name: string;
    created_at: string;
  } | null;
}

export interface WorkspaceMemberInfo {
  id: string;
  role: string;
  createdAt: string;
  profile: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

/**
 * Data Repository handling database reads and transactions.
 * Never performs user-level authorization verification directly (deferred to services).
 */
export class WorkspaceRepository {
  /**
   * Fetch a workspace record by UUID.
   */
  static async getWorkspace(id: string): Promise<WorkspaceRow> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new AppErrorClass("Workspace not found", "DB_WORKSPACE_NOT_FOUND", 404);
      }

      return data as WorkspaceRow;
    } catch (err) {
      throw normalizeError(err);
    }
  }

  /**
   * Fetch all workspaces that a user belongs to.
   */
  static async getUserWorkspaces(userId: string): Promise<UserWorkspaceJoin[]> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("workspace_members")
        .select(`
          role,
          workspaces (
            id,
            name,
            created_at
          )
        `)
        .eq("user_id", userId);

      if (error) {
        throw new AppErrorClass("Failed to fetch user workspaces", "DB_FETCH_WORKSPACES_FAILED", 500);
      }

      // Convert join rows into strict types without using 'any'
      const rows = data as unknown as Array<{
        role: string;
        workspaces: {
          id: string;
          name: string;
          created_at: string;
        } | null;
      }>;

      return rows.map((item) => ({
        role: item.role,
        workspace: item.workspaces,
      }));
    } catch (err) {
      throw normalizeError(err);
    }
  }

  /**
   * Fetch all membership rosters for a given workspace.
   */
  static async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMemberInfo[]> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("workspace_members")
        .select(`
          id,
          role,
          created_at,
          profiles (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq("workspace_id", workspaceId);

      if (error) {
        throw new AppErrorClass("Failed to fetch workspace members", "DB_FETCH_MEMBERS_FAILED", 500);
      }

      const rows = data as unknown as Array<{
        id: string;
        role: string;
        created_at: string;
        profiles: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
        } | null;
      }>;

      return rows.map((item) => ({
        id: item.id,
        role: item.role,
        createdAt: item.created_at,
        profile: item.profiles,
      }));
    } catch (err) {
      throw normalizeError(err);
    }
  }

  /**
   * Invoke the atomic workspace creation SQL function.
   */
  static async createWorkspace(name: string): Promise<string> {
    try {
      const supabase = await createClient();
      const { data: workspaceId, error } = await supabase.rpc("create_workspace_with_owner", {
        workspace_name: name,
      });

      if (error) {
        throw new AppErrorClass(error.message, "DB_CREATE_WORKSPACE_FAILED", 500);
      }

      return workspaceId as string;
    } catch (err) {
      throw normalizeError(err);
    }
  }
}
