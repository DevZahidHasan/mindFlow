import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetPortal = DialogPrimitive.Portal;

export const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className = "", ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={`fixed inset-0 z-50 bg-black/75 backdrop-blur-xs transition-opacity duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:opacity-0 data-[state=open]:opacity-100 ${className}`}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: "right" | "bottom" | "responsive";
}

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ side = "responsive", className = "", children, ...props }, ref) => {
  const sideClasses = {
    bottom:
      "bottom-0 left-0 right-0 w-full border-t rounded-t-2xl translate-y-0 data-[state=closed]:translate-y-full data-[state=open]:translate-y-0",
    right:
      "top-0 right-0 bottom-0 h-full w-[calc(100%-32px)] sm:w-96 border-l translate-x-0 data-[state=closed]:translate-x-full data-[state=open]:translate-x-0",
    responsive:
      "bottom-0 left-0 right-0 w-full border-t rounded-t-2xl translate-y-0 data-[state=closed]:translate-y-full data-[state=open]:translate-y-0 lg:top-0 lg:right-0 lg:bottom-0 lg:left-auto lg:h-full lg:w-96 lg:border-t-0 lg:border-l lg:rounded-t-none lg:translate-y-0 lg:translate-x-0 lg:data-[state=closed]:translate-x-full lg:data-[state=open]:translate-x-0",
  };

  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={`fixed z-50 bg-surface border-border p-6 shadow-2xl transition-transform duration-250 ease-out focus:outline-none ${sideClasses[side]} ${className}`}
        {...props}
      >
        {/* Decorative Drag Handle Indicator on Mobile Bottom Sheet */}
        {(side === "bottom" || side === "responsive") && (
          <div className="mx-auto h-1 w-12 rounded-full bg-border mb-4 lg:hidden" />
        )}
        
        {children}
        
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1.5 text-muted hover:text-foreground hover:bg-surface-elevated focus-visible:outline-2 focus-visible:outline-accent transition-colors duration-150">
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </SheetPortal>
  );
});
SheetContent.displayName = "SheetContent";

export const SheetHeader = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex flex-col gap-1 text-left mb-4 ${className}`} {...props} />
);
SheetHeader.displayName = "SheetHeader";

export const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className = "", ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={`text-lg font-medium text-foreground font-display ${className}`}
    {...props}
  />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

export const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className = "", ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={`text-sm text-muted font-sans ${className}`}
    {...props}
  />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;
