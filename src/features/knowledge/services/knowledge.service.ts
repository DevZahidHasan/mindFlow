import { AppErrorClass, normalizeError } from "@/lib/errors";
import { NodeRepository } from "../repositories/node.repository";
import { EdgeRepository } from "../repositories/edge.repository";
import { 
  CreateNodeInputSchema, 
  UpdateNodeInputSchema,
  KnowledgeNode,
  CreateNodeInput,
  UpdateNodeInput
} from "../schemas/node.schema";
import { 
  CreateEdgeInputSchema, 
  KnowledgeEdge,
  CreateEdgeInput
} from "../schemas/edge.schema";

/**
 * Domain Service for Knowledge (Nodes and Edges).
 * Enforces business rules and standardizes error responses.
 */
export class KnowledgeService {
  // ==========================================
  // NODES
  // ==========================================

  static async getWorkspaceNodes(workspaceId: string): Promise<KnowledgeNode[]> {
    try {
      if (!workspaceId) throw new AppErrorClass("Workspace ID is required", "VALIDATION_ERROR", 400);
      return await NodeRepository.getNodesByWorkspace(workspaceId);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  static async getNode(nodeId: string, workspaceId: string): Promise<KnowledgeNode> {
    try {
      if (!nodeId || !workspaceId) throw new AppErrorClass("Node ID and Workspace ID are required", "VALIDATION_ERROR", 400);
      return await NodeRepository.getNodeById(nodeId, workspaceId);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  static async createNode(input: CreateNodeInput, userId: string): Promise<KnowledgeNode> {
    try {
      const parsed = CreateNodeInputSchema.safeParse(input);
      if (!parsed.success) {
        throw new AppErrorClass(parsed.error.issues[0].message, "VALIDATION_ERROR", 400);
      }
      return await NodeRepository.createNode(parsed.data, userId);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  static async updateNode(input: UpdateNodeInput): Promise<KnowledgeNode> {
    try {
      const parsed = UpdateNodeInputSchema.safeParse(input);
      if (!parsed.success) {
        throw new AppErrorClass(parsed.error.issues[0].message, "VALIDATION_ERROR", 400);
      }
      return await NodeRepository.updateNode(parsed.data);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  static async archiveNode(nodeId: string, workspaceId: string): Promise<KnowledgeNode> {
    try {
      // Use the update mechanism to change status to 'archived'
      return await this.updateNode({
        id: nodeId,
        workspace_id: workspaceId,
        status: "archived"
      });
    } catch (err) {
      throw normalizeError(err);
    }
  }

  static async deleteNode(nodeId: string, workspaceId: string): Promise<void> {
    try {
      if (!nodeId || !workspaceId) throw new AppErrorClass("Node ID and Workspace ID are required", "VALIDATION_ERROR", 400);
      await NodeRepository.deleteNode(nodeId, workspaceId);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  // ==========================================
  // EDGES
  // ==========================================

  static async getWorkspaceEdges(workspaceId: string): Promise<KnowledgeEdge[]> {
    try {
      if (!workspaceId) throw new AppErrorClass("Workspace ID is required", "VALIDATION_ERROR", 400);
      return await EdgeRepository.getEdgesByWorkspace(workspaceId);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  static async createEdge(input: CreateEdgeInput): Promise<KnowledgeEdge> {
    try {
      const parsed = CreateEdgeInputSchema.safeParse(input);
      if (!parsed.success) {
        throw new AppErrorClass(parsed.error.issues[0].message, "VALIDATION_ERROR", 400);
      }
      
      // Additional business logic could go here if needed (e.g. verifying nodes exist via a read)
      // but the database handles this securely.

      return await EdgeRepository.createEdge(parsed.data);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  static async deleteEdge(edgeId: string, workspaceId: string): Promise<void> {
    try {
      if (!edgeId || !workspaceId) throw new AppErrorClass("Edge ID and Workspace ID are required", "VALIDATION_ERROR", 400);
      await EdgeRepository.deleteEdge(edgeId, workspaceId);
    } catch (err) {
      throw normalizeError(err);
    }
  }
}
