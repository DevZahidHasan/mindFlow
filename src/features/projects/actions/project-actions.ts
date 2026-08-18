"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AppErrorClass, normalizeError } from "@/lib/errors";
import { ProjectService } from "../services/project.service";
import { CreateProjectInput, UpdateProjectInput } from "../schemas/project.schema";

export async function createProjectAction(workspaceId: string, input: Omit<CreateProjectInput, "workspace_id">) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AppErrorClass("Unauthorized", "UNAUTHORIZED", 401);

    const project = await ProjectService.createProject({ ...input, workspace_id: workspaceId }, user.id);
    revalidatePath(`/w/${workspaceId}`);
    return { success: true, data: project };
  } catch (err) {
    return { success: false, error: normalizeError(err) };
  }
}

export async function assignNodeToProjectAction(workspaceId: string, projectId: string, nodeId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AppErrorClass("Unauthorized", "UNAUTHORIZED", 401);

    await ProjectService.assignNode(workspaceId, projectId, nodeId, user.id);
    revalidatePath(`/w/${workspaceId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeError(err) };
  }
}

export async function removeNodeFromProjectAction(workspaceId: string, projectId: string, nodeId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AppErrorClass("Unauthorized", "UNAUTHORIZED", 401);

    await ProjectService.removeNode(workspaceId, projectId, nodeId, user.id);
    revalidatePath(`/w/${workspaceId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeError(err) };
  }
}

export async function updateProjectAction(workspaceId: string, input: UpdateProjectInput) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AppErrorClass("Unauthorized", "UNAUTHORIZED", 401);

    const project = await ProjectService.updateProject(input);
    revalidatePath(`/w/${workspaceId}`);
    return { success: true, data: project };
  } catch (err) {
    return { success: false, error: normalizeError(err) };
  }
}
