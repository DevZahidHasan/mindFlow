"use server";

import { createClient } from "@/lib/supabase/server";
import { normalizeError } from "@/lib/errors";
import { DocumentService } from "../services/document.service";
import { KnowledgeNode } from "../schemas/node.schema";

export async function importDocumentAction(formData: FormData): Promise<{ success: boolean; data?: KnowledgeNode; error?: { message: string; code: string; status: number } }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const workspaceId = formData.get("workspaceId") as string;
    const file = formData.get("file") as File;

    if (!workspaceId || !file) {
      throw new Error("Workspace ID and file are required");
    }

    // Call service to process and ingest
    const node = await DocumentService.ingestDocument(workspaceId, user.id, file);

    return {
      success: true,
      data: node,
    };
  } catch (error) {
    const appError = normalizeError(error);
    return {
      success: false,
      error: {
        message: appError.message,
        code: appError.code,
        status: appError.status,
      },
    };
  }
}
