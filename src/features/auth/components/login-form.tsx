"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginAction } from "../actions/auth-actions";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginInput = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();

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
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      const result = await loginAction(null, formData);
      if (result && !result.success) {
        setServerError(result.error?.message || "Invalid credentials");
      } else {
        router.push("/w");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full max-w-sm">
      {serverError && (
        <div
          role="alert"
          className="p-3.5 bg-danger/10 border border-danger/30 text-danger rounded-lg text-sm font-sans font-medium"
        >
          {serverError}
        </div>
      )}

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

      <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isPending}>
        SIGN IN
      </Button>
    </form>
  );
};
export default LoginForm;
