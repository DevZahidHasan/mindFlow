import { KnowledgeRetrievalRepository } from "../repositories/knowledge-retrieval.repository";
import { NodeRepository } from "@/features/knowledge/repositories/node.repository";
import { EdgeRepository } from "@/features/knowledge/repositories/edge.repository";
import { SemanticConnection } from "@/lib/ai/types";

const STOP_WORDS = new Set([
  "about", "after", "again", "against", "all", "also", "and", "another", "any",
  "because", "before", "being", "between", "both", "but", "by", "came", "can",
  "cannot", "come", "could", "did", "does", "doing", "each", "even", "every",
  "for", "from", "further", "get", "got", "had", "has", "have", "having", "her",
  "here", "hers", "herself", "him", "himself", "his", "how", "into", "its",
  "itself", "just", "like", "make", "many", "more", "most", "much", "must",
  "never", "new", "no", "not", "now", "off", "old", "only", "other", "our",
  "ours", "ourselves", "out", "over", "own", "same", "see", "she", "should",
  "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves",
  "then", "there", "these", "they", "this", "those", "through", "too", "under",
  "until", "up", "very", "was", "way", "we", "well", "were", "what", "where",
  "which", "while", "who", "whom", "why", "will", "with", "would", "you", "your",
  "yours", "yourself", "yourselves", "strictly", "requires", "before", "after", "step"
]);

export class RelationshipService {
  /**
   * Discovers both confirmed relationships (edges) and ambient semantic relationships.
   */
  static async discoverRelationships(
    workspaceId: string,
    currentNodeId: string,
    content: string
  ): Promise<SemanticConnection[]> {
    try {
      const connections: SemanticConnection[] = [];
      const seen = new Set<string>();

      // 1. Fetch already confirmed edges in the workspace
      try {
        const existingEdges = await EdgeRepository.getEdgesByWorkspace(workspaceId);
        const relatedEdges = existingEdges.filter(
          (e) => e.source_id === currentNodeId || e.target_id === currentNodeId
        );

        for (const edge of relatedEdges) {
          const targetId = edge.source_id === currentNodeId ? edge.target_id : edge.source_id;
          if (seen.has(targetId)) continue;
          seen.add(targetId);

          try {
            const node = await NodeRepository.getNodeById(targetId, workspaceId);
            connections.push({
              targetNodeId: targetId,
              title: node.title,
              similarity: 1.0,
              isConnected: true,
              explanation: "Confirmed connection in your knowledge universe."
            });
          } catch (e) {
            // Node might have been deleted
          }
        }
      } catch (edgeErr) {
        console.error("Failed to load confirmed edges for note orbit:", edgeErr);
      }

      if (!content || !content.trim()) return connections;

      // 2. Extract meaningful domain keywords across the ENTIRE content
      const words = content
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

      // Pick up to 10 unique keywords
      const uniqueWords = Array.from(new Set(words)).slice(0, 10);

      if (uniqueWords.length === 0) return connections;

      // Using " OR " allows websearch_to_tsquery to find partial lexical overlap
      const searchQuery = uniqueWords.join(" OR ");
      const matches = await KnowledgeRetrievalRepository.searchChunks(workspaceId, searchQuery, 6);

      for (const match of matches) {
        if (match.nodeId === currentNodeId) continue;
        if (seen.has(match.nodeId)) continue;
        seen.add(match.nodeId);

        try {
          const node = await NodeRepository.getNodeById(match.nodeId, workspaceId);
          connections.push({
            targetNodeId: match.nodeId,
            title: node.title,
            similarity: match.similarity,
            isConnected: false,
            explanation: "Shared keywords and semantic overlap in your notes."
          });
        } catch (e) {
          // If the node was deleted but chunks remain, ignore it
        }
      }

      return connections;
    } catch (err: any) {
      console.error("Relationship discovery failed:", err);
      return [];
    }
  }
}
