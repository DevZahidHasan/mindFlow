import dynamic from "next/dynamic";
import { UniverseProps } from "./universe-types";
import React from "react";

// The fallback loader to display while the WebGL chunk loads (or during SSR)
const UniverseFallback = () => (
  <div className="w-full h-full flex items-center justify-center bg-background text-muted-foreground/30 font-mono text-xs tracking-[0.3em] uppercase animate-pulse">
    Initializing Knowledge Core...
  </div>
);

// Dynamic import with ssr: false ensures Three.js only runs on the client
const DynamicUniverseCanvas = dynamic(
  () => import("./universe-canvas").then((mod) => mod.UniverseCanvas),
  { ssr: false, loading: () => <UniverseFallback /> }
);

export const KnowledgeUniverse: React.FC<UniverseProps> = (props) => {
  const nodes = props.nodes || [];
  const edges = props.edges || [];

  return (
    <div className="w-full h-full relative overflow-hidden bg-background">
      {/* Accessibility Fallback for Screen Readers */}
      <div className="sr-only" aria-live="polite">
        <h2>Knowledge Universe Graph</h2>
        <p>This is a 3D visualization of {nodes.length} nodes and {edges.length} connections.</p>
        <ul>
          {nodes.map(node => (
            <li key={node.id}>
              Node: {node.title} ({node.type})
            </li>
          ))}
        </ul>
      </div>

      {nodes.length === 0 && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center text-center p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-700">
          <div className="w-16 h-16 rounded-full border border-accent/30 bg-accent/5 flex items-center justify-center mb-6 ring-8 ring-accent/5 animate-pulse">
            <span className="text-2xl">🌌</span>
          </div>
          <h2 className="text-xl font-display font-medium text-foreground tracking-tight uppercase mb-2">
            Knowledge Core Unseeded
          </h2>
          <p className="text-xs font-sans text-muted max-w-md leading-relaxed mb-6">
            Your Knowledge Universe is waiting for its first spark. Write a manual note or import existing documents to generate your 3D graph.
          </p>
        </div>
      )}

      <DynamicUniverseCanvas {...props} nodes={nodes} edges={edges} />
    </div>
  );
};
