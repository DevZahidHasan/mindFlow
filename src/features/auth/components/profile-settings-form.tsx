"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfileAction } from "../actions/auth-actions";

const schema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
});

type InputType = z.infer<typeof schema>;

interface ProfileSettingsFormProps {
  initialDisplayName: string;
}

export const ProfileSettingsForm: React.FC<ProfileSettingsFormProps> = ({
  initialDisplayName,
}) => {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: initialDisplayName },
  });

  const onSubmit = (data: InputType) => {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("displayName", data.displayName);
      const res = await updateProfileAction(formData);
      if (res && !res.success) {
        setError(res.error?.message || "Failed to update profile");
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
        Profile Settings
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
          Profile updated successfully.
        </div>
      )}

      <Input
        label="Display Name"
        type="text"
        disabled={isPending}
        error={errors.displayName?.message}
        {...register("displayName")}
      />

      <Button
        type="submit"
        variant="primary"
        className="w-fit text-xs font-mono uppercase tracking-widest mt-2"
        isLoading={isPending}
      >
        Save Profile
      </Button>
    </form>
  );
};
export default ProfileSettingsForm;
