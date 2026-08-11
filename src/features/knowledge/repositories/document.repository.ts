import { createClient } from "@/lib/supabase/server";
import { AppErrorClass } from "@/lib/errors";
import { DocumentMetadata } from "../schemas/node.schema";

export class DocumentRepository {
  static async createMetadata(nodeId: string, metadata: DocumentMetadata): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("knowledge_document_metadata")
      .insert({
        node_id: nodeId,
        source_type: metadata.source_type,
        processing_status: metadata.processing_status,
        mime_type: metadata.mime_type,
        word_count: metadata.word_count,
        reading_time: metadata.reading_time
      });

    if (error) {
      console.error(error);
      throw new AppErrorClass(
        "Database Error: Could not save document metadata.",
        "DB_ERROR",
        500
      );
    }
  }

  static async updateProcessingStatus(nodeId: string, status: DocumentMetadata["processing_status"]): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("knowledge_document_metadata")
      .update({ processing_status: status })
      .eq("node_id", nodeId);

    if (error) {
      console.error(error);
      throw new AppErrorClass(
        "Database Error: Could not update document status.",
        "DB_ERROR",
        500
      );
    }
  }
}
