import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GraphEdge } from "./universe-types";

interface UniverseEdgesProps {
  edges: GraphEdge[];
}

export const UniverseEdges: React.FC<UniverseEdgesProps> = ({ edges }) => {
  const lineRef = useRef<THREE.LineSegments>(null);

  // Pre-allocate geometry array
  const positions = useMemo(() => {
    return new Float32Array(edges.length * 6); // 2 points per edge, 3 coords per point
  }, [edges.length]);

  useFrame(() => {
    if (!lineRef.current) return;

    edges.forEach((edge, i) => {
      const source = edge.source as any;
      const target = edge.target as any;
      
      if (source && target) {
        // Point A
        positions[i * 6] = source.x || 0;
        positions[i * 6 + 1] = source.y || 0;
        positions[i * 6 + 2] = source.z || 0;
        
        // Point B
        positions[i * 6 + 3] = target.x || 0;
        positions[i * 6 + 4] = target.y || 0;
        positions[i * 6 + 5] = target.z || 0;
      }
    });

    lineRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (edges.length === 0) return null;

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#d4af37" transparent opacity={0.6} linewidth={1} />
    </lineSegments>
  );
};
