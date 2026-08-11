"use client";

import React, { useMemo } from "react";
import { useAuthSpatial } from "../context/auth-spatial-context";
import { usePointerPhysics } from "@/lib/hooks/use-pointer-physics";
import { useSpring, SPRING_PRESETS } from "@/lib/hooks/use-spring";

export const SpatialAuthBackground: React.FC = () => {
  const { focusState, mode } = useAuthSpatial();
  
  // Track pointer for subtle parallax
  const pointer = usePointerPhysics(undefined, {
    global: true,
    maxDisplacement: 40,
    springConfig: SPRING_PRESETS.cinematic,
  });

  // Calculate target states based on focus
  const isConverging = focusState === "submitting" || focusState === "success";
  
  // Spring values for the global transformations
  const convergeProgress = useSpring(isConverging ? 1 : 0, SPRING_PRESETS.cinematic);
  const emailFocus = useSpring(focusState === "email" && !isConverging ? 1 : 0, SPRING_PRESETS.editorial);
  const passwordFocus = useSpring(focusState === "password" && !isConverging ? 1 : 0, SPRING_PRESETS.editorial);
  const signupMode = useSpring(mode === "signup" ? 1 : 0, SPRING_PRESETS.cinematic);

  // Generate static positions for the field so it doesn't remount randomly
  // Defer generation until client mount to prevent SSR hydration mismatches
  const [nodes, setNodes] = React.useState<any[]>([]);

  React.useEffect(() => {
    const generatedNodes = Array.from({ length: 400 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // span 0 to 100% width of the SVG
      size: Math.random() * 1.5 + 0.5,
      layer: Math.random() > 0.8 ? 1 : (Math.random() > 0.4 ? 2 : 3),
      duration: Math.random() * 15 + 10, // 10s to 25s
      delay: -(Math.random() * 30), // scatter them evenly across their animation timeline
      isFast: Math.random() > 0.9, 
    }));

    setNodes(generatedNodes);
  }, []);

  // Overall scale and opacity calculations
  const globalScale = 1 - (convergeProgress * 0.95); // shrinks toward center
  const globalOpacity = 1 - (convergeProgress * 0.8);
  const fieldBlur = convergeProgress * 10;

  // Render SVG background
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-background z-0 flex items-center justify-center">
      {/* Reduced-motion graceful degradation */}
      <style>{`
        @keyframes meteor-fall {
          0% { transform: translate(15vw, 0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(-15vw, 200vh); opacity: 0; }
        }
        @keyframes meteor-fall-fast {
          0% { transform: translate(25vw, 0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(-25vw, 200vh); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .spatial-layer { transform: none !important; }
          .meteor { animation: none !important; }
        }
      `}</style>
      
      <svg
        className="w-[120vw] h-[120vh] max-w-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible"
        style={{
          transform: `translate(-50%, -50%) scale(${globalScale})`,
          opacity: globalOpacity,
          filter: `blur(${fieldBlur}px)`,
        }}
      >
        <g 
          className="spatial-layer"
          style={{
            transform: `translate(${pointer.x * 0.5}px, ${pointer.y * 0.5}px)`,
            transition: 'transform 0.1s linear'
          }}
        >
          {/* Nodes */}
          {nodes.map((node) => {
            // Parallax based on layer depth
            const layerParallaxX = pointer.x * node.layer * 0.4;
            const layerParallaxY = pointer.y * node.layer * 0.4;

            const animationName = node.isFast ? 'meteor-fall-fast' : 'meteor-fall';
            const duration = node.isFast ? node.duration * 0.4 : node.duration;
            const baseOpacity = 0.2 + (node.layer * 0.15) + (node.isFast ? 0.3 : 0);

            return (
              <circle
                key={`node-${node.id}`}
                className="meteor"
                cx={`calc(${node.x}% + ${layerParallaxX}px)`}
                cy={`calc(0% + ${layerParallaxY}px)`}
                r={node.size}
                fill="currentColor"
                style={{
                  opacity: baseOpacity,
                  animation: `${animationName} ${duration}s linear ${node.delay}s infinite`
                }}
              />
            );
          })}
        </g>
      </svg>
      
      {/* Central dominant convergence point that appears on submit */}
      <div 
        className="absolute rounded-full bg-foreground shadow-[0_0_100px_30px_rgba(255,255,255,0.1)]"
        style={{
          width: '2px',
          height: '2px',
          opacity: convergeProgress,
          transform: `scale(${1 + convergeProgress * 200})`,
        }}
      />
    </div>
  );
};

export default SpatialAuthBackground;
