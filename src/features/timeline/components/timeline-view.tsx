"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TimelineEvent } from "../schemas/timeline.schema";
import { useScrollProgress } from "@/lib/hooks/use-scroll-progress";

interface TimelineViewProps {
  workspaceId: string;
  events: TimelineEvent[];
  focusedNodeId?: string;
  selectedEventType?: string;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  workspaceId,
  events,
  focusedNodeId,
  selectedEventType,
}) => {
  const router = useRouter();
  const [filterType, setFilterType] = useState<string>(selectedEventType || "ALL");
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  const filteredEvents = events.filter(e => {
    if (filterType === "ALL") return true;
    return e.event_type === filterType;
  });

  const getEventBadge = (type: string) => {
    switch (type) {
      case "NODE_CREATED":
        return { label: "NOTE CREATED", color: "text-emerald-400 bg-emerald-950/40 border-emerald-800/40" };
      case "EDGE_CONNECTED":
        return { label: "EDGE CONNECTED", color: "text-accent bg-accent/10 border-accent/30" };
      case "AI_SUMMARIZED":
        return { label: "AI DISTILLATION", color: "text-purple-400 bg-purple-950/40 border-purple-800/40" };
      case "NODE_ASSIGNED_PROJECT":
        return { label: "PROJECT ASSIGNMENT", color: "text-sky-400 bg-sky-950/40 border-sky-800/40" };
      case "NODE_ASSIGNED_COLLECTION":
        return { label: "COLLECTION TAG", color: "text-amber-400 bg-amber-950/40 border-amber-800/40" };
      default:
        return { label: type.replace(/_/g, " "), color: "text-muted bg-surface border-border" };
    }
  };

  const handleEventClick = (event: TimelineEvent) => {
    setActiveEventId(event.id);
    if (event.event_type === "EDGE_CONNECTED" && event.node_id) {
      // Signature Time -> Space Transition: Fly into Universe focused on this relationship
      router.push(`/w/${workspaceId}?tab=universe&focus=${event.node_id}`);
    } else if (event.node_id) {
      // Navigate to Note Editor
      router.push(`/w/${workspaceId}/notes/${event.node_id}`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono text-accent uppercase tracking-[0.25em]">
            Temporal Knowledge Stream
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-foreground tracking-tight">
            Knowledge Log
          </h1>
          <p className="text-xs font-sans text-muted max-w-lg leading-relaxed">
            Trace the evolutionary history of your ideas. Every node created, connection formed, and AI synthesis is recorded chronologically.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
          {["ALL", "NODE_CREATED", "EDGE_CONNECTED", "NODE_ASSIGNED_PROJECT"].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                filterType === type
                  ? "bg-accent text-black font-semibold border-accent"
                  : "bg-surface/60 text-muted hover:text-foreground border-border/50 hover:border-border"
              }`}
            >
              {type === "ALL" ? "All History" : type.replace(/NODE_|EDGE_/g, "").replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Stream List */}
      {filteredEvents.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center gap-3 border border-dashed border-border/40 rounded-2xl">
          <span className="text-2xl">⚓</span>
          <h3 className="text-sm font-sans font-medium text-foreground">No timeline events found</h3>
          <p className="text-xs text-muted max-w-sm">
            Create or connect notes to generate your first chronological knowledge log.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 md:pl-10 border-l border-border/40 flex flex-col gap-10">
          {filteredEvents.map((event, index) => {
            const badge = getEventBadge(event.event_type);
            const date = new Date(event.created_at);
            const formattedDate = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const formattedTime = date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });

            const isCurrentNode = focusedNodeId && (event.node_id === focusedNodeId || event.secondary_node_id === focusedNodeId);

            return (
              <div
                key={event.id}
                onClick={() => handleEventClick(event)}
                className={`group relative flex flex-col gap-2 p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isCurrentNode
                    ? "bg-accent/10 border-accent shadow-lg scale-[1.01]"
                    : "bg-surface/70 hover:bg-surface border-border/60 hover:border-accent/40 shadow-sm"
                }`}
              >
                {/* Timeline Anchor Node Point */}
                <div 
                  className={`absolute -left-[31px] md:-left-[47px] top-6 w-3 h-3 rounded-full border-2 transition-all ${
                    event.event_type === "EDGE_CONNECTED" 
                      ? "bg-accent border-background ring-4 ring-accent/20" 
                      : "bg-surface border-muted-foreground group-hover:border-accent"
                  }`} 
                />

                {/* Event Header & Timestamp */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${badge.color}`}>
                      {badge.label}
                    </span>
                    {event.event_type === "EDGE_CONNECTED" && (
                      <span className="text-[10px] font-mono text-accent">
                        ✦ Click to fly in Universe ↗
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-muted">
                    {formattedDate} • {formattedTime}
                  </span>
                </div>

                {/* Event Title */}
                <h4 className="text-base font-sans font-medium text-foreground group-hover:text-accent transition-colors">
                  {event.title}
                </h4>

                {/* Event Description/Excerpt */}
                {event.description && (
                  <p className="text-xs font-sans text-muted leading-relaxed line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
