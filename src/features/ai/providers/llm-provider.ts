import Groq from "groq-sdk";
import { AI_CONFIG, requireAiSecrets } from "@/lib/ai/config";
import { LLMRequest, RAGResponse, Citation } from "@/lib/ai/types";
import { AppErrorClass } from "@/lib/errors";

export class LLMProvider {
  /**
   * Generates a structured answer using the provided context via Groq.
   */
  static async generateAnswer(request: LLMRequest, availableCitations: Citation[]): Promise<RAGResponse> {
    try {
      requireAiSecrets();

      const groq = new Groq({ apiKey: AI_CONFIG.GROQ_API_KEY });

      const finalPrompt = `
AVAILABLE KNOWLEDGE (Use ONLY this context to answer the user's question. If the answer is not contained here, state that you do not have enough information):

${request.context}

USER QUERY:
${request.userQuery}
`;

      const response = await groq.chat.completions.create({
        model: AI_CONFIG.MODELS.CHAT,
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: finalPrompt }
        ],
        temperature: 0.2, // Low temperature for grounded responses
        stream: false, // Setting up for stream later
      });

      const text = response.choices[0]?.message?.content || "";

      // Pass through the available citations that were actually injected into the context
      return {
        answer: text,
        citations: availableCitations
      };
    } catch (err: any) {
      console.error("Groq generation failed:", err);
      
      // Normalize Groq errors
      if (err?.status === 401) throw new AppErrorClass("Invalid Groq API Key", "AI_UNAUTHORIZED", 401);
      if (err?.status === 429) throw new AppErrorClass("Groq Rate Limited", "AI_RATE_LIMITED", 429);
      if (err?.status >= 500) throw new AppErrorClass("Groq Service Unavailable", "AI_UNAVAILABLE", 502);

      throw new AppErrorClass("Failed to generate answer", "AI_REQUEST_FAILED", 500);
    }
  }

  /**
   * Generates a concise summary for the provided text using Groq.
   */
  static async generateSummary(content: string): Promise<string> {
    try {
      requireAiSecrets();

      const groq = new Groq({ apiKey: AI_CONFIG.GROQ_API_KEY });

      const systemPrompt = `You are MINDSPACE, an intelligent knowledge assistant.
Your task is to summarize the provided knowledge content.
RULES:
1. Only summarize the supplied content. Do not invent facts or introduce external information.
2. Keep the summary concise, strictly between 1 and 3 sentences.
3. Preserve important terminology and prefer concrete information over vague descriptions.
4. Return ONLY the summary text, nothing else. If the content is empty or insufficient, return "Insufficient content to generate a summary."`;

      const response = await groq.chat.completions.create({
        model: AI_CONFIG.MODELS.CHAT,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content }
        ],
        temperature: 0.1, // Even lower for strict summarization
        stream: false,
      });

      return response.choices[0]?.message?.content || "Insufficient content to generate a summary.";
    } catch (err: any) {
      console.error("Groq summarization failed:", err);
      
      if (err?.status === 401) throw new AppErrorClass("Invalid Groq API Key", "AI_UNAUTHORIZED", 401);
      if (err?.status === 429) throw new AppErrorClass("Groq Rate Limited", "AI_RATE_LIMITED", 429);
      if (err?.status >= 500) throw new AppErrorClass("Groq Service Unavailable", "AI_UNAVAILABLE", 502);

      throw new AppErrorClass("Failed to generate summary", "AI_SUMMARY_FAILED", 500);
    }
  }
}
