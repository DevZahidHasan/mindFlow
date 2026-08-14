"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AppErrorClass, normalizeError } from "@/lib/errors";
import { CollectionService } from "../services/collection.service";
import { CreateCollectionInput } from "../schemas/collection.schema";

export async function createCollectionAction(workspaceId: string, input: Omit<CreateCollectionInput, "workspace_id">) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AppErrorClass("Unauthorized", "UNAUTHORIZED", 401);

    const col = await CollectionService.createCollection({ ...input, workspace_id: workspaceId });
    revalidatePath(`/w/${workspaceId}`);
    return { success: true, data: col };
  } catch (err) {
    return { success: false, error: normalizeError(err) };
  }
}

export async function assignNodeToCollectionAction(workspaceId: string, collectionId: string, nodeId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AppErrorClass("Unauthorized", "UNAUTHORIZED", 401);

    await CollectionService.assignNode(workspaceId, collectionId, nodeId);
    revalidatePath(`/w/${workspaceId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeError(err) };
  }
}

export async function removeNodeFromCollectionAction(workspaceId: string, collectionId: string, nodeId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AppErrorClass("Unauthorized", "UNAUTHORIZED", 401);

    await CollectionService.removeNode(workspaceId, collectionId, nodeId);
    revalidatePath(`/w/${workspaceId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeError(err) };
  }
}
