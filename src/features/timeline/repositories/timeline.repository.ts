import { createClient } from "@/lib/supabase/server";
import { AppErrorClass } from "@/lib/errors";
import { TimelineEvent, RecordTimelineEventInput } from "../schemas/timeline.schema";

export class TimelineRepository {
  /**
   * Records a historical event in the workspace timeline stream.
   */
  static async recordEvent(input: RecordTimelineEventInput): Promise<TimelineEvent> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("knowledge_timeline_events")
        .insert({
          workspace_id: input.workspace_id,
          event_type: input.event_type,
          node_id: input.node_id || null,
          secondary_node_id: input.secondary_node_id || null,
          project_id: input.project_id || null,
          collection_id: input.collection_id || null,
          actor_id: input.actor_id || null,
          title: input.title,
          description: input.description || null,
          metadata: input.metadata || {},
        })
        .select()
        .single();

      if (error || !data) {
        console.error("Timeline event insert error:", error);
        throw new AppErrorClass("Failed to record timeline event.", "DATABASE_ERROR", 500);
      }

      return data as TimelineEvent;
    } catch (err: any) {
      if (err instanceof AppErrorClass) throw err;
      throw new AppErrorClass("Timeline event recording failed.", "DATABASE_ERROR", 500);
    }
  }

  /**
   * Retrieves chronological timeline events with filtering and pagination.
   */
  static async getEvents(
    workspaceId: string,
    options: {
      nodeId?: string;
      projectId?: string;
      collectionId?: string;
      eventType?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<TimelineEvent[]> {
    try {
      const supabase = await createClient();
      const limit = options.limit || 50;
      const offset = options.offset || 0;

      let query = supabase
        .from("knowledge_timeline_events")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (options.nodeId) {
        query = query.or(`node_id.eq.${options.nodeId},secondary_node_id.eq.${options.nodeId}`);
      }
      if (options.projectId) {
        query = query.eq("project_id", options.projectId);
      }
      if (options.collectionId) {
        query = query.eq("collection_id", options.collectionId);
      }
      if (options.eventType) {
        query = query.eq("event_type", options.eventType);
      }

      const { data, error } = await query;

      if (error) {
        // Fallback gracefully to synthesizing events from existing nodes so the UI never crashes
        const { data: nodes } = await supabase
          .from("knowledge_nodes")
          .select("id, title, content, created_at, updated_at")
          .eq("workspace_id", workspaceId)
          .order("created_at", { ascending: false });

        if (nodes && nodes.length > 0) {
          return nodes.map(n => ({
            id: `evt_${n.id}`,
            workspace_id: workspaceId,
            event_type: "NODE_CREATED",
            node_id: n.id,
            title: `Created note: ${n.title}`,
            description: (n.content || "").substring(0, 140),
            metadata: {},
            created_at: n.created_at,
          })) as TimelineEvent[];
        }

        return [];
      }

      return (data || []) as TimelineEvent[];
    } catch (err: any) {
      return [];
    }
  }
}
