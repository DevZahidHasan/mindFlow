import { createClient } from "@/lib/supabase/server";
import { AppErrorClass, normalizeError } from "@/lib/errors";
import { KnowledgeEdge, CreateEdgeInput } from "../schemas/edge.schema";

export class EdgeRepository {
  /**
   * Fetch all edges for a workspace.
   */
  static async getEdgesByWorkspace(workspaceId: string): Promise<KnowledgeEdge[]> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("knowledge_edges")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new AppErrorClass("Failed to fetch edges", "DB_FETCH_EDGES_FAILED", 500);
      }

      return data as KnowledgeEdge[];
    } catch (err) {
      throw normalizeError(err);
    }
  }

  /**
   * Create a new edge.
   */
  static async createEdge(input: CreateEdgeInput): Promise<KnowledgeEdge> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("knowledge_edges")
        .insert({
          workspace_id: input.workspace_id,
          source_id: input.source_id,
          target_id: input.target_id,
          relationship_type: input.relationship_type,
          label: input.label,
          weight: input.weight,
        })
        .select()
        .single();

      if (error) {
        // Handle unique constraint violation specifically for better error messages
        if (error.code === '23505') {
           throw new AppErrorClass("This relationship already exists.", "DB_DUPLICATE_EDGE", 409);
        }
        throw new AppErrorClass(error.message, "DB_CREATE_EDGE_FAILED", 500);
      }

      return data as KnowledgeEdge;
    } catch (err) {
      throw normalizeError(err);
    }
  }

  /**
   * Delete an edge by ID.
   */
  static async deleteEdge(edgeId: string, workspaceId: string): Promise<void> {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("knowledge_edges")
        .delete()
        .eq("id", edgeId)
        .eq("workspace_id", workspaceId);

      if (error) {
        throw new AppErrorClass(error.message, "DB_DELETE_EDGE_FAILED", 500);
      }
    } catch (err) {
      throw normalizeError(err);
    }
  }
}
