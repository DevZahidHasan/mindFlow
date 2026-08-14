import { createClient } from "@/lib/supabase/server";
import { AppErrorClass } from "@/lib/errors";
import { 
  Collection, 
  CreateCollectionInput, 
  UpdateCollectionInput 
} from "../schemas/collection.schema";

export class CollectionRepository {
  static async createCollection(input: CreateCollectionInput): Promise<Collection> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("collections")
        .insert({
          workspace_id: input.workspace_id,
          name: input.name,
          icon: input.icon || "✦",
        })
        .select()
        .single();

      if (error || !data) {
        throw new AppErrorClass("Failed to create collection", "DATABASE_ERROR", 500);
      }

      return data as Collection;
    } catch (err: any) {
      if (err instanceof AppErrorClass) throw err;
      throw new AppErrorClass("Collection creation failed", "DATABASE_ERROR", 500);
    }
  }

  static async getWorkspaceCollections(workspaceId: string): Promise<Collection[]> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (error) {
        return [];
      }

      return (data || []) as Collection[];
    } catch (err: any) {
      return [];
    }
  }

  static async assignNodeToCollection(workspaceId: string, collectionId: string, nodeId: string): Promise<void> {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("collection_nodes")
        .insert({
          workspace_id: workspaceId,
          collection_id: collectionId,
          node_id: nodeId,
        });

      if (error && error.code !== "23505") {
        throw new AppErrorClass("Failed to assign node to collection", "DATABASE_ERROR", 500);
      }
    } catch (err: any) {
      if (err instanceof AppErrorClass) throw err;
      throw new AppErrorClass("Collection assignment failed", "DATABASE_ERROR", 500);
    }
  }

  static async removeNodeFromCollection(workspaceId: string, collectionId: string, nodeId: string): Promise<void> {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("collection_nodes")
        .delete()
        .eq("workspace_id", workspaceId)
        .eq("collection_id", collectionId)
        .eq("node_id", nodeId);

      if (error) {
        throw new AppErrorClass("Failed to remove node from collection", "DATABASE_ERROR", 500);
      }
    } catch (err: any) {
      if (err instanceof AppErrorClass) throw err;
      throw new AppErrorClass("Collection removal failed", "DATABASE_ERROR", 500);
    }
  }

  static async getCollectionNodeIds(workspaceId: string, collectionId: string): Promise<string[]> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("collection_nodes")
        .select("node_id")
        .eq("workspace_id", workspaceId)
        .eq("collection_id", collectionId);

      if (error) throw new AppErrorClass("Failed to fetch collection nodes", "DATABASE_ERROR", 500);
      return (data || []).map(row => row.node_id);
    } catch (err: any) {
      if (err instanceof AppErrorClass) throw err;
      throw new AppErrorClass("Failed to get collection node IDs", "DATABASE_ERROR", 500);
    }
  }
}
