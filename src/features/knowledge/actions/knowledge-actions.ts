"use server";

import { AuthService } from "@/features/auth/services/auth-service";
import { KnowledgeService } from "../services/knowledge.service";
import { AppError, normalizeError } from "@/lib/errors";
import { CreateNodeInput, UpdateNodeInput } from "../schemas/node.schema";
import { CreateEdgeInput } from "../schemas/edge.schema";
import { revalidatePath } from "next/cache";

export type KnowledgeActionState = {
  success: boolean;
  data?: any;
  error?: AppError;
} | null;

/**
 * Creates a new knowledge node.
 */
export async function createNodeAction(input: CreateNodeInput): Promise<KnowledgeActionState> {
  const user = await AuthService.getUser();
  if (!user) {
    return {
      success: false,
      error: { message: "Authentication required", code: "AUTH_REQUIRED", status: 401 },
    };
  }

  try {
    const node = await KnowledgeService.createNode(input, user.id);
    revalidatePath(`/w/${input.workspace_id}`);
    return { success: true, data: node };
  } catch (err) {
    return { success: false, error: err as AppError };
  }
}

/**
 * Updates a knowledge node.
 */
export async function updateNodeAction(input: UpdateNodeInput): Promise<KnowledgeActionState> {
  const user = await AuthService.getUser();
  if (!user) {
    return {
      success: false,
      error: { message: "Authentication required", code: "AUTH_REQUIRED", status: 401 },
    };
  }

  try {
    const node = await KnowledgeService.updateNode(input);
    revalidatePath(`/w/${input.workspace_id}`);
    return { success: true, data: node };
  } catch (err) {
    return { success: false, error: err as AppError };
  }
}

/**
 * Deletes a knowledge node.
 */
export async function deleteNodeAction(nodeId: string, workspaceId: string): Promise<KnowledgeActionState> {
  const user = await AuthService.getUser();
  if (!user) {
    return {
      success: false,
      error: { message: "Authentication required", code: "AUTH_REQUIRED", status: 401 },
    };
  }

  try {
    await KnowledgeService.deleteNode(nodeId, workspaceId);
    revalidatePath(`/w/${workspaceId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err as AppError };
  }
}

/**
 * Creates a knowledge edge.
 */
export async function createEdgeAction(input: CreateEdgeInput): Promise<KnowledgeActionState> {
  const user = await AuthService.getUser();
  if (!user) {
    return {
      success: false,
      error: { message: "Authentication required", code: "AUTH_REQUIRED", status: 401 },
    };
  }

  try {
    const edge = await KnowledgeService.createEdge(input);
    revalidatePath(`/w/${input.workspace_id}`);
    return { success: true, data: edge };
  } catch (err) {
    return { success: false, error: err as AppError };
  }
}

/**
 * Deletes a knowledge edge.
 */
export async function deleteEdgeAction(edgeId: string, workspaceId: string): Promise<KnowledgeActionState> {
  const user = await AuthService.getUser();
  if (!user) {
    return {
      success: false,
      error: { message: "Authentication required", code: "AUTH_REQUIRED", status: 401 },
    };
  }

  try {
    await KnowledgeService.deleteEdge(edgeId, workspaceId);
    revalidatePath(`/w/${workspaceId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err as AppError };
  }
}

/**
 * Searches knowledge nodes in a workspace.
 */
export async function searchNodesAction(query: string, workspaceId: string): Promise<KnowledgeActionState> {
  const user = await AuthService.getUser();
  if (!user) {
    return {
      success: false,
      error: { message: "Authentication required", code: "AUTH_REQUIRED", status: 401 },
    };
  }

  try {
    // For now, simple ILIKE search. Can be replaced with Vector search in Phase 8.
    const supabase = await (await import("@/lib/supabase/server")).createClient();
    const { data, error } = await supabase
      .from('knowledge_nodes')
      .select('id, title, type, metadata, document_metadata:knowledge_document_metadata(*)')
      .eq('workspace_id', workspaceId)
      .eq('status', 'active')
      .ilike('title', `%${query}%`)
      .limit(10);

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: normalizeError(err) as AppError };
  }
}
