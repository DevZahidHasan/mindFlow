"use client";

import React, { createContext, useContext, useState } from "react";

export type AuthFocusState = "none" | "name" | "email" | "password" | "submitting" | "success";

interface AuthSpatialContextType {
  focusState: AuthFocusState;
  setFocusState: (state: AuthFocusState) => void;
  mode: "login" | "signup";
  setMode: (mode: "login" | "signup") => void;
}

const AuthSpatialContext = createContext<AuthSpatialContextType>({
  focusState: "none",
  setFocusState: () => {},
  mode: "login",
  setMode: () => {},
});

export const AuthSpatialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [focusState, setFocusState] = useState<AuthFocusState>("none");
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <AuthSpatialContext.Provider value={{ focusState, setFocusState, mode, setMode }}>
      {children}
    </AuthSpatialContext.Provider>
  );
};

export const useAuthSpatial = () => useContext(AuthSpatialContext);
