import { createClient } from "@/lib/supabase/server";
import { AppErrorClass } from "@/lib/errors";
import { 
  Project, 
  CreateProjectInput, 
  UpdateProjectInput 
} from "../schemas/project.schema";

export class ProjectRepository {
  static async createProject(input: CreateProjectInput, userId: string): Promise<Project> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("projects")
        .insert({
          workspace_id: input.workspace_id,
          name: input.name,
          description: input.description || null,
          color: input.color || "#d4af37",
          status: input.status || "active",
          created_by: userId,
        })
        .select()
        .single();

      if (error || !data) {
        console.error("Project create error:", error);
        throw new AppErrorClass("Failed to create project", "DATABASE_ERROR", 500);
      }

      return data as Project;
    } catch (err: any) {
      if (err instanceof AppErrorClass) throw err;
      throw new AppErrorClass("Project creation failed", "DATABASE_ERROR", 500);
    }
  }

  static async getWorkspaceProjects(workspaceId: string): Promise<Project[]> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (error) {
        return [];
      }

      return (data || []) as Project[];
    } catch (err: any) {
      return [];
    }
  }

  static async getProjectById(workspaceId: string, projectId: string): Promise<Project | null> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("id", projectId)
        .maybeSingle();

      if (error) {
        throw new AppErrorClass("Failed to fetch project", "DATABASE_ERROR", 500);
      }

      return (data as Project) || null;
    } catch (err: any) {
      if (err instanceof AppErrorClass) throw err;
      throw new AppErrorClass("Failed to load project", "DATABASE_ERROR", 500);
    }
  }

  static async updateProject(input: UpdateProjectInput): Promise<Project> {
    try {
      const supabase = await createClient();
      const updates: any = { updated_at: new Date().toISOString() };
      if (input.name !== undefined) updates.name = input.name;
      if (input.description !== undefined) updates.description = input.description;
      if (input.color !== undefined) updates.color = input.color;
      if (input.status !== undefined) updates.status = input.status;

      const { data, error } = await supabase
        .from("projects")
        .update(updates)
        .eq("workspace_id", input.workspace_id)
        .eq("id", input.id)
        .select()
        .single();

      if (error || !data) {
        throw new AppErrorClass("Failed to update project", "DATABASE_ERROR", 500);
      }

      return data as Project;
    } catch (err: any) {
      if (err instanceof AppErrorClass) throw err;
      throw new AppErrorClass("Project update failed", "DATABASE_ERROR", 500);
    }
  }

  static async assignNodeToProject(workspaceId: string, projectId: string, nodeId: string): Promise<void> {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("project_nodes")
        .insert({
          workspace_id: workspaceId,
          project_id: projectId,
          node_id: nodeId,
        });

      if (error) {
        if (error.code === "23505") return; // duplicate assignment, treat as idempotent
        throw new AppErrorClass("Failed to assign node to project", "DATABASE_ERROR", 500);
      }
    } catch (err: any) {
      if (err instanceof AppErrorClass) throw err;
      throw new AppErrorClass("Node project assignment failed", "DATABASE_ERROR", 500);
    }
  }

  static async removeNodeFromProject(workspaceId: string, projectId: string, nodeId: string): Promise<void> {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("project_nodes")
        .delete()
        .eq("workspace_id", workspaceId)
        .eq("project_id", projectId)
        .eq("node_id", nodeId);

      if (error) {
        throw new AppErrorClass("Failed to remove node from project", "DATABASE_ERROR", 500);
      }
    } catch (err: any) {
      if (err instanceof AppErrorClass) throw err;
      throw new AppErrorClass("Node project removal failed", "DATABASE_ERROR", 500);
    }
  }

  static async getProjectNodeIds(workspaceId: string, projectId: string): Promise<string[]> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("project_nodes")
        .select("node_id")
        .eq("workspace_id", workspaceId)
        .eq("project_id", projectId);

      if (error) {
        throw new AppErrorClass("Failed to get project nodes", "DATABASE_ERROR", 500);
      }

      return (data || []).map(row => row.node_id);
    } catch (err: any) {
      if (err instanceof AppErrorClass) throw err;
      throw new AppErrorClass("Failed to load project node IDs", "DATABASE_ERROR", 500);
    }
  }

  static async getNodeProjectIds(workspaceId: string, nodeId: string): Promise<string[]> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("project_nodes")
        .select("project_id")
        .eq("workspace_id", workspaceId)
        .eq("node_id", nodeId);

      if (error) return [];
      return (data || []).map(row => row.project_id);
    } catch (err) {
      return [];
    }
  }
}
