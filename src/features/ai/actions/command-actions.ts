"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AppErrorClass, normalizeError } from "@/lib/errors";
import { CommandIntentService } from "../services/command-intent.service";
import { KnowledgeService } from "@/features/knowledge/services/knowledge.service";
import { 
  CommandIntentResult, 
  CreateNodeProposal, 
  ConnectNodesProposal 
} from "@/lib/ai/types";

/**
 * Server action to process natural language user query through Groq Command Intelligence.
 */
export async function executeCommandIntentAction(
  workspaceId: string,
  query: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[] = []
): Promise<{ success: boolean; data?: CommandIntentResult; error?: any }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new AppErrorClass("Unauthorized", "UNAUTHORIZED", 401);
    }

    if (!workspaceId || !query) {
      throw new AppErrorClass("Workspace ID and query are required", "VALIDATION_ERROR", 400);
    }

    const result = await CommandIntentService.processCommand(
      workspaceId,
      query,
      conversationHistory
    );

    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: normalizeError(err) };
  }
}

/**
 * Server action to confirm and execute an AI-proposed node creation.
 */
export async function confirmCreateNodeAction(
  workspaceId: string,
  proposal: CreateNodeProposal
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new AppErrorClass("Unauthorized", "UNAUTHORIZED", 401);
    }

    if (!workspaceId || !proposal.title) {
      throw new AppErrorClass("Invalid node proposal parameters", "VALIDATION_ERROR", 400);
    }

    const node = await KnowledgeService.createNode(
      {
        workspace_id: workspaceId,
        title: proposal.title,
        type: "note",
        content: proposal.content,
        metadata: {
          created_by_ai: true,
          ai_rationale: proposal.rationale,
        },
      },
      user.id
    );

    revalidatePath(`/w/${workspaceId}`);
    revalidatePath(`/w/${workspaceId}`, "layout");

    return { success: true, data: node };
  } catch (err) {
    return { success: false, error: normalizeError(err) };
  }
}

/**
 * Server action to confirm and execute an AI-proposed knowledge graph connection.
 */
export async function confirmConnectNodesAction(
  workspaceId: string,
  proposal: ConnectNodesProposal
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new AppErrorClass("Unauthorized", "UNAUTHORIZED", 401);
    }

    if (!workspaceId || !proposal.sourceNodeId || !proposal.targetNodeId) {
      throw new AppErrorClass("Invalid edge proposal parameters", "VALIDATION_ERROR", 400);
    }

    let edge;
    try {
      edge = await KnowledgeService.createEdge({
        workspace_id: workspaceId,
        source_id: proposal.sourceNodeId,
        target_id: proposal.targetNodeId,
        relationship_type: (proposal.relationshipType as any) || "related",
        weight: 1.0,
        label: proposal.label || "AI Connection",
      });
    } catch (createErr: any) {
      if (createErr?.code === "DB_DUPLICATE_EDGE") {
        return { 
          success: true, 
          data: { 
            workspace_id: workspaceId, 
            source_id: proposal.sourceNodeId, 
            target_id: proposal.targetNodeId 
          } 
        };
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

/**
 * Server action to confirm and execute multiple AI-proposed knowledge graph connections simultaneously.
 */
export async function confirmMultiConnectNodesAction(
  workspaceId: string,
  connections: { sourceNodeId: string; targetNodeId: string; label?: string }[]
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new AppErrorClass("Unauthorized", "UNAUTHORIZED", 401);
    }

    if (!workspaceId || !connections || connections.length === 0) {
      throw new AppErrorClass("Invalid connections payload", "VALIDATION_ERROR", 400);
    }

    const createdEdges = [];
    for (const conn of connections) {
      try {
        const edge = await KnowledgeService.createEdge({
          workspace_id: workspaceId,
          source_id: conn.sourceNodeId,
          target_id: conn.targetNodeId,
          relationship_type: "related",
          weight: 1.0,
          label: conn.label || "AI Cluster Link",
        });
        createdEdges.push(edge);
      } catch (err: any) {
        if (err?.code !== "DB_DUPLICATE_EDGE") {
          console.error("Multi-connect edge error:", err);
        }
      }
    }

    revalidatePath(`/w/${workspaceId}`);
    revalidatePath(`/w/${workspaceId}`, "layout");

    return { success: true, data: { count: createdEdges.length, edges: createdEdges } };
  } catch (err) {
    return { success: false, error: normalizeError(err) };
  }
}

