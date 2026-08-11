import React, { useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GraphNode } from "./universe-types";
import { useRouter } from "next/navigation";
import { Text } from "@react-three/drei";

interface UniverseNodesProps {
  nodes: GraphNode[];
  workspaceId: string;
  focusedNodeId: string | null;
  onNodeClick?: (nodeId: string | null) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
}

const DEFAULT_COLOR = new THREE.Color("#4a4a4a");
const HOVER_COLOR = new THREE.Color("#d4af37"); // Gold
const FADED_COLOR = new THREE.Color("#111111");

export const UniverseNodes: React.FC<UniverseNodesProps> = ({ nodes, workspaceId, focusedNodeId, onNodeClick, onNodeDoubleClick }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { camera } = useThree();

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Initialize instanced mesh data
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  useFrame(() => {
    if (!meshRef.current) return;

    nodes.forEach((node, i) => {
      // D3 sets x,y,z
      dummy.position.set(node.x || 0, node.y || 0, node.z || 0);
      
      // Determine scale/color based on hover
      const isHovered = hoveredNodeId === node.id;
      const isFocused = focusedNodeId === node.id;
      const isAnotherFocused = focusedNodeId !== null && !isFocused;
      
      const targetScale = isHovered || isFocused ? 2.5 : 1.5;
      
      dummy.scale.set(targetScale, targetScale, targetScale);
      dummy.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      
      // Handle color
      let color = DEFAULT_COLOR;
      if (isHovered || isFocused) color = HOVER_COLOR;
      else if (isAnotherFocused) color = FADED_COLOR;
      
      meshRef.current!.setColorAt(i, color);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  const handlePointerMove = (e: any) => {
    e.stopPropagation();
    const instanceId = e.instanceId;
    if (instanceId !== undefined && nodes[instanceId]) {
      setHoveredNodeId(nodes[instanceId].id);
      document.body.style.cursor = "pointer";
    }
  };

  const handlePointerOut = () => {
    setHoveredNodeId(null);
    document.body.style.cursor = "crosshair";
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    const instanceId = e.instanceId;
    if (instanceId !== undefined && nodes[instanceId]) {
      const node = nodes[instanceId];
      if (focusedNodeId === node.id && onNodeDoubleClick) {
        onNodeDoubleClick(node.id);
      } else if (onNodeClick) {
        onNodeClick(node.id);
      }
    }
  };

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, nodes.length]}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        onPointerMissed={() => { if (onNodeClick) onNodeClick(null); }}
      >
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      
      {/* Node Labels */}
      {nodes.map((node) => {
        const isHovered = hoveredNodeId === node.id;
        const isFocused = focusedNodeId === node.id;
        const isAnotherFocused = focusedNodeId !== null && !isFocused;
        
        return (
          <Text
            key={node.id}
            position={[node.x || 0, (node.y || 0) - 16, node.z || 0]}
            fontSize={6}
            color={isHovered || isFocused ? "#d4af37" : (isAnotherFocused ? "#333333" : "#aaaaaa")}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.5}
            outlineColor="#000000"
          >
            {node.title}
          </Text>
        );
      })}
    </group>
  );
};
