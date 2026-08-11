"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { loginAction } from "../actions/auth-actions";
import { useAuthSpatial } from "../context/auth-spatial-context";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginInput = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();
  const { setFocusState, setMode } = useAuthSpatial();

  React.useEffect(() => {
    setMode("login");
    setFocusState("none");
  }, [setMode, setFocusState]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginInput) => {
    setServerError(null);
    setFocusState("submitting");
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      // Add artificial delay for the cinematic convergence animation
      await new Promise(r => setTimeout(r, 1200));

      const result = await loginAction(formData);
      if (result && !result.success) {
        setServerError(result.error?.message || "The details don't match. Try again.");
        setFocusState("none");
      } else {
        setFocusState("success");
        setTimeout(() => {
          router.push("/w");
          router.refresh();
        }, 500);
      }
    });
  };

  const emailField = register("email");
  const passwordField = register("password");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full max-w-sm mx-auto">
      {serverError && (
        <div
          role="alert"
          className="text-center text-sm font-sans text-danger/90 tracking-wide"
        >
          {serverError}
        </div>
      )}

      <div className="flex flex-col gap-1 border-b border-border/50 focus-within:border-foreground/50 transition-colors pb-2">
        <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">
          Identity
        </label>
        <input
          type="email"
          placeholder="Enter email"
          disabled={isPending}
          className="bg-transparent border-none outline-none text-lg font-sans placeholder:text-muted/30 focus:ring-0 px-0 w-full"
          {...emailField}
          onFocus={(e) => {
            setFocusState("email");
          }}
          onBlur={(e) => {
            emailField.onBlur(e);
            setFocusState("none");
          }}
        />
        {errors.email && <span className="text-xs text-danger">{errors.email.message}</span>}
      </div>

      <div className="flex flex-col gap-1 border-b border-border/50 focus-within:border-foreground/50 transition-colors pb-2">
        <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">
          Key
        </label>
        <input
          type="password"
          placeholder="Enter password"
          disabled={isPending}
          className="bg-transparent border-none outline-none text-lg font-sans placeholder:text-muted/30 focus:ring-0 px-0 w-full"
          {...passwordField}
          onFocus={(e) => {
            setFocusState("password");
          }}
          onBlur={(e) => {
            passwordField.onBlur(e);
            setFocusState("none");
          }}
        />
        {errors.password && <span className="text-xs text-danger">{errors.password.message}</span>}
      </div>

      <button 
        type="submit" 
        disabled={isPending}
        className="mt-6 uppercase tracking-[0.2em] text-sm py-4 border border-border/30 hover:bg-foreground/5 transition-colors disabled:opacity-50"
      >
        {isPending ? "Converging..." : "Enter Space →"}
      </button>
    </form>
  );
};

