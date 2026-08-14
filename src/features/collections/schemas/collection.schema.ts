import { z } from "zod";

export const CollectionSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  name: z.string().min(1, "Collection name is required"),
  icon: z.string().default("✦"),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Collection = z.infer<typeof CollectionSchema>;

export const CreateCollectionSchema = z.object({
  workspace_id: z.string().uuid(),
  name: z.string().min(1, "Collection name is required"),
  icon: z.string().optional(),
});

export type CreateCollectionInput = z.infer<typeof CreateCollectionSchema>;

export const UpdateCollectionSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  name: z.string().min(1).optional(),
  icon: z.string().optional(),
});

export type UpdateCollectionInput = z.infer<typeof UpdateCollectionSchema>;
