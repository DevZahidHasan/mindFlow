"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { signoutAction } from "@/features/auth/actions/auth-actions";

interface AccountMenuProps {
  workspaceId: string;
  userEmail: string;
  displayName: string;
}

export const AccountMenu: React.FC<AccountMenuProps> = ({
  workspaceId,
  userEmail,
  displayName,
}) => {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const handleSignOut = () => {
    setOpen(false);
    startTransition(async () => {
      await signoutAction();
      router.push("/");
      router.refresh();
    });
  };

  // Generate initials
  const initials = displayName
    ? displayName.substring(0, 2).toUpperCase()
    : userEmail.substring(0, 2).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="w-9 h-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-display font-medium text-sm border border-accent/20 cursor-pointer shadow-md hover:scale-[1.02] transition-transform focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          aria-label="Account options"
        >
          {initials}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-xs w-full p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-sm font-display text-muted uppercase tracking-widest">
            User Identity
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 select-none">
          <div className="flex flex-col gap-1 border-b border-border/40 pb-4">
            <span className="text-base font-sans font-medium text-foreground truncate">
              {displayName}
            </span>
            <span className="text-xs font-mono text-muted truncate">{userEmail}</span>
          </div>

          <div className="flex flex-col gap-2.5">
            <Link
              href={`/w/${workspaceId}/settings`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 w-full p-2.5 rounded-lg text-sm text-foreground bg-surface hover:bg-surface-elevated transition-colors focus-visible:outline-2 focus-visible:outline-accent"
            >
              <svg
                className="w-4 h-4 text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Settings
            </Link>
          </div>

          <div className="flex gap-2 border-t border-border/40 pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSignOut}
              isLoading={isPending}
              className="w-full text-xs font-mono uppercase tracking-widest text-danger hover:border-danger/30 hover:bg-danger/5"
            >
              Sign Out
            </Button>
            <DialogClose asChild>
              <Button
                variant="tertiary"
                size="sm"
                className="text-xs font-mono uppercase tracking-widest text-muted"
              >
                Close
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default AccountMenu;
