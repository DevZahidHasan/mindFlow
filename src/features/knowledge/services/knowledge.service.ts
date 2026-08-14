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
      const node = await NodeRepository.createNode(parsed.data, userId);
      
      // Trigger AI ingestion asynchronously
      // We don't await this because we want the UI to be fast.
      // In a real production app, this might go to an SQS queue.
      if (node.content) {
        import("@/features/ai/services/ingestion.service").then(m => {
          setImmediate(() => {
            m.IngestionService.ingestDocument(node.workspace_id, node.id, node.content || "", node.title).catch((e: any) => {
              console.error(`Background ingestion failed for node ${node.id}`, e);
            });
          });
        });
      }

      // Record in historical timeline log
      import("@/features/timeline/services/timeline.service").then(m => {
        m.TimelineService.recordEvent({
          workspace_id: node.workspace_id,
          event_type: "NODE_CREATED",
          node_id: node.id,
          actor_id: userId,
          title: `Created note: ${node.title}`,
          description: (node.content || "").substring(0, 140),
        }).catch(e => console.error("Timeline event failed:", e));
      });

      return node;
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
      const node = await NodeRepository.updateNode(parsed.data);

      // Trigger AI ingestion asynchronously
      import("@/features/ai/services/ingestion.service").then(m => {
        if (node.content !== undefined) {
          setImmediate(() => {
            m.IngestionService.ingestDocument(node.workspace_id, node.id, node.content || "", node.title).catch((e: any) => {
              console.error(`Background ingestion failed for node update: ${node.id}`, e);
            });
          });
        }
      });

      // Record in timeline log
      import("@/features/timeline/services/timeline.service").then(m => {
        m.TimelineService.recordEvent({
          workspace_id: node.workspace_id,
          event_type: "NODE_UPDATED",
          node_id: node.id,
          title: `Updated note: ${node.title}`,
        }).catch(e => console.error("Timeline event failed:", e));
      });

      return node;
    } catch (err) {
      throw normalizeError(err);
    }
  }

  static async archiveNode(nodeId: string, workspaceId: string, userId: string): Promise<KnowledgeNode> {
    try {
      const node = await this.updateNode({
        id: nodeId,
        workspace_id: workspaceId,
        status: "archived"
      });

      import("@/features/timeline/services/timeline.service").then(m => {
        m.TimelineService.recordEvent({
          workspace_id: workspaceId,
          event_type: "NODE_ARCHIVED",
          node_id: nodeId,
          actor_id: userId,
          title: `Archived note: ${node.title}`,
        }).catch(e => console.error("Timeline event failed:", e));
      });

      return node;
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
      
      const edge = await EdgeRepository.createEdge(parsed.data);

      // Record in historical timeline log
      import("@/features/timeline/services/timeline.service").then(m => {
        m.TimelineService.recordEvent({
          workspace_id: edge.workspace_id,
          event_type: "EDGE_CONNECTED",
          node_id: edge.source_id,
          secondary_node_id: edge.target_id,
          title: `Connected knowledge in universe`,
          description: edge.label || undefined,
        }).catch(e => console.error("Timeline event failed:", e));
      });

      return edge;
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
