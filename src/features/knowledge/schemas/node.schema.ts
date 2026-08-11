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

export const DocumentSourceTypeSchema = z.enum(["manual", "file_upload", "web_clip"]);
export const DocumentProcessingStatusSchema = z.enum(["draft", "processing", "ready", "failed"]);

export const DocumentMetadataSchema = z.object({
  source_type: DocumentSourceTypeSchema.default("manual"),
  processing_status: DocumentProcessingStatusSchema.default("draft"),
  mime_type: z.string().nullable().optional(),
  word_count: z.number().int().min(0).default(0),
  reading_time: z.number().int().min(0).default(0),
});

export const CreateNodeInputSchema = z.object({
  workspace_id: z.string().uuid(),
  title: z.string().trim().min(1, "Title is required"),
  type: NodeTypeSchema.optional().default("note"),
  content: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.any()).optional().default({}),
  document_metadata: DocumentMetadataSchema.optional(),
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
export type DocumentSourceType = z.infer<typeof DocumentSourceTypeSchema>;
export type DocumentProcessingStatus = z.infer<typeof DocumentProcessingStatusSchema>;
export type DocumentMetadata = z.infer<typeof DocumentMetadataSchema>;
export type CreateNodeInput = z.infer<typeof CreateNodeInputSchema>;
export type UpdateNodeInput = z.infer<typeof UpdateNodeInputSchema>;
