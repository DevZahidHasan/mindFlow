"use server";

import { z } from "zod";
import { AuthService } from "@/features/auth/services/auth-service";
import { WorkspaceService } from "../services/workspace-service";
import { revalidatePath } from "next/cache";
import { AppError } from "@/lib/errors";

export type FormState = {
  success: boolean;
  workspaceId?: string;
  error?: AppError;
} | null;

const createSchema = z.object({
  name: z.string().min(2, "Workspace name must be at least 2 characters"),
});

/**
 * Server Action creating a workspace atomically.
 */
export async function createWorkspaceAction(
  formData: FormData
): Promise<FormState> {
  const name = formData.get("name") as string;
  const parse = createSchema.safeParse({ name });

  if (!parse.success) {
    return {
      success: false,
      error: {
        message: parse.error.issues[0].message,
        code: "VALIDATION_ERROR",
        status: 400,
      },
    };
  }

  // Get current user context
  const user = await AuthService.getUser();
  if (!user) {
    return {
      success: false,
      error: {
        message: "You must be logged in to create workspaces.",
        code: "AUTH_REQUIRED",
        status: 401,
      },
    };
  }

  try {
    const workspaceId = await WorkspaceService.createWorkspace(name, user.id);
    revalidatePath("/w", "layout");
    return { success: true, workspaceId };
  } catch (err: any) {
    return {
      success: false,
      error: {
        message: err.message || "An unknown error occurred",
        code: err.code || "UNKNOWN_ERROR",
        status: err.status || 500,
      },
    };
  }
}

/**
 * Server Action renaming a workspace, validating administrator role constraints.
 */
export async function updateWorkspaceNameAction(
  workspaceId: string,
  formData: FormData
): Promise<FormState> {
  const name = formData.get("name") as string;
  const parse = createSchema.safeParse({ name });

  if (!parse.success) {
    return {
      success: false,
      error: {
        message: parse.error.issues[0].message,
        code: "VALIDATION_ERROR",
        status: 400,
      },
    };
  }

  const user = await AuthService.getUser();
  if (!user) {
    return {
      success: false,
      error: {
        message: "Authentication required",
        code: "AUTH_REQUIRED",
        status: 401,
      },
    };
  }

  try {
    await WorkspaceService.updateWorkspaceName(workspaceId, name, user.id);
    revalidatePath(`/w/${workspaceId}`, "layout");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err as AppError,
    };
  }
}
