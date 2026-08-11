import { KnowledgeRetrievalRepository } from "../repositories/knowledge-retrieval.repository";
import { NodeRepository } from "@/features/knowledge/repositories/node.repository";
import { AppErrorClass } from "@/lib/errors";
import { SemanticConnection } from "@/lib/ai/types";

export class RelationshipService {
  /**
   * Discovers ambient semantic relationships based on text overlap using FTS.
   */
  static async discoverRelationships(
    workspaceId: string,
    currentNodeId: string,
    content: string
  ): Promise<SemanticConnection[]> {
    try {
      if (!content || !content.trim()) return [];

      // Extract a few key terms from content for an OR search query
      // (crude keyword extraction: grab unique words > 4 chars, max 6 words)
      const words = content.replace(/[^\w\s]/g, "").split(/\s+/).filter(w => w.length > 4);
      const uniqueWords = Array.from(new Set(words)).slice(0, 6);
      
      if (uniqueWords.length === 0) return [];
      
      // Using " OR " allows websearch_to_tsquery to find partial lexical overlap
      const searchQuery = uniqueWords.join(" OR ");

      const matches = await KnowledgeRetrievalRepository.searchChunks(workspaceId, searchQuery, 5);

      const connections: SemanticConnection[] = [];
      const seen = new Set<string>();

      for (const match of matches) {
        if (match.nodeId === currentNodeId) continue;
        if (seen.has(match.nodeId)) continue;
        
        seen.add(match.nodeId);
        
        try {
          // Fetch the real title of the related node
          const node = await NodeRepository.getNodeById(match.nodeId, workspaceId);
          connections.push({
            targetNodeId: match.nodeId,
            title: node.title,
            similarity: match.similarity, 
            explanation: "Shared keywords and semantic overlap in your notes."
          });
        } catch (e) {
          // If the node was deleted but chunks remain, ignore it
        }
      }

      return connections;
    } catch (err: any) {
      console.error("Relationship discovery failed:", err);
      return []; // Ambient features should not break the app
    }
  }
}
