import {
  WorkspaceRepository,
  WorkspaceRow,
  WorkspaceMemberInfo,
} from "../repositories/workspace-repository";
import { AppErrorClass, normalizeError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

/**
 * Domain Service managing workspace operations.
 * Enforces business rules, role-based authorization, and validates session scopes.
 */
export class WorkspaceService {
  /**
   * Fetch a workspace for a user, verifying their membership first.
   */
  static async getWorkspaceForUser(workspaceId: string, userId: string): Promise<WorkspaceRow> {
    try {
      // 1. Verify membership
      const userWorkspaces = await WorkspaceRepository.getUserWorkspaces(userId);
      const isMember = userWorkspaces.some((uw) => uw.workspace?.id === workspaceId);

      if (!isMember) {
        throw new AppErrorClass(
          "Access denied. You are not a member of this workspace.",
          "AUTH_WORKSPACE_DENIED",
          403
        );
      }

      // 2. Fetch workspace
      return await WorkspaceRepository.getWorkspace(workspaceId);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  /**
   * Create a new workspace atomically, assigning the user as owner.
   */
  static async createWorkspace(name: string, userId: string): Promise<string> {
    try {
      if (!userId) {
        throw new AppErrorClass("Unauthenticated user context", "AUTH_REQUIRED", 401);
      }

      if (!name || name.trim().length === 0) {
        throw new AppErrorClass("Workspace name is required", "VALIDATION_ERROR", 400);
      }

      return await WorkspaceRepository.createWorkspace(name.trim());
    } catch (err) {
      throw normalizeError(err);
    }
  }

  /**
   * Fetch members of a workspace, verifying the requester is a member.
   */
  static async getWorkspaceMembersForUser(
    workspaceId: string,
    userId: string
  ): Promise<WorkspaceMemberInfo[]> {
    try {
      // Verify requester is a member
      const userWorkspaces = await WorkspaceRepository.getUserWorkspaces(userId);
      const isMember = userWorkspaces.some((uw) => uw.workspace?.id === workspaceId);

      if (!isMember) {
        throw new AppErrorClass(
          "Access denied. You cannot view the roster for this workspace.",
          "AUTH_WORKSPACE_DENIED",
          403
        );
      }

      return await WorkspaceRepository.getWorkspaceMembers(workspaceId);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  /**
   * Update the workspace name, verifying the user is owner or admin.
   */
  static async updateWorkspaceName(
    workspaceId: string,
    newName: string,
    userId: string
  ): Promise<void> {
    try {
      if (!newName || newName.trim().length === 0) {
        throw new AppErrorClass("Workspace name cannot be empty", "VALIDATION_ERROR", 400);
      }

      // Verify user role
      const userWorkspaces = await WorkspaceRepository.getUserWorkspaces(userId);
      const membership = userWorkspaces.find((uw) => uw.workspace?.id === workspaceId);

      if (!membership) {
        throw new AppErrorClass("Workspace membership not found", "AUTH_WORKSPACE_DENIED", 403);
      }

      if (membership.role !== "owner" && membership.role !== "admin") {
        throw new AppErrorClass(
          "Access denied. Only owners and administrators can rename workspaces.",
          "AUTH_ROLE_DENIED",
          403
        );
      }

      const supabase = await createClient();
      const { error } = await supabase
        .from("workspaces")
        .update({ name: newName.trim() })
        .eq("id", workspaceId);

      if (error) {
        throw new AppErrorClass(error.message, "DB_UPDATE_WORKSPACE_FAILED", 500);
      }
    } catch (err) {
      throw normalizeError(err);
    }
  }
}
