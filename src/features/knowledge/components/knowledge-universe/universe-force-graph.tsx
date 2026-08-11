import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { forceSimulation, forceLink, forceManyBody, forceCenter } from "d3-force-3d";
import { UniverseProps, GraphNode, GraphEdge } from "./universe-types";
import { UniverseNodes } from "./universe-nodes";
import { UniverseEdges } from "./universe-edges";
import { UniverseCamera } from "./universe-camera";

import { useRouter } from "next/navigation";

export const UniverseForceGraph: React.FC<UniverseProps> = ({ nodes, edges, workspaceId, focusedNodeId: initialFocus }) => {
  const router = useRouter();
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[], edges: GraphEdge[] }>({ nodes: [], edges: [] });
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(initialFocus || null);
  const simulationRef = useRef<any>(null);

  // If search triggers a focus change while we are already mounted
  useEffect(() => {
    if (initialFocus) {
      setFocusedNodeId(initialFocus);
    }
  }, [initialFocus]);

  // Initialize the simulation
  useEffect(() => {
    if (!nodes.length) return;

    // Clone nodes and edges to give D3 its own objects to mutate
    const simNodes: GraphNode[] = nodes.map(n => ({ ...n }));
    
    // Map edge source/target to the actual node objects (D3 requirement)
    const simEdges: GraphEdge[] = edges.map(e => ({
      ...e,
      source: e.source_id,
      target: e.target_id
    })) as any; // D3 will overwrite source/target with objects

    const simulation = forceSimulation(simNodes as any, 3)
      .force("link", forceLink(simEdges).id((d: any) => d.id).distance(150))
      .force("charge", forceManyBody().strength(-400))
      .force("center", forceCenter(0, 0, 0))
      .stop();

    // D3 computes ticks. In a real app we can tick over time or pre-compute
    for (let i = 0; i < 300; ++i) simulation.tick();

    setGraphData({
      nodes: simNodes as unknown as GraphNode[],
      edges: simEdges as unknown as GraphEdge[],
    });
    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [nodes, edges]);

  if (!graphData.nodes.length) return null;

  const handleRouteToNote = (nodeId: string) => {
    router.push(`/w/${workspaceId}/notes/${nodeId}`);
  };

  return (
    <group>
      <UniverseEdges edges={graphData.edges} />
      <UniverseNodes 
        nodes={graphData.nodes} 
        workspaceId={workspaceId} 
        focusedNodeId={focusedNodeId}
        onNodeClick={(id) => setFocusedNodeId(id)}
        onNodeDoubleClick={handleRouteToNote}
      />
      <UniverseCamera 
        nodes={graphData.nodes} 
        focusedNodeId={focusedNodeId} 
      />
    </group>
  );
};
