"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signupAction } from "../actions/auth-actions";

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

type SignupInput = z.infer<typeof signupSchema>;

export const SignupForm: React.FC = () => {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: SignupInput) => {
    setServerError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("displayName", data.displayName);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);

      const result = await signupAction(null, formData);
      if (result && !result.success) {
        setServerError(result.error?.message || "Sign up failed");
      } else {
        router.push("/w");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full max-w-sm">
      {serverError && (
        <div
          role="alert"
          className="p-3.5 bg-danger/10 border border-danger/30 text-danger rounded-lg text-sm font-sans font-medium"
        >
          {serverError}
        </div>
      )}

      <Input
        label="Display Name"
        type="text"
        placeholder="Jane Doe"
        disabled={isPending}
        error={errors.displayName?.message}
        {...register("displayName")}
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="name@domain.com"
        disabled={isPending}
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        disabled={isPending}
        error={errors.password?.message}
        {...register("password")}
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        disabled={isPending}
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button type="submit" variant="primary" className="w-full mt-3" isLoading={isPending}>
        CREATE ACCOUNT
      </Button>
    </form>
  );
};
export default SignupForm;
