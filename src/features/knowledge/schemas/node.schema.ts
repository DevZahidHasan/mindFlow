import { z } from "zod";

export const NodeStatusSchema = z.enum(["active", "archived"]);
export const NodeTypeSchema = z.enum(["note"]);

export const KnowledgeNodeSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  title: z.string().trim().min(1, "Title is required"),
  type: NodeTypeSchema,
  content: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.any()).default({}),
  status: NodeStatusSchema,
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  archived_at: z.string().datetime().nullable().optional(),
});

export const CreateNodeInputSchema = z.object({
  workspace_id: z.string().uuid(),
  title: z.string().trim().min(1, "Title is required"),
  type: NodeTypeSchema.optional().default("note"),
  content: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.any()).optional().default({}),
});

export const UpdateNodeInputSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(), // Required to ensure we are updating in the correct context
  title: z.string().trim().min(1, "Title cannot be empty").optional(),
  content: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  status: NodeStatusSchema.optional(),
});

export type NodeStatus = z.infer<typeof NodeStatusSchema>;
export type NodeType = z.infer<typeof NodeTypeSchema>;
export type KnowledgeNode = z.infer<typeof KnowledgeNodeSchema>;
export type CreateNodeInput = z.infer<typeof CreateNodeInputSchema>;
export type UpdateNodeInput = z.infer<typeof UpdateNodeInputSchema>;
