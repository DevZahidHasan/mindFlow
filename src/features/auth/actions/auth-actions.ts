"use server";

import { z } from "zod";
import { AuthService } from "../services/auth-service";
import { revalidatePath } from "next/cache";
import { AppError } from "@/lib/errors";

export type FormState = {
  success: boolean;
  error?: AppError;
} | null;

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z
  .object({
    displayName: z.string().min(2, "Display name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Server Action for authenticating users.
 */
export async function loginAction(
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const parse = loginSchema.safeParse({ email, password });
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

  try {
    await AuthService.signIn(email, password);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err as AppError,
    };
  }
}

/**
 * Server Action for signing up new users.
 */
export async function signupAction(
  formData: FormData
): Promise<FormState> {
  const displayName = formData.get("displayName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const parse = signupSchema.safeParse({ displayName, email, password, confirmPassword });
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

  try {
    await AuthService.signUp(email, password, displayName);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err as AppError,
    };
  }
}

/**
 * Server Action for signing out users.
 */
export async function signoutAction() {
  try {
    await AuthService.signOut();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err as AppError,
    };
  }
}

/**
 * Server Action for updating user display name.
 */
export async function updateProfileAction(
  formData: FormData
): Promise<FormState> {
  const displayName = formData.get("displayName") as string;
  if (!displayName || displayName.trim().length === 0) {
    return {
      success: false,
      error: {
        message: "Display name cannot be empty",
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
    await AuthService.updateProfile(user.id, displayName.trim());
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err as AppError,
    };
  }
}
