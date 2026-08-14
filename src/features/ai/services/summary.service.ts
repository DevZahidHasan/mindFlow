import { LLMProvider } from "../providers/llm-provider";
import { KnowledgeService } from "@/features/knowledge/services/knowledge.service";
import { AppErrorClass } from "@/lib/errors";

export class SummaryService {
  /**
   * Generates a summary for a knowledge node and securely updates its metadata.
   */
  static async summarizeNode(workspaceId: string, nodeId: string): Promise<string> {
    try {
      // 1. Validate inputs
      if (!workspaceId || !nodeId) {
        throw new AppErrorClass("Missing workspace or node ID", "VALIDATION_ERROR", 400);
      }

      // 2. Load the requested knowledge node and verify ownership implicitly via the service
      const node = await KnowledgeService.getNode(nodeId, workspaceId);
      
      if (!node.content || !node.content.trim()) {
        throw new AppErrorClass("Node has no content to summarize", "VALIDATION_ERROR", 400);
      }

      // 3. Generate summary via Groq
      const summaryText = await LLMProvider.generateSummary(node.content);

      if (!summaryText || summaryText.includes("Insufficient content")) {
        throw new AppErrorClass("Could not generate a meaningful summary from this content", "AI_SUMMARY_FAILED", 400);
      }

      // 4. Safely merge metadata and persist
      const currentMetadata = node.metadata || {};
      const updatedMetadata = {
        ...currentMetadata,
        ai_summary: summaryText
      };

      await KnowledgeService.updateNode({
        id: nodeId,
        workspace_id: workspaceId,
        metadata: updatedMetadata
      });

      return summaryText;
    } catch (err: any) {
      console.error(`Summary generation failed for node ${nodeId}:`, err);
      if (err instanceof AppErrorClass) throw err;
      throw new AppErrorClass("Failed to summarize node", "AI_SUMMARY_FAILED", 500);
    }
  }
}
