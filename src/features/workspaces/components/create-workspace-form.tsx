"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createWorkspaceAction } from "../actions/workspace-actions";

const schema = z.object({
  name: z.string().min(2, "Workspace name must be at least 2 characters"),
});

type InputType = z.infer<typeof schema>;

export const CreateWorkspaceForm: React.FC = () => {
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();

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
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", data.name);

      const res = await createWorkspaceAction(null, formData);
      if (res && !res.success) {
        setError(res.error?.message || "Failed to create workspace");
      } else if (res?.workspaceId) {
        router.push(`/w/${res.workspaceId}`);
        router.refresh();
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

      <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isPending}>
        CREATE WORKSPACE
      </Button>
    </form>
  );
};
export default CreateWorkspaceForm;
