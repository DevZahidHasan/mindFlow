import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GraphEdge } from "./universe-types";

interface UniverseEdgesProps {
  edges: GraphEdge[];
  focusedNodeId?: string | null;
}

const DEFAULT_EDGE_COLOR = new THREE.Color("#e5c058"); // Luminous Gold
const ACTIVE_EDGE_COLOR = new THREE.Color("#fff280");  // Radiant gold
const FADED_EDGE_COLOR = new THREE.Color("#332b10");   // Dim subtle gold

const UP_VECTOR = new THREE.Vector3(0, 1, 0);

export const UniverseEdges: React.FC<UniverseEdgesProps> = ({ edges, focusedNodeId }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Filter valid edges that have resolved source and target node objects
  const validEdges = useMemo(() => {
    return edges.filter((edge) => {
      const source = edge.source as any;
      const target = edge.target as any;
      return (
        source &&
        target &&
        typeof source === "object" &&
        typeof target === "object" &&
        typeof source.x === "number" &&
        typeof target.x === "number"
      );
    });
  }, [edges]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const position = useMemo(() => new THREE.Vector3(), []);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const quaternion = useMemo(() => new THREE.Quaternion(), []);

  useFrame(() => {
    if (!meshRef.current || validEdges.length === 0) return;

    validEdges.forEach((edge, i) => {
      const source = edge.source as any;
      const target = edge.target as any;

      const sx = source.x || 0;
      const sy = source.y || 0;
      const sz = source.z || 0;
      const tx = target.x || 0;
      const ty = target.y || 0;
      const tz = target.z || 0;

      // Midpoint position
      position.set((sx + tx) / 2, (sy + ty) / 2, (sz + tz) / 2);

      // Vector from source to target
      direction.set(tx - sx, ty - sy, tz - sz);
      const distance = direction.length();

      // Normalize direction and compute quaternion rotation
      if (distance > 0.001) {
        direction.normalize();
        quaternion.setFromUnitVectors(UP_VECTOR, direction);
      } else {
        quaternion.identity();
      }

      // Check focus state
      const isHighlighted =
        Boolean(focusedNodeId) &&
        (source.id === focusedNodeId || target.id === focusedNodeId);
      const isFaded = Boolean(focusedNodeId) && !isHighlighted;

      const radius = isHighlighted ? 1.8 : isFaded ? 0.6 : 1.2;

      dummy.position.copy(position);
      dummy.quaternion.copy(quaternion);
      dummy.scale.set(radius, distance, radius);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);

      const color = isHighlighted
        ? ACTIVE_EDGE_COLOR
        : isFaded
        ? FADED_EDGE_COLOR
        : DEFAULT_EDGE_COLOR;

      meshRef.current!.setColorAt(i, color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  if (validEdges.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      key={`edges-mesh-${validEdges.length}`}
      args={[undefined, undefined, validEdges.length]}
      frustumCulled={false}
    >
      <cylinderGeometry args={[1, 1, 1, 8]} />
      <meshBasicMaterial toneMapped={false} transparent opacity={0.9} />
    </instancedMesh>
  );
};
