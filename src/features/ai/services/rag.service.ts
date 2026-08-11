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
      const retrieved = await RetrievalService.retrieveRelevantKnowledge(workspaceId, searchTerms, 8);

      if (retrieved.length === 0) {
        return {
          answer: "I couldn't find enough information in your MINDSPACE knowledge to answer that reliably.",
          citations: []
        };
      }

      // 3. Context Construction
      const citations: Citation[] = [];
      let contextBuilder = "";

      retrieved.forEach((item, index) => {
        const sourceId = `[SOURCE ${String(index + 1).padStart(2, '0')}]`;
        contextBuilder += `\n${sourceId}\n${item.content}\n`;
        citations.push({
          nodeId: item.nodeId,
          title: `Document ${item.nodeId.substring(0, 4)}`, // Ideally we'd join title from DB, but keeping it simple for now
          excerpt: item.content.substring(0, 100) + "...",
          relevance: item.score
        });
      });

      // 4. Groq Synthesis
      const systemPrompt = `You are MINDSPACE, an intelligent knowledge assistant.
Answer only from the supplied knowledge context.
If the context does not contain enough information, say that the knowledge base does not contain enough information to answer confidently.
Do not invent facts. Do not invent citations. Do not claim information exists when it does not.
Use only the provided source context. When making a claim, cite the source ID (e.g. [SOURCE 01]).`;

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
