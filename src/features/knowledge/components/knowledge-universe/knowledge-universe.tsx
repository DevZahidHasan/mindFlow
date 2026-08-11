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
  return (
    <div className="w-full h-full relative overflow-hidden bg-background">
      <DynamicUniverseCanvas {...props} />
    </div>
  );
};
