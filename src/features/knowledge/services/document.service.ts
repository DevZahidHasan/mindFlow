import { AppErrorClass, normalizeError } from "@/lib/errors";
import { KnowledgeService } from "./knowledge.service";
import { DocumentRepository } from "../repositories/document.repository";
import { KnowledgeNode, DocumentMetadata } from "../schemas/node.schema";

export class DocumentService {
  /**
   * Basic word count heuristic
   */
  private static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Estimate reading time in minutes (avg 238 wpm)
   */
  private static estimateReadingTime(wordCount: number): number {
    return Math.max(1, Math.ceil(wordCount / 238));
  }

  /**
   * Extract title from content (looks for first heading or takes first line)
   */
  private static extractTitle(content: string, fallbackName: string): string {
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    if (lines.length === 0) return fallbackName;

    // Look for markdown heading
    for (const line of lines) {
      if (line.startsWith('# ')) {
        return line.replace(/^#\s+/, '').trim();
      }
    }
    
    // Otherwise take first line, capped at 50 chars
    const firstLine = lines[0].trim();
    if (firstLine.length > 50) {
      return firstLine.substring(0, 50) + '...';
    }
    return firstLine;
  }

  static async ingestDocument(
    workspaceId: string,
    userId: string,
    file: File
  ): Promise<KnowledgeNode> {
    try {
      if (!workspaceId || !userId) {
        throw new AppErrorClass("Workspace ID and User ID are required", "VALIDATION_ERROR", 400);
      }

      // Validate MIME type
      const allowedMimes = ["text/markdown", "text/plain"];
      if (!allowedMimes.includes(file.type)) {
        throw new AppErrorClass("Unsupported file type. Only Markdown and Text are allowed.", "VALIDATION_ERROR", 400);
      }

      // Read file content
      const content = await file.text();
      
      // Parse content
      const title = this.extractTitle(content, file.name.replace(/\.[^/.]+$/, ""));
      const wordCount = this.countWords(content);
      const readingTime = this.estimateReadingTime(wordCount);

      // Create Node
      const node = await KnowledgeService.createNode({
        workspace_id: workspaceId,
        title,
        content,
        type: "note",
      }, userId);

      // Create Document Metadata
      const metadata: DocumentMetadata = {
        source_type: "file_upload",
        processing_status: "ready", // For now, sync parsing means it's ready immediately
        mime_type: file.type,
        word_count: wordCount,
        reading_time: readingTime,
      };

      await DocumentRepository.createMetadata(node.id, metadata);

      return node;
    } catch (err) {
      throw normalizeError(err);
    }
  }
}
