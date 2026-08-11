import { ChunkingService } from "./chunking.service";
import { KnowledgeRetrievalRepository } from "../repositories/knowledge-retrieval.repository";
import { AppErrorClass } from "@/lib/errors";

export class IngestionService {
  /**
   * Generates FTS chunks for a document/note and stores them in the database.
   */
  static async ingestDocument(
    workspaceId: string,
    nodeId: string,
    content: string,
    title: string
  ): Promise<void> {
    try {
      if (!content || !content.trim()) return;

      // 1. Chunk the content using deterministic rules
      const chunks = ChunkingService.chunkDocument(content, title);
      
      // 2. Delete any existing chunks for this node to avoid duplicates on update
      await KnowledgeRetrievalRepository.deleteChunksForNode(workspaceId, nodeId);

      // 3. Prepare chunk payload
      const payload = chunks.map((chunk, index) => ({
        workspaceId,
        nodeId,
        chunkIndex: index,
        content: chunk
      }));

      // 4. Insert chunks into FTS chunk table
      await KnowledgeRetrievalRepository.insertChunks(payload);

    } catch (err: any) {
      console.error(`Ingestion failed for node ${nodeId}:`, err);
      // Fail silently if this runs in the background, or throw AppError if awaited by the UI.
    }
  }
}
