
import { KnowledgeRetrievalRepository } from "../repositories/knowledge-retrieval.repository";
import { AppErrorClass } from "@/lib/errors";

export interface RetrievedKnowledge {
  nodeId: string;
  chunkId: string;
  content: string;
  score: number;
}

export class RetrievalService {
  /**
   * Performs PostgreSQL Full-Text Search and ranks results.
   */
  static async retrieveRelevantKnowledge(
    workspaceId: string,
    query: string,
    limit: number = 10
  ): Promise<RetrievedKnowledge[]> {
    try {
      // Direct PostgreSQL native retrieval (lexical FTS)
      const results = await KnowledgeRetrievalRepository.searchChunks(workspaceId, query, limit);

      // Map to strict domain interface
      return results.map((res) => ({
        nodeId: res.nodeId,
        chunkId: res.id,
        content: res.content,
        score: res.similarity,
      }));
    } catch (err) {
      console.error("Retrieval error:", err);
      if (err instanceof AppErrorClass) throw err;
      throw new AppErrorClass("Retrieval pipeline failed", "RETRIEVAL_FAILED", 500);
    }
  }
}
