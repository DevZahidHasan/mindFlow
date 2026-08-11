import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useState } from "react";
import { GraphNode } from "./universe-types";

interface UniverseCameraProps {
  nodes: GraphNode[];
  focusedNodeId: string | null;
}

export const UniverseCamera: React.FC<UniverseCameraProps> = ({ nodes, focusedNodeId }) => {
  const { camera, controls } = useThree();
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null);

  useEffect(() => {
    if (focusedNodeId) {
      const node = nodes.find(n => n.id === focusedNodeId);
      if (node && node.x !== undefined && node.y !== undefined && node.z !== undefined) {
        // We want the camera to look at the node, but be slightly offset so it doesn't clip inside
        const target = new THREE.Vector3(node.x, node.y, node.z);
        setTargetPosition(target);
      }
    } else {
      setTargetPosition(null);
    }
  }, [focusedNodeId, nodes]);

  useFrame((state: any, delta: number) => {
    if (targetPosition && controls) {
      // Smoothly interpolate the orbit controls target to the node
      const currentTarget = (controls as any).target as THREE.Vector3;
      currentTarget.lerp(targetPosition, delta * 2);
      
      // Smoothly move the camera closer to the node along the viewing vector
      const direction = camera.position.clone().sub(targetPosition).normalize();
      const desiredCameraPos = targetPosition.clone().add(direction.multiplyScalar(150));
      camera.position.lerp(desiredCameraPos, delta * 2);
    }
  });

  return null;
};
