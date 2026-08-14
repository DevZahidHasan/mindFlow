"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Collection } from "../schemas/collection.schema";
import { createCollectionAction } from "../actions/collection-actions";

interface CollectionsViewProps {
  workspaceId: string;
  collections: Collection[];
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  workspaceId,
  collections,
}) => {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("✦");
  const [isPending, setIsPending] = useState(false);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isPending) return;

    setIsPending(true);
    const res = await createCollectionAction(workspaceId, { name: name.trim(), icon });
    setIsPending(false);

    if (res.success) {
      setName("");
      setIsCreating(false);
      router.refresh();
    }
  };

  const handleCollectionFilter = (collectionId: string) => {
    router.push(`/w/${workspaceId}?tab=universe&collection=${collectionId}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12 flex flex-col gap-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-8">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono text-accent uppercase tracking-[0.25em]">
            Editorial Groupings
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-medium text-foreground tracking-tight">
            Collections
          </h1>
          <p className="text-sm font-sans text-muted max-w-xl leading-relaxed">
            Curate and collect knowledge items into thematic tags, references, and research buckets.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-5 py-3 rounded-xl bg-accent text-black font-semibold text-xs font-sans hover:bg-accent/90 active:scale-95 transition-all cursor-pointer shadow-md self-start md:self-auto min-h-[44px]"
        >
          {isCreating ? "Cancel" : "+ New Collection"}
        </button>
      </div>

      {/* Creation Box */}
      {isCreating && (
        <form
          onSubmit={handleCreateCollection}
          className="p-6 rounded-2xl bg-surface border border-accent/40 shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300"
        >
          <h3 className="text-sm font-mono uppercase tracking-widest text-accent font-semibold">
            Create Editorial Collection
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={icon}
              onChange={e => setIcon(e.target.value)}
              placeholder="Icon"
              className="w-16 px-3 py-3 rounded-xl bg-surface-subtle border border-border/70 text-center text-lg font-mono focus:border-accent outline-none"
            />
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Collection name (e.g. Core Architecture, Research Notes)"
              className="flex-1 px-4 py-3 rounded-xl bg-surface-subtle border border-border/70 text-sm font-sans text-foreground placeholder:text-muted/50 focus:border-accent outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs font-sans text-muted hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="px-5 py-2 rounded-lg bg-accent text-black text-xs font-semibold hover:bg-accent/90 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Creating..." : "Save Collection"}
            </button>
          </div>
        </form>
      )}

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center gap-3 border border-dashed border-border/40 rounded-2xl">
          <span className="text-3xl font-mono text-accent">✦</span>
          <h3 className="text-base font-sans font-medium text-foreground">No collections yet</h3>
          <p className="text-xs text-muted max-w-sm">
            Group your notes into quick thematic collections like Research, Architecture, or Archive.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {collections.map(col => (
            <div
              key={col.id}
              onClick={() => handleCollectionFilter(col.id)}
              className="group p-5 rounded-2xl bg-surface/70 hover:bg-surface border border-border/60 hover:border-accent/60 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 shadow-sm hover:shadow-md hover:scale-[1.01]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl shrink-0">{col.icon}</span>
                <span className="font-sans font-medium text-sm text-foreground truncate group-hover:text-accent transition-colors">
                  {col.name}
                </span>
              </div>
              <span className="text-xs font-mono text-muted group-hover:text-accent">↗</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
