import { CollectionRepository } from "../repositories/collection.repository";
import { TimelineService } from "@/features/timeline/services/timeline.service";
import { 
  Collection, 
  CreateCollectionInput, 
  CreateCollectionSchema 
} from "../schemas/collection.schema";
import { AppErrorClass, normalizeError } from "@/lib/errors";

export class CollectionService {
  static async createCollection(input: CreateCollectionInput): Promise<Collection> {
    try {
      const validated = CreateCollectionSchema.parse(input);
      const collection = await CollectionRepository.createCollection(validated);

      await TimelineService.recordEvent({
        workspace_id: validated.workspace_id,
        event_type: "NODE_ASSIGNED_COLLECTION",
        collection_id: collection.id,
        title: `Collection Created: ${collection.name}`,
      }).catch(err => console.error("Timeline record error:", err));

      return collection;
    } catch (err) {
      throw normalizeError(err);
    }
  }

  static async getWorkspaceCollections(workspaceId: string): Promise<Collection[]> {
    try {
      if (!workspaceId) throw new AppErrorClass("Workspace ID is required", "VALIDATION_ERROR", 400);
      return await CollectionRepository.getWorkspaceCollections(workspaceId);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  static async assignNode(workspaceId: string, collectionId: string, nodeId: string): Promise<void> {
    try {
      if (!workspaceId || !collectionId || !nodeId) throw new AppErrorClass("Invalid parameters", "VALIDATION_ERROR", 400);
      await CollectionRepository.assignNodeToCollection(workspaceId, collectionId, nodeId);

      await TimelineService.recordEvent({
        workspace_id: workspaceId,
        event_type: "NODE_ASSIGNED_COLLECTION",
        node_id: nodeId,
        collection_id: collectionId,
        title: "Node assigned to collection",
      }).catch(err => console.error("Timeline record error:", err));
    } catch (err) {
      throw normalizeError(err);
    }
  }

  static async removeNode(workspaceId: string, collectionId: string, nodeId: string): Promise<void> {
    try {
      if (!workspaceId || !collectionId || !nodeId) throw new AppErrorClass("Invalid parameters", "VALIDATION_ERROR", 400);
      await CollectionRepository.removeNodeFromCollection(workspaceId, collectionId, nodeId);

      await TimelineService.recordEvent({
        workspace_id: workspaceId,
        event_type: "NODE_REMOVED_COLLECTION",
        node_id: nodeId,
        collection_id: collectionId,
        title: "Node removed from collection",
      }).catch(err => console.error("Timeline record error:", err));
    } catch (err) {
      throw normalizeError(err);
    }
  }

  static async getCollectionNodeIds(workspaceId: string, collectionId: string): Promise<string[]> {
    try {
      return await CollectionRepository.getCollectionNodeIds(workspaceId, collectionId);
    } catch (err) {
      throw normalizeError(err);
    }
  }
}
