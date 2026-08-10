"use client";

import * as React from "react";
import { mockNodes, mockEdges, GraphNode } from "../../data/graph-mock";
import { DetailPanel } from "./detail-panel";

export const GraphCanvas: React.FC = () => {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [selectedNode, setSelectedNode] = React.useState<GraphNode | null>(null);
  const [time, setTime] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Set up low-amplitude organic drift loop using requestAnimationFrame
  React.useEffect(() => {
    // Disable active physics loop under prefers-reduced-motion
    const mediaMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaMotion.matches) return;

    let rId: number;
    let isActive = true;

    // Use IntersectionObserver to stop loop when viewport is hidden
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isActive = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const updateTime = () => {
      if (isActive) {
        setTime((prev) => prev + 1);
      }
      rId = requestAnimationFrame(updateTime);
    };

    rId = requestAnimationFrame(updateTime);

    return () => {
      cancelAnimationFrame(rId);
      observer.disconnect();
    };
  }, []);

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };

  const handleKeyDown = (e: React.KeyboardEvent, node: GraphNode) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleNodeClick(node);
    }
  };

  // Convert normalized node coordinates to SVG viewport space (600 x 500)
  const getCoordinates = (node: GraphNode, index: number) => {
    // Simple, predictable math offset based on drift loop (amplitude: ~3px max)
    const driftX = Math.sin(time / 60 + index) * 3;
    const driftY = Math.cos(time / 70 + index) * 3;

    const baseX = 300 + node.x * 2.2;
    const baseY = 250 + node.y * 1.8;

    return {
      x: baseX + driftX,
      y: baseY + driftY,
    };
  };

  // Build coordinate lookup cache for edge rendering
  const coordCache = mockNodes.map((node, idx) => getCoordinates(node, idx));

  const getNodeCoords = (id: string) => {
    const idx = mockNodes.findIndex((n) => n.id === id);
    if (idx === -1) return { x: 300, y: 250 };
    return coordCache[idx];
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] max-w-2xl mx-auto bg-surface border border-border rounded-2xl overflow-hidden select-none shadow-2xl"
    >
      {/* Dynamic Grid Background Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(212,175,55,0.04),rgba(0,0,0,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* SVG Canvas Rendering */}
      <svg viewBox="0 0 600 500" className="w-full h-full">
        {/* Render Edges (Links) */}
        <g>
          {mockEdges.map((edge, index) => {
            const from = getNodeCoords(edge.source);
            const to = getNodeCoords(edge.target);

            const isRelatedToHover =
              hoveredId !== null && (edge.source === hoveredId || edge.target === hoveredId);

            const isQuiet = hoveredId !== null && !isRelatedToHover;

            return (
              <line
                key={`edge-${index}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                className={`stroke-2 transition-all duration-300 ${
                  isRelatedToHover
                    ? "stroke-accent opacity-75"
                    : isQuiet
                    ? "stroke-border opacity-10"
                    : "stroke-border opacity-40"
                }`}
              />
            );
          })}
        </g>

        {/* Render Nodes (Interactive Concept Groups) */}
        <g>
          {mockNodes.map((node, index) => {
            const { x, y } = coordCache[index];

            const isSelected = hoveredId === node.id;
            const isRelated =
              hoveredId !== null &&
              (node.id === hoveredId || node.relatedConcepts.includes(hoveredId));

            const isQuiet = hoveredId !== null && !isRelated;

            return (
              <g
                key={node.id}
                transform={`translate(${x}, ${y})`}
                tabIndex={0}
                role="button"
                aria-label={`Inspect ${node.label} node. Has ${node.notesCount} notes and ${node.relatedConcepts.length} connections.`}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(node.id)}
                onBlur={() => setHoveredId(null)}
                onClick={() => handleNodeClick(node)}
                onKeyDown={(e) => handleKeyDown(e, node)}
                className="cursor-pointer focus-visible:outline-none"
              >
                {/* Outer Glow Halo when hovered */}
                <circle
                  r="24"
                  className={`fill-accent/10 stroke-none transition-all duration-300 scale-150 ${
                    isSelected ? "opacity-100" : "opacity-0"
                  }`}
                />

                {/* Primary Anchor Circle */}
                <circle
                  r={isSelected ? "10" : "8"}
                  className={`transition-all duration-200 ${
                    isSelected
                      ? "fill-accent stroke-background stroke-2"
                      : isRelated
                      ? "fill-foreground stroke-background stroke-2"
                      : isQuiet
                      ? "fill-muted opacity-40"
                      : "fill-border stroke-background stroke-2"
                  }`}
                />

                {/* Concept Label */}
                <text
                  y="-16"
                  textAnchor="middle"
                  className={`text-xs font-medium tracking-tight font-display transition-all duration-200 select-none ${
                    isSelected
                      ? "fill-accent scale-105 font-semibold"
                      : isQuiet
                      ? "fill-muted opacity-30"
                      : "fill-foreground"
                  }`}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Accessible Detail Inspector Card Panel */}
      <DetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
};
