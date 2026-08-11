"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { createWorkspaceAction } from "../actions/workspace-actions";
import { useAuthSpatial } from "@/features/auth/context/auth-spatial-context";

const schema = z.object({
  name: z.string().min(2, "Workspace name must be at least 2 characters"),
});

type InputType = z.infer<typeof schema>;

export const CreateWorkspaceForm: React.FC = () => {
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();
  const { setFocusState } = useAuthSpatial();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const onSubmit = (data: InputType) => {
    setError(null);
    setFocusState("submitting");
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", data.name);

      await new Promise(r => setTimeout(r, 1200));

      const res = await createWorkspaceAction(formData);
      if (res && !res.success) {
        setError(res.error?.message || "Failed to create workspace");
        setFocusState("none");
      } else if (res?.workspaceId) {
        setFocusState("success");
        setTimeout(() => {
          router.push(`/w/${res.workspaceId}`);
          router.refresh();
        }, 500);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full text-left">
      {error && (
        <div
          role="alert"
          className="p-3 bg-danger/10 border border-danger/30 text-danger rounded-lg text-xs font-medium"
        >
          {error}
        </div>
      )}

      <Input
        label="Workspace Name"
        type="text"
        placeholder="e.g. Research Lab, Creative Studio"
        disabled={isPending}
        error={errors.name?.message}
        {...register("name")}
      />

      <button 
        type="submit" 
        disabled={isPending}
        className="mt-6 w-full uppercase tracking-[0.2em] text-sm py-4 border border-border/30 hover:bg-foreground/5 transition-colors disabled:opacity-50"
      >
        {isPending ? "Initializing..." : "Create Workspace →"}
      </button>
    </form>
  );
};
export default CreateWorkspaceForm;
