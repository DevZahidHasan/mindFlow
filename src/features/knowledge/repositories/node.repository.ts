import { createClient } from "@/lib/supabase/server";
import { AppErrorClass, normalizeError } from "@/lib/errors";
import { KnowledgeNode, CreateNodeInput, UpdateNodeInput } from "../schemas/node.schema";

export class NodeRepository {
  /**
   * Fetch all nodes for a workspace.
   */
  static async getNodesByWorkspace(workspaceId: string): Promise<KnowledgeNode[]> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("knowledge_nodes")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("updated_at", { ascending: false });

      if (error) {
        throw new AppErrorClass("Failed to fetch nodes", "DB_FETCH_NODES_FAILED", 500);
      }

      return data as KnowledgeNode[];
    } catch (err) {
      throw normalizeError(err);
    }
  }

  /**
   * Fetch a single node by ID.
   */
  static async getNodeById(nodeId: string, workspaceId: string): Promise<KnowledgeNode> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("knowledge_nodes")
        .select("*")
        .eq("id", nodeId)
        .eq("workspace_id", workspaceId)
        .single();

      if (error) {
        throw new AppErrorClass("Node not found", "DB_NODE_NOT_FOUND", 404);
      }

      return data as KnowledgeNode;
    } catch (err) {
      throw normalizeError(err);
    }
  }

  /**
   * Create a new node.
   */
  static async createNode(input: CreateNodeInput, userId: string): Promise<KnowledgeNode> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("knowledge_nodes")
        .insert({
          workspace_id: input.workspace_id,
          title: input.title,
          type: input.type,
          content: input.content,
          metadata: input.metadata,
          created_by: userId,
        })
        .select()
        .single();

      if (error) {
        throw new AppErrorClass(error.message, "DB_CREATE_NODE_FAILED", 500);
      }

      return data as KnowledgeNode;
    } catch (err) {
      throw normalizeError(err);
    }
  }

  /**
   * Update an existing node.
   */
  static async updateNode(input: UpdateNodeInput): Promise<KnowledgeNode> {
    try {
      const supabase = await createClient();
      
      const payload: Record<string, unknown> = {};
      if (input.title !== undefined) payload.title = input.title;
      if (input.content !== undefined) payload.content = input.content;
      if (input.metadata !== undefined) payload.metadata = input.metadata;
      if (input.status !== undefined) payload.status = input.status;

      const { data, error } = await supabase
        .from("knowledge_nodes")
        .update(payload)
        .eq("id", input.id)
        .eq("workspace_id", input.workspace_id)
        .select()
        .single();

      if (error) {
        throw new AppErrorClass(error.message, "DB_UPDATE_NODE_FAILED", 500);
      }

      return data as KnowledgeNode;
    } catch (err) {
      throw normalizeError(err);
    }
  }

  /**
   * Delete a node by ID.
   */
  static async deleteNode(nodeId: string, workspaceId: string): Promise<void> {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("knowledge_nodes")
        .delete()
        .eq("id", nodeId)
        .eq("workspace_id", workspaceId);

      if (error) {
        throw new AppErrorClass(error.message, "DB_DELETE_NODE_FAILED", 500);
      }
    } catch (err) {
      throw normalizeError(err);
    }
  }
}
