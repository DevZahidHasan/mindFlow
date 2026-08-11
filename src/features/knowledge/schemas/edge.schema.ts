import { z } from "zod";

export const EdgeRelationshipTypeSchema = z.enum([
  "related",
  "supports",
  "contradicts",
  "references",
  "derived_from",
]);

export const KnowledgeEdgeSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  source_id: z.string().uuid(),
  target_id: z.string().uuid(),
  relationship_type: EdgeRelationshipTypeSchema,
  label: z.string().nullable().optional(),
  weight: z.number().default(1.0),
  created_at: z.string().datetime(),
});

export const CreateEdgeInputSchema = z.object({
  workspace_id: z.string().uuid(),
  source_id: z.string().uuid(),
  target_id: z.string().uuid(),
  relationship_type: EdgeRelationshipTypeSchema.optional().default("related"),
  label: z.string().nullable().optional(),
  weight: z.number().optional().default(1.0),
}).refine((data) => data.source_id !== data.target_id, {
  message: "Source and target nodes cannot be the same (no self-edges allowed)",
  path: ["target_id"],
});

export type EdgeRelationshipType = z.infer<typeof EdgeRelationshipTypeSchema>;
export type KnowledgeEdge = z.infer<typeof KnowledgeEdgeSchema>;
export type CreateEdgeInput = z.infer<typeof CreateEdgeInputSchema>;
