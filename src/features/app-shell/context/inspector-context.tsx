"use client";

import React, { useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";

export const InspectorPortal: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.getElementById("inspector-portal-target");
    const defaultEl = document.getElementById("inspector-default-content");
    
    if (el) {
      setTarget(el);
      if (defaultEl) defaultEl.style.display = "none";
    }

    return () => {
      if (defaultEl) defaultEl.style.display = "flex";
    };
  }, []);

  if (!target) return null;
  return createPortal(children, target);
};
