import { createClient } from "@/lib/supabase/server";
import { AppErrorClass, normalizeError } from "@/lib/errors";

/**
 * Domain Service managing authentication and identity boundaries.
 * Wraps Supabase client calls and translates system exceptions into normalized AppErrors.
 */
export class AuthService {
  /**
   * Register a new user with email and password, supplying metadata for profile creation.
   */
  static async signUp(email: string, password: string, displayName: string) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        throw new AppErrorClass(error.message, "AUTH_SIGNUP_FAILED", error.status || 400);
      }

      if (!data.user) {
        throw new AppErrorClass("User account could not be provisioned", "AUTH_USER_NULL", 500);
      }

      return data.user;
    } catch (err) {
      throw normalizeError(err);
    }
  }

  /**
   * Authenticate a user with email and password.
   */
  static async signIn(email: string, password: string) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new AppErrorClass(error.message, "AUTH_LOGIN_FAILED", error.status || 401);
      }

      if (!data.user) {
        throw new AppErrorClass("Session could not be established", "AUTH_SESSION_NULL", 500);
      }

      return data.user;
    } catch (err) {
      throw normalizeError(err);
    }
  }

  /**
   * Terminate the user's active session and clear browser cookies.
   */
  static async signOut() {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new AppErrorClass(error.message, "AUTH_LOGOUT_FAILED", error.status || 500);
      }
    } catch (err) {
      throw normalizeError(err);
    }
  }

  /**
   * Fetch the verified active user.
   * Returns null instead of throwing to allow clean Server Component checks.
   */
  static async getUser() {
    try {
      const supabase = await createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      return user;
    } catch {
      return null;
    }
  }

  /**
   * Update user display name profile row.
   */
  static async updateProfile(userId: string, displayName: string) {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("id", userId);

      if (error) {
        throw new AppErrorClass(error.message, "DB_UPDATE_PROFILE_FAILED", 500);
      }
    } catch (err) {
      throw normalizeError(err);
    }
  }
}
