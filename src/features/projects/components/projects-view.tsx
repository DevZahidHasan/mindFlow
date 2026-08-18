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
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              workspaceId={workspaceId}
              nodes={nodes}
              onFilter={handleProjectFilter}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ProjectCardProps {
  project: Project;
  index: number;
  workspaceId: string;
  nodes: KnowledgeNode[];
  onFilter: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  workspaceId,
  nodes,
  onFilter,
}) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: "active" | "completed" | "archived") => {
    setIsUpdating(true);
    const { updateProjectAction } = await import("../actions/project-actions");
    await updateProjectAction(workspaceId, {
      id: project.id,
      workspace_id: workspaceId,
      status: newStatus,
    });
    setIsUpdating(false);
    router.refresh();
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isUpdating) return;

    setIsUpdating(true);
    const { updateProjectAction } = await import("../actions/project-actions");
    const res = await updateProjectAction(workspaceId, {
      id: project.id,
      workspace_id: workspaceId,
      name: name.trim(),
      description: description.trim() || null,
    });
    setIsUpdating(false);

    if (res.success) {
      setIsEditing(false);
      router.refresh();
    }
  };

  return (
    <div
      className="group p-6 rounded-2xl bg-surface/70 hover:bg-surface border border-border/60 hover:border-accent/60 transition-all duration-500 flex flex-col justify-between gap-6 shadow-sm hover:shadow-xl hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 relative"
      style={{ animationFillMode: "both", animationDelay: `${index * 75}ms` }}
    >
      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="flex flex-col gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project Name"
            className="w-full px-3 py-1.5 rounded-lg bg-surface-subtle border border-accent/40 text-sm font-sans font-medium text-foreground outline-none"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description..."
            rows={2}
            className="w-full px-3 py-1.5 rounded-lg bg-surface-subtle border border-border/40 text-xs font-sans text-foreground outline-none resize-none"
          />
          <div className="flex items-center justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 rounded text-xs font-mono text-muted hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-3 py-1 rounded bg-accent text-black font-semibold text-xs font-sans hover:bg-accent/90 cursor-pointer disabled:opacity-50"
            >
              {isUpdating ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <StatusDropdown
              status={project.status}
              disabled={isUpdating}
              onChange={handleStatusChange}
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-[10px] font-mono text-muted hover:text-accent transition-colors cursor-pointer"
                title="Edit Project"
              >
                ✎ Edit
              </button>
              <span 
                onClick={() => onFilter(project.id)} 
                className="text-xs font-mono text-muted group-hover:text-accent transition-colors cursor-pointer"
              >
                Filter Universe ↗
              </span>
            </div>
          </div>

          <div onClick={() => onFilter(project.id)} className="cursor-pointer">
            <h3 className="text-xl font-display font-medium text-foreground group-hover:text-accent transition-colors">
              {project.name}
            </h3>

            {project.description && (
              <p className="text-xs font-sans text-muted leading-relaxed line-clamp-3 mt-1">
                {project.description}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 pt-4 border-t border-border/40">
        <div 
          className="flex items-center justify-between text-[11px] font-mono text-muted cursor-pointer"
          onClick={() => onFilter(project.id)}
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
  );
};

// --- Custom Dark Theme Status Dropdown ---

interface StatusDropdownProps {
  status: "active" | "completed" | "archived";
  disabled?: boolean;
  onChange: (status: "active" | "completed" | "archived") => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ status, disabled, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: Array<{ value: "active" | "completed" | "archived"; label: string; color: string }> = [
    { value: "active", label: "Active", color: "text-accent" },
    { value: "completed", label: "Completed", color: "text-emerald-400" },
    { value: "archived", label: "Archived", color: "text-muted" },
  ];

  const currentOption = options.find((o) => o.value === status) || options[0];

  const getBadgeStyle = (s: string) => {
    switch (s) {
      case "completed":
        return "text-emerald-400 bg-emerald-950/50 border-emerald-800/50 hover:border-emerald-500/60";
      case "archived":
        return "text-muted bg-surface/90 border-border/70 hover:border-border";
      default:
        return "text-accent bg-accent/10 border-accent/30 hover:border-accent/60";
    }
  };

  return (
    <div className="relative inline-block text-left z-20" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-[0.15em] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50 ${getBadgeStyle(
          status
        )}`}
      >
        <span>{currentOption.label}</span>
        <span className={`text-[8px] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-36 rounded-xl bg-surface border border-border/80 shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono uppercase tracking-wider text-left transition-colors cursor-pointer ${
                status === option.value
                  ? "bg-accent/15 text-foreground font-semibold"
                  : "text-muted hover:text-foreground hover:bg-surface-subtle"
              }`}
            >
              <span className={option.color}>{option.label}</span>
              {status === option.value && <span className="text-accent text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Custom Dark Theme Assign Note Control ---

const AssignNoteControl = ({
  workspaceId,
  projectId,
  nodes,
}: {
  workspaceId: string;
  projectId: string;
  nodes: KnowledgeNode[];
}) => {
  const router = useRouter();
  const [status, setStatus] = useState<"IDLE" | "ASSIGNING" | "SUCCESS">("IDLE");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectNote = async (nodeId: string) => {
    setIsOpen(false);
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
      <div className="w-full px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs font-sans text-emerald-400 flex items-center gap-2 animate-in fade-in duration-300">
        <span>✓</span> Note assigned to project!
      </div>
    );
  }

  return (
    <div className="relative w-full z-10" ref={dropdownRef}>
      <button
        type="button"
        disabled={status === "ASSIGNING"}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border/60 hover:border-accent/40 text-xs font-sans text-muted hover:text-foreground flex items-center justify-between transition-all cursor-pointer disabled:opacity-50"
      >
        <span>{status === "ASSIGNING" ? "Assigning note..." : "+ Select Note to Assign..."}</span>
        <span className={`text-[10px] text-muted transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 max-h-48 overflow-y-auto no-scrollbar rounded-xl bg-surface border border-border/80 shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
          {nodes.length === 0 ? (
            <div className="px-3 py-2 text-xs font-sans text-muted text-center">
              No notes available
            </div>
          ) : (
            nodes.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => handleSelectNote(node.id)}
                className="w-full px-3 py-2 text-xs font-sans text-foreground text-left hover:bg-accent/15 hover:text-accent transition-colors flex items-center justify-between cursor-pointer"
              >
                <span className="truncate">{node.title}</span>
                <span className="text-[9px] font-mono text-muted uppercase ml-2">Note</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
