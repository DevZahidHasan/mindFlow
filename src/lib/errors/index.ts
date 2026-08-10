export type AppError = {
  message: string;
  code: string;
  status: number;
};

export class AppErrorClass extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(message: string, code: string = "INTERNAL_ERROR", status: number = 500) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    Object.setPrototypeOf(this, AppErrorClass.prototype);
  }

  public toJSON(): AppError {
    return {
      message: this.message,
      code: this.code,
      status: this.status,
    };
  }
}

/**
 * Normalizes any error into the standard AppError format.
 * Prevents exposing sensitive server/database details.
 */
export function normalizeError(err: unknown): AppError {
  if (err instanceof AppErrorClass) {
    return err.toJSON();
  }

  if (err instanceof Error) {
    // If it's a standard JS error, keep its message but hide details in production.
    // For this boilerplate, we'll map it to a standard internal error format.
    return {
      message: err.message || "An unexpected error occurred",
      code: "SYSTEM_ERROR",
      status: 500,
    };
  }

  return {
    message: "An unknown error occurred",
    code: "UNKNOWN_ERROR",
    status: 500,
  };
}
