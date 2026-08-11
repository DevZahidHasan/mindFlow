import { AI_CONFIG } from "@/lib/ai/config";

export class ChunkingService {
  /**
   * Splits a document into overlapping semantic chunks based on paragraphs.
   * Prioritizes paragraph boundaries and limits by token count approximation (4 chars ~= 1 token).
   * Optionally prepends the title to the first chunk for better FTS ranking.
   */
  static chunkDocument(content: string, title?: string): string[] {
    const maxTokens = AI_CONFIG.CHUNKING.MAX_TOKENS;
    const overlapTokens = AI_CONFIG.CHUNKING.OVERLAP_TOKENS;

    const maxChars = maxTokens * 4;
    const overlapChars = overlapTokens * 4;

    const paragraphs = content.split(/\n\s*\n/);
    const chunks: string[] = [];

    let currentChunk = title ? `${title}\n\n` : "";

    for (const p of paragraphs) {
      const paragraph = p.trim();
      if (!paragraph) continue;

      if (currentChunk.length + paragraph.length <= maxChars) {
        currentChunk += (currentChunk && currentChunk !== `${title}\n\n` ? "\n\n" : "") + paragraph;
      } else {
        // If current chunk is not empty, push it
        if (currentChunk) {
          chunks.push(currentChunk);
          // Start a new chunk with overlap
          currentChunk = currentChunk.slice(-overlapChars) + "\n\n" + paragraph;
        } else {
          // Paragraph itself is larger than maxChars, we must split by sentences
          const sentences = paragraph.split(/(?<=[.?!])\s+/);
          for (const s of sentences) {
            if (currentChunk.length + s.length <= maxChars) {
              currentChunk += (currentChunk ? " " : "") + s;
            } else {
              if (currentChunk) chunks.push(currentChunk);
              currentChunk = s;
            }
          }
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks.filter(c => c.length > 0);
  }
}
