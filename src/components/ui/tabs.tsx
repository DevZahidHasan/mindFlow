import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className = "", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={`inline-flex items-center justify-start border-b border-border w-full gap-6 select-none ${className}`}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className = "", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={`inline-flex items-center justify-center py-2.5 text-sm font-sans font-medium border-b-2 border-transparent text-muted hover:text-foreground hover:border-border data-[state=active]:border-accent data-[state=active]:text-foreground focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 transition-all duration-150 active:scale-[0.98] ${className}`}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className = "", ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={`mt-4 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-4 ${className}`}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
