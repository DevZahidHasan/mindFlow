"use server";

import { createClient } from "@/lib/supabase/server";
import { RAGService } from "../services/rag.service";
import { RelationshipService } from "../services/relationship.service";
import { AppErrorClass, normalizeError } from "@/lib/errors";
import { RAGResponse, SemanticConnection } from "@/lib/ai/types";
import { aiRateLimiter } from "@/lib/rate-limit";

export async function askAiAction(workspaceId: string, query: string): Promise<{ success: boolean; data?: RAGResponse; error?: any }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new AppErrorClass("Unauthorized", "UNAUTHORIZED", 401);
    }

    if (!aiRateLimiter.check(user.id)) {
      throw new AppErrorClass("Rate limit exceeded. Try again later.", "RATE_LIMIT", 429);
    }

    if (!workspaceId || !query) {
      throw new AppErrorClass("Invalid request parameters", "VALIDATION_ERROR", 400);
    }

    const response = await RAGService.askQuestion(workspaceId, query);
    return { success: true, data: response };
  } catch (err) {
    return { success: false, error: normalizeError(err) };
  }
}

export async function getRelationshipSuggestionsAction(
  workspaceId: string,
  nodeId: string,
  content: string
): Promise<{ success: boolean; data?: SemanticConnection[]; error?: any }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new AppErrorClass("Unauthorized", "UNAUTHORIZED", 401);
    }

    if (!aiRateLimiter.check(user.id)) {
      throw new AppErrorClass("Rate limit exceeded. Try again later.", "RATE_LIMIT", 429);
    }

    const connections = await RelationshipService.discoverRelationships(workspaceId, nodeId, content);
    return { success: true, data: connections };
  } catch (err) {
    return { success: false, error: normalizeError(err) };
  }
}
