import { RetrievalService } from "./retrieval.service";
import { LLMProvider } from "../providers/llm-provider";
import { AppErrorClass } from "@/lib/errors";
import { Citation } from "@/lib/ai/types";

export class RAGService {
  /**
   * Generates a grounded response using PostgreSQL full-text search and Groq.
   */
  static async askQuestion(workspaceId: string, question: string) {
    try {
      if (!question || !question.trim()) {
        throw new AppErrorClass("Query cannot be empty", "INVALID_QUERY", 400);
      }

      // We pass the raw question straight to PostgreSQL FTS for maximum speed.
      // (Bypassing LLM query expansion to drastically reduce latency as per performance rules).
      const searchTerms = question;

      // 2. PostgreSQL FTS Retrieval
      let retrieved = await RetrievalService.retrieveRelevantKnowledge(workspaceId, searchTerms, 8);

      // If broad query (e.g. "summarize workspace", "explore knowledge") returns no FTS hits, 
      // fetch all active nodes directly so the AI can synthesize the entire workspace!
      const nodes = await (await import("@/features/knowledge/services/knowledge.service")).KnowledgeService.getWorkspaceNodes(workspaceId);

      const citations: Citation[] = [];
      let contextBuilder = "";

      if (retrieved.length > 0) {
        retrieved.forEach((item, index) => {
          const matchingNode = nodes.find(n => n.id === item.nodeId);
          const sourceId = `[SOURCE ${String(index + 1).padStart(2, '0')}]`;
          contextBuilder += `\n${sourceId} (${matchingNode?.title || "Note"})\n${item.content}\n`;
          citations.push({
            nodeId: item.nodeId,
            title: matchingNode?.title || `Note ${item.nodeId.substring(0, 6)}`,
            excerpt: item.content.substring(0, 120) + "...",
            relevance: item.score
          });
        });
      } else if (nodes.length > 0) {
        // Workspace-wide fallback: construct context from all active nodes
        nodes.forEach((node, index) => {
          const sourceId = `[SOURCE ${String(index + 1).padStart(2, '0')}]`;
          const text = `${node.title}\n${node.content || ""}\n${node.metadata?.ai_summary || ""}`;
          contextBuilder += `\n${sourceId} (${node.title})\n${text.substring(0, 500)}\n`;
          citations.push({
            nodeId: node.id,
            title: node.title,
            excerpt: (node.content || node.metadata?.ai_summary || "").substring(0, 120) + "...",
            relevance: 1.0
          });
        });
      } else {
        return {
          answer: "Your workspace is currently empty. Create or import your first note to start exploring your knowledge.",
          citations: []
        };
      }

      // 4. Groq Synthesis
      const systemPrompt = `You are MINDSPACE, an intelligent visual knowledge assistant.
Answer grounded in the supplied knowledge context.
Provide an insightful, editorial, and beautifully formatted response.
When referencing specific notes or concepts, cite the source ID (e.g. [SOURCE 01]).
Do not hallucinate facts outside the provided context.`;

      // 5. Generate Answer
      const response = await LLMProvider.generateAnswer({
        systemPrompt,
        context: contextBuilder.trim(),
        userQuery: question
      }, citations);

      return response;
    } catch (err: any) {
      console.error("RAG Service failed:", err);
      if (err instanceof AppErrorClass) throw err;
      throw new AppErrorClass("Failed to generate an AI response", "AI_RAG_ERROR", 500);
    }
  }
}
