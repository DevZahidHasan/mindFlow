import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { UniverseProps } from "./universe-types";
import { UniverseForceGraph } from "./universe-force-graph";
import { UniverseParticles } from "./universe-particles";

export const UniverseCanvas: React.FC<UniverseProps> = (props) => {
  return (
    <div className="w-full h-full cursor-crosshair">
      <Canvas
        dpr={[1, 2]} // Support retina displays but cap at 2 for performance
        gl={{ antialias: false, powerPreference: "high-performance" }} // Let postprocessing handle AA if needed, but false is usually faster
      >
        <PerspectiveCamera makeDefault position={[0, 0, 800]} fov={45} />
        
        {/* Cinematic controls */}
        <OrbitControls 
          makeDefault
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={!props.focusedNodeId}
          autoRotateSpeed={0.5}
          enableDamping={true}
          dampingFactor={0.05} // Smooth physical inertia
          maxDistance={3000}
          minDistance={100}
          touches={{
            ONE: 1, // TOUCH.ROTATE
            TWO: 2, // TOUCH.DOLLY_PAN
          }}
        />

        <color attach="background" args={["#030303"]} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <Suspense fallback={null}>
          <UniverseParticles isFocused={!!props.focusedNodeId} />
          <UniverseForceGraph {...props} />
          
          <EffectComposer>
            <Bloom 
              luminanceThreshold={0.2} 
              luminanceSmoothing={0.9} 
              intensity={1.5}
            />
            <Noise opacity={0.02} />
            <Vignette eskil={false} offset={0.1} darkness={0.9} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
};
