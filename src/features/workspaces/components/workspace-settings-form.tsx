"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateWorkspaceNameAction } from "../actions/workspace-actions";

const schema = z.object({
  name: z.string().min(2, "Workspace name must be at least 2 characters"),
});

type InputType = z.infer<typeof schema>;

interface WorkspaceSettingsFormProps {
  workspaceId: string;
  initialName: string;
  userRole: string;
}

export const WorkspaceSettingsForm: React.FC<WorkspaceSettingsFormProps> = ({
  workspaceId,
  initialName,
  userRole,
}) => {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const isRestricted = userRole !== "owner" && userRole !== "admin";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: { name: initialName },
  });

  const onSubmit = (data: InputType) => {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", data.name);
      const res = await updateWorkspaceNameAction(workspaceId, null, formData);
      if (res && !res.success) {
        setError(res.error?.message || "Failed to update workspace name");
      } else {
        setSuccess(true);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 max-w-md w-full border border-border/40 p-6 bg-surface rounded-xl select-none"
    >
      <h3 className="text-base font-display font-medium uppercase tracking-tight text-foreground border-b border-border/20 pb-2 mb-2">
        Workspace Configurations
      </h3>

      {error && (
        <div
          role="alert"
          className="p-3 bg-danger/10 border border-danger/30 text-danger rounded-lg text-xs font-medium"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="alert"
          className="p-3 bg-accent/10 border border-accent/30 text-accent rounded-lg text-xs font-medium"
        >
          Workspace renamed successfully.
        </div>
      )}

      <Input
        label="Workspace Name"
        type="text"
        disabled={isPending || isRestricted}
        error={errors.name?.message}
        {...register("name")}
      />

      {isRestricted ? (
        <p className="text-[10px] text-muted font-mono uppercase">
          * ONLY OWNERS AND ADMINS CAN RENAME THIS CONTAINER
        </p>
      ) : (
        <Button
          type="submit"
          variant="primary"
          className="w-fit text-xs font-mono uppercase tracking-widest mt-2"
          isLoading={isPending}
        >
          Save Name
        </Button>
      )}
    </form>
  );
};
export default WorkspaceSettingsForm;
