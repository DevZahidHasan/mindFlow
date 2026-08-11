"use client";

import React from "react";
import { AuthSpatialProvider, useAuthSpatial } from "../context/auth-spatial-context";
import { SpatialAuthBackground } from "./spatial-auth-background";
import { useSpring, SPRING_PRESETS } from "@/lib/hooks/use-spring";

export const SpatialAuthLayoutInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { focusState } = useAuthSpatial();
  
  const isConverging = focusState === "submitting" || focusState === "success";
  
  // Cinematic fade of the form itself when submitting
  const formOpacity = useSpring(isConverging ? 0 : 1, SPRING_PRESETS.cinematic);
  const formScale = useSpring(isConverging ? 0.95 : 1, SPRING_PRESETS.cinematic);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-6 relative overflow-hidden">
      <SpatialAuthBackground />

      <div 
        className="w-full max-w-sm flex flex-col gap-10 z-10 relative"
        style={{
          opacity: formOpacity,
          transform: `scale(${formScale}) translateY(${(1 - formScale) * -50}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const SpatialAuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthSpatialProvider>
      <SpatialAuthLayoutInner>{children}</SpatialAuthLayoutInner>
    </AuthSpatialProvider>
  );
};
