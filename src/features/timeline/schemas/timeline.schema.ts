import { z } from "zod";

export const TimelineEventTypeSchema = z.enum([
  "NODE_CREATED",
  "NODE_UPDATED",
  "NODE_ARCHIVED",
  "NODE_RESTORED",
  "EDGE_CONNECTED",
  "EDGE_REMOVED",
  "AI_SUMMARIZED",
  "NODE_IMPORTED",
  "NODE_ASSIGNED_PROJECT",
  "NODE_REMOVED_PROJECT",
  "NODE_ASSIGNED_COLLECTION",
  "NODE_REMOVED_COLLECTION",
]);

export type TimelineEventType = z.infer<typeof TimelineEventTypeSchema>;

export const TimelineEventSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  event_type: TimelineEventTypeSchema,
  node_id: z.string().uuid().nullable().optional(),
  secondary_node_id: z.string().uuid().nullable().optional(),
  project_id: z.string().uuid().nullable().optional(),
  collection_id: z.string().uuid().nullable().optional(),
  actor_id: z.string().uuid().nullable().optional(),
  title: z.string(),
  description: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.any()).default({}),
  created_at: z.string(),
});

export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

export const RecordTimelineEventSchema = z.object({
  workspace_id: z.string().uuid(),
  event_type: TimelineEventTypeSchema,
  node_id: z.string().uuid().optional(),
  secondary_node_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  collection_id: z.string().uuid().optional(),
  actor_id: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type RecordTimelineEventInput = z.infer<typeof RecordTimelineEventSchema>;
