import { createClient } from "@/lib/supabase/server";
import { AppErrorClass } from "@/lib/errors";

export interface RetrievedKnowledgeChunk {
  id: string;
  nodeId: string;
  workspaceId: string;
  content: string;
  chunkIndex: number;
  similarity: number;
}

export class KnowledgeRetrievalRepository {
  /**
   * Searches knowledge chunks using PostgreSQL Full-Text Search.
   */
  static async searchChunks(
    workspaceId: string,
    query: string,
    matchCount: number = 10
  ): Promise<RetrievedKnowledgeChunk[]> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase.rpc("search_knowledge_chunks", {
        query_text: query,
        query_workspace_id: workspaceId,
        match_count: matchCount,
      });

      if (error) {
        console.error("FTS search error:", error);
        throw new AppErrorClass("Failed to execute search.", "RETRIEVAL_FAILED", 500);
      }

      if (!data) return [];

      return data.map((row: any) => ({
        id: row.id,
        nodeId: row.node_id,
        workspaceId: row.workspace_id,
        content: row.content,
        chunkIndex: row.chunk_index,
        similarity: row.similarity,
      }));
    } catch (err: any) {
      if (err instanceof AppErrorClass) throw err;
      throw new AppErrorClass("Knowledge retrieval failed.", "RETRIEVAL_FAILED", 500);
    }
  }

  /**
   * Deletes all chunks associated with a specific knowledge node.
   */
  static async deleteChunksForNode(workspaceId: string, nodeId: string): Promise<void> {
    try {
      const supabase = await createClient();

      const { error } = await supabase
        .from("knowledge_chunks")
        .delete()
        .eq("workspace_id", workspaceId)
        .eq("node_id", nodeId);

      if (error) {
        console.error("Delete chunks error:", error);
        throw new AppErrorClass("Failed to delete chunks.", "DATABASE_ERROR", 500);
      }
    } catch (err: any) {
      if (err instanceof AppErrorClass) throw err;
      throw new AppErrorClass("Failed to delete knowledge chunks.", "DATABASE_ERROR", 500);
    }
  }

  /**
   * Inserts multiple chunks into the database.
   */
  static async insertChunks(
    chunks: { nodeId: string; workspaceId: string; chunkIndex: number; content: string }[]
  ): Promise<void> {
    if (chunks.length === 0) return;

    try {
      const supabase = await createClient();

      // Transform camelCase to snake_case for Supabase
      const payload = chunks.map(chunk => ({
        node_id: chunk.nodeId,
        workspace_id: chunk.workspaceId,
        chunk_index: chunk.chunkIndex,
        content: chunk.content,
      }));

      const { error } = await supabase.from("knowledge_chunks").insert(payload);

      if (error) {
        console.error("Insert chunks error:", error);
        throw new AppErrorClass("Failed to insert chunks.", "DATABASE_ERROR", 500);
      }
    } catch (err: any) {
      if (err instanceof AppErrorClass) throw err;
      throw new AppErrorClass("Failed to insert knowledge chunks.", "DATABASE_ERROR", 500);
    }
  }
}
