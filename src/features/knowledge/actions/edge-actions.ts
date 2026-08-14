"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { KnowledgeService } from "../services/knowledge.service";
import { AppErrorClass, normalizeError } from "@/lib/errors";

export async function acceptSemanticRelationshipAction(
  workspaceId: string,
  sourceId: string,
  targetId: string
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new AppErrorClass("Unauthorized", "UNAUTHORIZED", 401);
    }

    if (!workspaceId || !sourceId || !targetId) {
      throw new AppErrorClass("Invalid edge parameters", "VALIDATION_ERROR", 400);
    }

    if (sourceId === targetId) {
      throw new AppErrorClass("Cannot connect a node to itself", "VALIDATION_ERROR", 400);
    }

    // KnowledgeService enforces RLS implicitly via DB when creating the edge
    let edge;
    try {
      edge = await KnowledgeService.createEdge({
        workspace_id: workspaceId,
        source_id: sourceId,
        target_id: targetId,
        relationship_type: "related",
        weight: 1.0,
        label: "Semantic Match"
      });
    } catch (createErr: any) {
      if (createErr?.code === "DB_DUPLICATE_EDGE") {
        return { success: true, data: { workspace_id: workspaceId, source_id: sourceId, target_id: targetId } };
      }
      throw createErr;
    }

    revalidatePath(`/w/${workspaceId}`);
    revalidatePath(`/w/${workspaceId}`, "layout");

    return { success: true, data: edge };
  } catch (err) {
    return { success: false, error: normalizeError(err) };
  }
}
