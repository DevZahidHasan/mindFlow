import { z } from "zod";

export const ProjectStatusSchema = z.enum(["active", "archived", "completed"]);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().nullable().optional(),
  color: z.string().default("#d4af37"),
  status: ProjectStatusSchema.default("active"),
  created_by: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const CreateProjectSchema = z.object({
  workspace_id: z.string().uuid(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  status: ProjectStatusSchema.optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  color: z.string().optional(),
  status: ProjectStatusSchema.optional(),
});

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
