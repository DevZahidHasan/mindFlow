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
}
