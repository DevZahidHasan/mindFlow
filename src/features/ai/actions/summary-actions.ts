"use server";

import { createClient } from "@/lib/supabase/server";
import { SummaryService } from "../services/summary.service";
import { AppErrorClass, normalizeError } from "@/lib/errors";

export async function generateSummaryAction(
  workspaceId: string,
  nodeId: string
): Promise<{ success: boolean; data?: string; error?: any }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new AppErrorClass("Unauthorized", "UNAUTHORIZED", 401);
    }

    if (!workspaceId || !nodeId) {
      throw new AppErrorClass("Invalid request parameters", "VALIDATION_ERROR", 400);
    }

    const summary = await SummaryService.summarizeNode(workspaceId, nodeId);
    return { success: true, data: summary };
  } catch (err) {
    return { success: false, error: normalizeError(err) };
  }
}
