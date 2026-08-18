"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Project } from "../schemas/project.schema";
import { KnowledgeNode } from "@/features/knowledge/schemas/node.schema";
import { createProjectAction } from "../actions/project-actions";

interface ProjectsViewProps {
  workspaceId: string;
  projects: Project[];
  nodes: KnowledgeNode[];
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  workspaceId,
  projects,
  nodes,
}) => {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || isPending) return;

    setIsPending(true);
    const res = await createProjectAction(workspaceId, {
      name: newProjectName.trim(),
      description: newProjectDesc.trim() || undefined,
    });
    setIsPending(false);

    if (res.success) {
      setNewProjectName("");
      setNewProjectDesc("");
      setIsCreating(false);
      router.refresh();
    }
  };

  const handleProjectFilter = (projectId: string) => {
    // Spatial lens: open universe filtered by this project!
    router.push(`/w/${workspaceId}?tab=universe&project=${projectId}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12 flex flex-col gap-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-8">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono text-accent uppercase tracking-[0.25em]">
            Strategic Containers
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-medium text-foreground tracking-tight">
            Projects
          </h1>
          <p className="text-sm font-sans text-muted max-w-xl leading-relaxed">
            Organize and channel your knowledge universe into focused project streams. Filter the 3D Universe to view project-specific knowledge constellations.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-5 py-3 rounded-xl bg-accent text-black font-semibold text-xs font-sans hover:bg-accent/90 active:scale-95 transition-all cursor-pointer shadow-md self-start md:self-auto min-h-[44px]"
        >
          {isCreating ? "Cancel" : "+ New Project"}
        </button>
      </div>

      {/* Creation Drawer */}
      {isCreating && (
        <form
          onSubmit={handleCreateProject}
          className="p-6 rounded-2xl bg-surface border border-accent/40 shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300"
        >
          <h3 className="text-sm font-mono uppercase tracking-widest text-accent font-semibold">
            Create Strategic Project
          </h3>
          <input
            type="text"
            required
            value={newProjectName}
            onChange={e => setNewProjectName(e.target.value)}
            placeholder="Project name (e.g. Production Security Infrastructure)"
            className="w-full px-4 py-3 rounded-xl bg-surface-subtle border border-border/70 text-sm font-sans text-foreground placeholder:text-muted/50 focus:border-accent outline-none"
          />
          <textarea
            value={newProjectDesc}
            onChange={e => setNewProjectDesc(e.target.value)}
            placeholder="Project description and scope..."
            rows={2}
            className="w-full px-4 py-3 rounded-xl bg-surface-subtle border border-border/70 text-sm font-sans text-foreground placeholder:text-muted/50 focus:border-accent outline-none resize-none"
          />
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
              disabled={isPending || !newProjectName.trim()}
              className="px-5 py-2 rounded-lg bg-accent text-black text-xs font-semibold hover:bg-accent/90 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Creating..." : "Save Project"}
            </button>
          </div>
        </form>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center gap-3 border border-dashed border-border/40 rounded-2xl">
          <span className="text-3xl font-mono text-accent">✦</span>
          <h3 className="text-base font-sans font-medium text-foreground">No projects defined yet</h3>
          <p className="text-xs text-muted max-w-sm">
            Create your first project above to group related knowledge nodes into strategic lenses.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="group p-6 rounded-2xl bg-surface/70 hover:bg-surface border border-border/60 hover:border-accent/60 transition-all duration-500 flex flex-col justify-between gap-6 shadow-sm hover:shadow-xl hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationFillMode: "both", animationDelay: `${index * 75}ms` }}
            >
              <div 
                className="flex flex-col gap-3 cursor-pointer"
                onClick={() => handleProjectFilter(project.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-accent font-semibold px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                    {project.status.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-muted group-hover:text-accent transition-colors">
                    Filter Universe ↗
                  </span>
                </div>

                <h3 className="text-xl font-display font-medium text-foreground group-hover:text-accent transition-colors">
                  {project.name}
                </h3>

                {project.description && (
                  <p className="text-xs font-sans text-muted leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-border/40">
                <div 
                  className="flex items-center justify-between text-[11px] font-mono text-muted cursor-pointer"
                  onClick={() => handleProjectFilter(project.id)}
                >
                  <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                  <span className="text-accent font-semibold group-hover:translate-x-1 transition-transform">Open Lens →</span>
                </div>

                {/* Node Assignment Control */}
                <div className="mt-2 pt-2 border-t border-border/20 flex flex-col gap-1.5">
                  <span className="text-[9px] font-mono text-muted uppercase tracking-wider">Assign Note to Project:</span>
                  <AssignNoteControl workspaceId={workspaceId} projectId={project.id} nodes={nodes} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AssignNoteControl = ({ workspaceId, projectId, nodes }: { workspaceId: string, projectId: string, nodes: KnowledgeNode[] }) => {
  const router = useRouter();
  const [status, setStatus] = useState<"IDLE" | "ASSIGNING" | "SUCCESS">("IDLE");

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const nodeId = e.target.value;
    if (!nodeId) return;

    setStatus("ASSIGNING");
    const { assignNodeToProjectAction } = await import("../actions/project-actions");
    const res = await assignNodeToProjectAction(workspaceId, projectId, nodeId);
    
    if (res.success) {
      setStatus("SUCCESS");
      setTimeout(() => {
        setStatus("IDLE");
      }, 2000);
      router.refresh();
    } else {
      setStatus("IDLE");
    }
  };

  if (status === "SUCCESS") {
    return (
      <div className="w-full px-2.5 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs font-sans text-emerald-400 flex items-center gap-2">
        <span>✓</span> Note successfully assigned!
      </div>
    );
  }

  return (
    <select
      className="w-full px-2.5 py-1.5 rounded-lg bg-surface-subtle border border-border/50 text-xs font-sans text-foreground outline-none cursor-pointer focus:border-accent disabled:opacity-50"
      onClick={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
      onChange={handleChange}
      value=""
      disabled={status === "ASSIGNING"}
    >
      <option value="" disabled>
        {status === "ASSIGNING" ? "Assigning..." : "+ Select Note to Assign..."}
      </option>
      {nodes.map(n => (
        <option key={n.id} value={n.id}>{n.title}</option>
      ))}
    </select>
  );
};
