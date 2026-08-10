"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Magnetic } from "@/components/ui/magnetic";
import { TextSplit } from "@/components/ui/text-split";

export default function DesignSystemLab() {
  const [inputText, setInputText] = React.useState("");
  const [inputError, setInputError] = React.useState("");

  const handleValidateInput = () => {
    if (!inputText) {
      setInputError("Field value is required for demonstration");
    } else {
      setInputError("");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-6 md:px-12 max-w-6xl mx-auto font-sans relative">

      {/* Lab Header */}
      <header className="border-b border-border pb-8 mb-12">
        <div className="text-xs font-mono text-accent uppercase tracking-widest mb-2">
          Laboratory / visual reference
        </div>
        <h1 className="text-5xl font-medium tracking-tight font-display mb-4">
          MINDSPACE Design Lab
        </h1>
        <p className="text-muted max-w-xl font-sans text-base leading-relaxed">
          Authoritative visual testing, regression reference, and interaction workspace for building
          consistent MINDSPACE layouts. Contains only static demonstration components.
        </p>
      </header>

      <Tabs defaultValue="typography" className="w-full">
        <TabsList className="mb-10">
          <TabsTrigger value="typography">Typography & Color</TabsTrigger>
          <TabsTrigger value="components">UI Primitives</TabsTrigger>
          <TabsTrigger value="motion">Motion & Interaction</TabsTrigger>
          <TabsTrigger value="responsive">Responsive QA</TabsTrigger>
        </TabsList>

        {/* ================= TYPOGRAPHY & COLOR PANEL ================= */}
        <TabsContent value="typography" className="focus:outline-none">
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Typography Section */}
            <div>
              <h2 className="text-2xl font-medium font-display mb-8 text-accent">Typography Scale</h2>
              <div className="flex flex-col gap-8">
                <div>
                  <span className="text-xs font-mono text-muted block mb-2">Display 2XL</span>
                  <div className="font-display font-medium text-[length:var(--font-display-2xl)] leading-none">
                    Interconnected
                  </div>
                </div>
                <div>
                  <span className="text-xs font-mono text-muted block mb-2">Display XL</span>
                  <div className="font-display font-medium text-[length:var(--font-display-xl)] leading-tight">
                    Spatial Knowledge Map
                  </div>
                </div>
                <div>
                  <span className="text-xs font-mono text-muted block mb-2">H1 Header</span>
                  <h1 className="text-[length:var(--font-h1)] leading-snug">
                    Workspace Overview
                  </h1>
                </div>
                <div>
                  <span className="text-xs font-mono text-muted block mb-2">H2 Section</span>
                  <h2 className="text-[length:var(--font-h2)] leading-snug">
                    Thematic Clusters
                  </h2>
                </div>
                <div>
                  <span className="text-xs font-mono text-muted block mb-2">H3 Subhead</span>
                  <h3 className="text-[length:var(--font-h3)] leading-snug">
                    Selected Node Data
                  </h3>
                </div>
                <div>
                  <span className="text-xs font-mono text-muted block mb-2">Body Text</span>
                  <p className="text-[length:var(--font-body)] leading-relaxed text-foreground/95">
                    Ideas should be linked by meaning rather than stored in isolated files. MINDSPACE turns a folder of text documents into a living visual topography.
                  </p>
                </div>
                <div>
                  <span className="text-xs font-mono text-muted block mb-2">Metadata</span>
                  <span className="text-[length:var(--font-metadata)] font-mono text-muted">
                    CREATED: 2026-08-11 // MODIFIED: 2026-08-11 // SIZE: 4.2KB
                  </span>
                </div>
              </div>
            </div>

            {/* Colors Section */}
            <div>
              <h2 className="text-2xl font-medium font-display mb-8 text-accent">Semantic Colors</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-background border border-border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-foreground border border-border mb-2" />
                  <div className="font-mono text-xs font-medium">--background</div>
                  <div className="text-xs text-muted">Canvas base</div>
                </div>
                <div className="p-4 bg-surface border border-border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-background border border-border mb-2" />
                  <div className="font-mono text-xs font-medium">--foreground</div>
                  <div className="text-xs text-muted">Primary body text</div>
                </div>
                <div className="p-4 bg-surface border border-border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-surface border border-border mb-2" />
                  <div className="font-mono text-xs font-medium">--surface</div>
                  <div className="text-xs text-muted">Card & sidebar backing</div>
                </div>
                <div className="p-4 bg-surface-elevated border border-border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-surface-elevated border border-border mb-2" />
                  <div className="font-mono text-xs font-medium">--surface-elevated</div>
                  <div className="text-xs text-muted">Dropdowns & menus</div>
                </div>
                <div className="p-4 bg-surface-subtle border border-border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-surface-subtle border border-border mb-2" />
                  <div className="font-mono text-xs font-medium">--surface-subtle</div>
                  <div className="text-xs text-muted">Tabular row highlight</div>
                </div>
                <div className="p-4 bg-surface border border-border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-accent border border-border mb-2" />
                  <div className="font-mono text-xs font-medium text-accent">--accent</div>
                  <div className="text-xs text-muted">Muted Gold focal highlight</div>
                </div>
                <div className="p-4 bg-surface border border-border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-border border border-border mb-2" />
                  <div className="font-mono text-xs font-medium">--border</div>
                  <div className="text-xs text-muted">Tab & control outlines</div>
                </div>
                <div className="p-4 bg-surface border border-border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-danger border border-border mb-2" />
                  <div className="font-mono text-xs font-medium text-danger">--danger</div>
                  <div className="text-xs text-muted">Destructive action</div>
                </div>
              </div>
            </div>
          </section>
        </TabsContent>

        {/* ================= UI PRIMITIVES PANEL ================= */}
        <TabsContent value="components" className="focus:outline-none">
          <div className="flex flex-col gap-12">
            {/* Buttons Row */}
            <section className="border-b border-border pb-8">
              <h3 className="text-xl font-medium font-display mb-6 text-accent">Buttons Primitive</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary" size="sm">Primary SM</Button>
                <Button variant="primary" size="md">Primary MD</Button>
                <Button variant="primary" size="lg">Primary LG</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="tertiary">Tertiary Link</Button>
                <Button variant="secondary" isLoading>Loading State</Button>
                <Button variant="primary" disabled>Disabled State</Button>
              </div>
            </section>

            {/* Inputs Row */}
            <section className="border-b border-border pb-8">
              <h3 className="text-xl font-medium font-display mb-6 text-accent">Input Fields</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
                <Input
                  label="Generic Text Field"
                  placeholder="Enter visual content..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <Input
                  label="Field with Static Error"
                  placeholder="Focus validation trigger..."
                  error={inputError}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <Button variant="secondary" onClick={handleValidateInput} className="w-fit">
                  Validate Fields
                </Button>
              </div>
            </section>

            {/* Dialogs and Sheets Row */}
            <section className="border-b border-border pb-8">
              <h3 className="text-xl font-medium font-display mb-6 text-accent">Modals & Sliding Drawers</h3>
              <div className="flex flex-wrap gap-6">
                {/* Dialog Trigger */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary">Open Test Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Demonstration Dialog Box</DialogTitle>
                      <DialogDescription>
                        This is an accessible modal overlay utilizing focus trapping and backdrop dismissal keys.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 text-sm text-foreground/80 font-sans">
                      Modal content remains completely static for demonstration. Standard focus rings apply on tab movement.
                    </div>
                    <DialogFooter>
                      <DialogTrigger asChild>
                        <Button variant="secondary">Cancel</Button>
                      </DialogTrigger>
                      <Button variant="primary">Accept Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Sheet Triggers */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="secondary">Open Side Drawer (Desktop)</Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>Detail Inspector Panel</SheetTitle>
                      <SheetDescription>
                        Right-aligned slide layout for detailed concept analysis on desktop screens.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4 text-sm text-foreground/85 font-sans flex flex-col gap-4">
                      <p>Renders statically for styling validation. RLS DB mappings occur in Phase 5.</p>
                      <Skeleton variant="pulse" className="h-4 w-3/4" />
                      <Skeleton variant="pulse" className="h-4 w-1/2" />
                    </div>
                  </SheetContent>
                </Sheet>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="secondary">Open Bottom Drawer (Mobile)</Button>
                  </SheetTrigger>
                  <SheetContent side="bottom">
                    <SheetHeader>
                      <SheetTitle>Mobile Actions Sheet</SheetTitle>
                      <SheetDescription>
                        Bottom-aligned sliding sheet layout targeting gestural touch devices.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4 text-sm text-foreground/85 font-sans">
                      Includes drag-handle visual indicators at the top edge. Dismisses on escape keys.
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </section>

            {/* Tooltips and Skeletons Row */}
            <section className="border-b border-border pb-8">
              <h3 className="text-xl font-medium font-display mb-6 text-accent">Tooltips & Skeletons</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Tooltip trigger */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-mono text-muted">Hover Tooltip Example</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm font-sans font-medium text-foreground underline decoration-accent cursor-help w-fit">
                          Hover over this semantic concept word trigger
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-sans">Explanation: Visual semantic link definition details.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Skeletons examples */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-mono text-muted">Skeleton States</span>
                  <div className="flex flex-col gap-2 max-w-sm">
                    <Skeleton variant="none" className="h-6 w-full" />
                    <span className="text-xs text-muted">Static Skeleton (Default)</span>
                    
                    <Skeleton variant="pulse" className="h-4 w-3/4" />
                    <span className="text-xs text-muted">Subtle Pulse Animation</span>
                    
                    <Skeleton variant="shimmer" className="h-10 w-1/2" />
                    <span className="text-xs text-muted">Subtle Shimmer Shading</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </TabsContent>

        {/* ================= MOTION & INTERACTION PANEL ================= */}
        <TabsContent value="motion" className="focus:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Magnetic Section */}
            <section className="flex flex-col gap-6">
              <h3 className="text-xl font-medium font-display text-accent">Magnetic Springs</h3>
              <p className="text-sm text-muted font-sans max-w-md">
                Interactive triggers pull toward the pointer vector inside a 24px threshold and slide back dynamically when released. Touch fallback deactivates.
              </p>
              <div className="flex flex-wrap gap-8 items-center mt-4">
                <Magnetic radius={36} maxOffset={12}>
                  <Button variant="primary">Snappy Magnet (36px Rad, 12px Max)</Button>
                </Magnetic>
                <Magnetic radius={24} maxOffset={6}>
                  <Button variant="secondary">Gentle Magnet (24px Rad, 6px Max)</Button>
                </Magnetic>
              </div>
            </section>

            {/* Text Splitting Section */}
            <section className="flex flex-col gap-6">
              <h3 className="text-xl font-medium font-display text-accent">Accessible Character Reveal</h3>
              <p className="text-sm text-muted font-sans max-w-md">
                Split headers sequence fadeInUp transitions per character. Decorative animated elements use aria-hidden rules to avoid visual pollution.
              </p>
              <div className="mt-4 p-6 bg-surface border border-border rounded-xl">
                <span className="text-xs font-mono text-muted block mb-3">Split Character Reveal Animation</span>
                <h2 className="text-4xl font-display font-medium text-foreground tracking-tight">
                  <TextSplit text="TOPOLOGY OF THOUGHTS" delayMs={200} />
                </h2>
              </div>
            </section>
          </div>
        </TabsContent>

        {/* ================= RESPONSIVE QA PANEL ================= */}
        <TabsContent value="responsive" className="focus:outline-none">
          <section className="flex flex-col gap-6">
            <h3 className="text-xl font-medium font-display text-accent">Breakpoint Reference</h3>
            <p className="text-sm text-muted font-sans max-w-md">
              Visual reference guides to QA adaptive asymmetric typography grid bounds across client screen sizes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 font-mono text-xs">
              <div className="p-4 border border-border rounded-lg flex flex-col gap-1 md:hidden">
                <div className="text-accent font-bold">MOBILE (320px - 768px)</div>
                <div>Grid: Single Column fluid.</div>
                <div>Drawer: Bottom sheet toggle active.</div>
              </div>
              <div className="p-4 border border-border rounded-lg hidden md:flex lg:hidden flex-col gap-1">
                <div className="text-accent font-bold">TABLET (768px - 1024px)</div>
                <div>Grid: 2 Columns adaptive.</div>
                <div>Spacing: 24px grid gaps.</div>
              </div>
              <div className="p-4 border border-border rounded-lg hidden lg:flex flex-col gap-1">
                <div className="text-accent font-bold">DESKTOP (&gt;1024px)</div>
                <div>Grid: Asymmetric 3 zones.</div>
                <div>Interactive Pointer Halo: Activated.</div>
              </div>
              <div className="p-4 border border-border rounded-lg hidden xl:flex flex-col gap-1">
                <div className="text-accent font-bold">CINEMATIC DESKTOP (&gt;1440px)</div>
                <div>Scale: Clamp display elements max bounds.</div>
                <div>Spacing: Fluid percentage grids.</div>
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
