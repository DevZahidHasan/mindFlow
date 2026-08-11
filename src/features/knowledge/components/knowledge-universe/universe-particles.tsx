import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const UniverseParticles: React.FC<{ isFocused: boolean }> = ({ isFocused }) => {
  const count = 2000;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      
      // Random coordinates in a large sphere
      const radius = 800 + Math.random() * 2000;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: x, my: y, mz: z });
    }
    return temp;
  }, [count]);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, isFocused ? 0 : 0.15, delta * 2);
    }
    
    if (!meshRef.current) return;
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor, mx, my, mz } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      
      dummy.position.set(
        mx + (xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10),
        my + (yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10),
        mz + (zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10)
      );
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial ref={materialRef} color="#ffffff" transparent opacity={0.15} toneMapped={false} />
    </instancedMesh>
  );
};
